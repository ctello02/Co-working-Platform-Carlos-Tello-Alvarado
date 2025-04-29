import { reactive, computed, isRef, watch, ref, toRaw } from 'vue';
import { useTime } from '@/composables/useTime';
import { useUserStore } from '@/store/userStore';

/**
 * Composable unificado para manejo de franjas y asientos de reserva,
 * reutilizable tanto en creación como en edición.
 *
 * @param {Ref<Space>} space - espacio a reservar
 * @param {Ref<Date>} reservationDate - fecha seleccionada para la reserva
 * @param {Ref<Reservation[]>} reservationsByDate - reservas puntuales del día
 * @param {Ref<PeriodicReservation[]>} periodicReservations - reservas periódicas existentes
 * @param {Object} [initialReservation] - reserva existente en modo edición
 * @returns {{ reservationTimes, availableStartTimes, availableEndTimes, maxSeatsAllowed, updateReservation }}
 */
export function useReservationSlots({
  space,
  reservationDate,
  reservationsByDate,
  periodicReservations,
  initialReservation = null,
}) {
  const userStore = useUserStore();
  const {
    makeMinutesFromIsoLocal,
    makeMinutes,
    makeHoursAndMinutes,
    occursOn,
    getHoursAndMinsFromDate,
    isToday,
  } = useTime();

  const initRef = isRef(initialReservation)
    ? initialReservation
    : ref(initialReservation);
  let ignoreId = initRef?._id;

  const reservationTimes = reactive({ start: null, end: null });

  watch(
    initRef,
    (newInit) => {
      if (newInit) {
        reservationTimes.start = getHoursAndMinsFromDate(newInit.startTime);
        reservationTimes.end = getHoursAndMinsFromDate(newInit.endTime);
        ignoreId = newInit._id;
      }
    },
    { immediate: true }
  );

  // Combina reservas normales y periódicas en un array plano
  const allReservations = computed(() => {
    const arr = [];

    // Ocurrencias normales
    reservationsByDate.value.forEach((r) => {
      if (r.spaceId !== space.value._id) return;
      const start = makeMinutesFromIsoLocal(r.startTime);
      const end = makeMinutesFromIsoLocal(r.endTime);
      arr.push({
        id: r._id,
        user: r.userId,
        start,
        end,
        seats: r.seatsReserved,
      });
    });

    // Periódicas
    periodicReservations.value.forEach((pr) => {
      if (pr.spaceId !== space.value._id) return;
      if (!occursOn(pr, new Date(reservationDate.value))) return;
      const start = makeMinutesFromIsoLocal(pr.startTime);
      const end = makeMinutesFromIsoLocal(pr.endTime);
      if (
        // Si hay reserva con el mismo usuario y horario, significa que hay ocurrencias de la periodicReservation
        arr.some(
          (x) => x.user === pr.userId && x.start === start && x.end === end
        )
      )
        return;

      arr.push({
        id: pr._id,
        user: pr.userId,
        start,
        end,
        seats: pr.seatsReserved,
      });
    });
    return arr;
  });

  // Genera todos los slots del día con asientos libres y flag para saber si está reservado por el propio usuario
  const allSlots = computed(() => {
    const { opening, closing, seats: capacity } = space.value;
    const interval = 15;
    const res = allReservations.value;
    const reservationUserId = initRef.value?.userId || userStore.getId;

    const list = [];

    for (let t = opening; t <= closing; t += interval) {
      const used = res // Variable para sumar los asientos que hay reservados a una hora
        .filter(
          (r) =>
            r.id !== ignoreId && // Si es la misma reserva que la que se está editando, no se suman los asientos
            r.start <= t && // Si la reserva buscada no entra en la hora que se está mirando (t), no se suma nada
            t < r.end
        )
        .reduce((sum, r) => sum + r.seats, 0); // Se suman todos los asientos de las reservas encontradas a esa hora (t)

      const otherReservationByUser = res.some(
        // Buscamos algún slot que esté reservado por el usuario
        (r) =>
          r.id !== ignoreId && // No se puede mirar la reserva que se está editando
          r.user === reservationUserId && // Si coinciden los userId de la reserva que se está editando y la que se está mirando
          r.start <= t &&
          t < r.end
      );

      list.push({
        minutes: t,
        time: makeHoursAndMinutes(t),
        seatsLeft: Math.max(capacity - used, 0), //Devuelve la diferencia del total menos los asientos reservados. Dando lugar a los asientos que hay disponibles a esa hora
        otherReservationByUser,
      });
    }
    return list;
  });

  // Slots disponibles de inicio
  const availableStartTimes = computed(() => {
    const dur = space.value.duration;
    const interval = 15;
    const slots = allSlots.value;
    const today = new Date();
    const nowMin = today.getHours() * 60 + today.getMinutes();

    return slots
      .filter((s, idx) => {
        if (s.minutes + dur > space.value.closing) return false; // Que no se pase del cierre
        if (isToday(reservationDate.value) && s.minutes < nowMin) return false; // Solo puede devolver los slots de fechas siguientes y de minutos siguientes (teniendo como referencia a la fecha de hoy)

        // A continuación, se comprueba si hay un slot que no esté reservado y tenga asientos libres
        for (let k = 0; k < dur / interval; k++) {
          const sub = slots[idx + k];
          if (!sub || sub.seatsLeft <= 0) return false;
        }

        return true;
      })
      .map((s) => s.time);
  });

  // Slots posibles de fin, a partir del `start`
  const availableEndTimes = computed(() => {
    if (!reservationTimes.start) return [];
    const startMin = makeMinutes(reservationTimes.start);

    const dur = space.value.duration;
    const slots = allSlots.value;
    const ends = [];

    for (let t = startMin + dur; t <= space.value.closing; t += dur) {
      const sub = slots.filter((x) => x.minutes >= startMin && x.minutes < t); // Cogemos los que son posteriores al tiempo de inicio seleccionado y anteriores a la fecha de cierre
      if (sub.some((x) => x.seatsLeft === 0)) break; // Si alguno de esos slots no tiene asientos libres, se deja de buscar
      const found = slots.find((x) => x.minutes === t);
      ends.push(found ? found.time : makeHoursAndMinutes(t));
    }
    return ends;
  });

  // Máximo de asientos permitidos en el rango [start,end)
  const maxSeatsAllowed = computed(() => {
    if (!reservationTimes.start || !reservationTimes.end)
      return space.value.seats;

    const start = makeMinutes(reservationTimes.start);
    const end = makeMinutes(reservationTimes.end);

    const slice = allSlots.value.filter(
      (s) => s.minutes >= start && s.minutes < end
    );
    if (!slice.length) return space.value.seats;
    // si ya hay una reserva propia en ese gap, bloqueo
    if (
      slice.some(
        (s) => s.otherReservationByUser === true && s.id !== (ignoreId || null)
      )
    )
      return 0;

    return slice.reduce(
      (mn, s) => Math.min(mn, s.seatsLeft),
      space.value.seats
    );
  });

  // Actualiza tiempos y reinicia `end` al cambiar `start`
  function updateReservation(key, val) {
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
    maxSeatsAllowed,
    updateReservation,
    allSlots,
  };
}
