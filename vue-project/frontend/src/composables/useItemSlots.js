// composables/useItemSlots.js
import { computed, reactive, watch, isRef, ref } from 'vue';
import { useTime } from '@/composables/useTime';
import { useUserStore } from '@/store/userStore';

/**
 * @param {Ref<Object>}   itemConfig           // { opening, closing, duration, capacity, id }
 * @param {Ref<Date>}     reservationDate
 * @param {Ref<Array>}    reservationsByDate   // array de reservas puntuales
 * @param {Ref<Array>}    periodicReservations // array de reservas periódicas
 * @param {Object|null}   initialReservation   // para edición
 * @param {Function}      calcUsedUnits        // (r, t) ⇒ nº unidades usadas por "r" en minuto t
 */
export function useItemSlots({
  itemConfig,
  reservationDate,
  reservationsByDate,
  periodicReservations,
  initialReservation = null,
  calcUsedUnits, // ej. (r,t)=> r.seatsReserved  o  ()=>0 para materiales
  foreignKey, // parámetro: 'spaceId' o 'materialId'
}) {
  const {
    makeMinutesFromIsoLocal,
    makeMinutes,
    makeHoursAndMinutes,
    occursOn,
    isToday,
  } = useTime();

  const userStore = useUserStore();
  const initRef = isRef(initialReservation)
    ? initialReservation
    : ref(initialReservation);
  let ignoreId = initRef.value?._id;

  // reactive para los selects de inicio/fin
  const reservationTimes = reactive({ start: null, end: null });

  watch(
    initRef,
    (ni) => {
      if (ni) {
        reservationTimes.start = makeHoursAndMinutes(
          makeMinutesFromIsoLocal(ni.startTime)
        );
        reservationTimes.end = makeHoursAndMinutes(
          makeMinutesFromIsoLocal(ni.endTime)
        );
        ignoreId = ni._id;
      }
    },
    { immediate: true }
  );

  // 1) Todas las reservas (reales + periódicas) normalizadas
  const allReservations = computed(() => {
    if (!itemConfig.value || !itemConfig.value.id) {
      return []; // no generamos nada
    }

    const arr = [];
    const itemId = itemConfig.value.id;
    const today0 = new Date(reservationDate.value);
    today0.setHours(0, 0, 0, 0);

    //console.log(reservationsByDate.value);

    // puntuales
    reservationsByDate.value.forEach((r) => {
      if (r[foreignKey] !== itemId) return;
      const s = makeMinutesFromIsoLocal(r.startTime);
      const e = makeMinutesFromIsoLocal(r.endTime);
      arr.push({ ...r, start: s, end: e });
    });

    // periódicas
    periodicReservations.value.forEach((pr) => {
      if (pr[foreignKey] !== itemId) return;
      if (!occursOn(pr, today0)) return;
      const s = makeMinutesFromIsoLocal(pr.startTime);
      const e = makeMinutesFromIsoLocal(pr.endTime);
      // evita duplicados user+slot
      if (
        arr.some((x) => x.userId === pr.userId && x.start === s && x.end === e)
      )
        return;
      arr.push({ ...pr, start: s, end: e });
    });

    //console.log('Reservas:', arr);

    return arr;
  });

  // 2) Genera todos los instantes de 15’ con unitsLeft y flag de propio user
  const allSlots = computed(() => {
    if (!itemConfig.value || !itemConfig.value.id) {
      return []; // no generamos nada
    }

    const { opening, closing } = itemConfig.value;
    const cap = itemConfig.value.capacity;
    const interval = 15;
    const res = allReservations.value;
    const meId = initRef.value?.userId || userStore.getId;
    const list = [];

    //console.log('itemConfig.value:', itemConfig.value);

    for (let t = opening; t <= closing; t += interval) {
      //console.log('Entra');

      const used = res
        .filter((r) => {
          //console.log('Asientos usados:', calcUsedUnits(r, t));
          return r._id !== ignoreId && r.start <= t && t < r.end;
        })
        .reduce((sum, r) => sum + calcUsedUnits(r, t), 0);
      const byMe = res.some(
        (r) =>
          r._id !== ignoreId && r.userId === meId && r.start <= t && t < r.end
      );

      list.push({
        minutes: t,
        time: makeHoursAndMinutes(t),
        unitsLeft: Math.max(cap - used, 0),
        reservedByMe: byMe,
      });
    }
    //console.log(list);

    return list;
  });

  // 3) Slots de inicio disponibles
  const availableStartTimes = computed(() => {
    if (!allSlots.value.length) return [];

    const { duration, closing } = itemConfig.value;
    const interval = 15;
    const slots = allSlots.value;
    const now = new Date();
    const nowM = now.getHours() * 60 + now.getMinutes();

    return slots
      .filter((s, idx) => {
        if (s.minutes + duration > closing) return false;
        if (isToday(reservationDate.value) && s.minutes < nowM) return false;
        // chequear cada sub-slot del bloque
        for (let k = 0; k < duration / interval; k++) {
          const sub = slots[idx + k];
          if (!sub || sub.unitsLeft <= 0) return false;
        }
        return true;
      })
      .map((s) => s.time);
  });

  // 4) Slots de fin en múltiplos de duration
  const availableEndTimes = computed(() => {
    if (!reservationTimes.start) return [];
    const startMin = makeMinutes(reservationTimes.start);
    const { duration, closing } = itemConfig.value;
    const slots = allSlots.value;
    const ends = [];

    for (let e = startMin + duration; e <= closing; e += duration) {
      const block = slots.filter((x) => x.minutes >= startMin && x.minutes < e);
      if (block.some((x) => x.unitsLeft === 0)) break;
      const f = slots.find((x) => x.minutes === e);
      ends.push(f ? f.time : makeHoursAndMinutes(e));
    }
    return ends;
  });

  // 5) Máximo unidades (mínimo unitsLeft en [start,end))
  const maxAllowed = computed(() => {
    if (!itemConfig.value || !itemConfig.value.id) {
      return []; // no generamos nada
    }

    if (!reservationTimes.start || !reservationTimes.end) {
      return itemConfig.value.capacity;
    }
    const start = makeMinutes(reservationTimes.start);
    const end = makeMinutes(reservationTimes.end);
    const slice = allSlots.value.filter(
      (s) => s.minutes >= start && s.minutes < end
    );
    if (!slice.length) return itemConfig.value.capacity;
    if (slice.some((s) => s.reservedByMe)) return 0;
    return slice.reduce(
      (mn, s) => Math.min(mn, s.unitsLeft),
      itemConfig.value.capacity
    );
  });

  // actualizar start/end
  function updateReservation(key, val) {
    if (!itemConfig.value || !itemConfig.value.id) {
      return []; // no generamos nada
    }

    if (key === 'start') {
      reservationTimes.start = val;
      reservationTimes.end = null;
    } else {
      reservationTimes.end = val;
    }
  }

  return {
    reservationTimes,
    availableStartTimes,
    availableEndTimes,
    maxAllowed,
    updateReservation,
    allSlots,
  };
}
