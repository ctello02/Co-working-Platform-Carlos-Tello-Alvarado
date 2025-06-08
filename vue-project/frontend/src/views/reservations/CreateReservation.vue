<template>
  <v-container fluid>
    <v-col>
      <v-row>
        <span class="text-h4">Nueva reserva</span>
      </v-row>

      <!-- Filtros generales -->
      <v-row>
        <v-card class="pa-2 mt-4 mb-n3" width="100%">
          <v-card-text class="d-flex justify-space-between mb-n5 flex-wrap">
            <v-col xl="3" lg="3" md="4" sm="12" xs="12">
              <v-row>
                <span class="text-h6">Seleccione una fecha</span>
              </v-row>
              <v-row>
                <v-col>
                  <v-menu :close-on-content-click="false" location="bottom" transition="slide-y-transition">
                    <template v-slot:activator="{ props }">
                      <v-text-field density="compact" prepend-icon="mdi-calendar-month-outline" v-bind="props"
                        variant="outlined" class="ml-n3" :readonly="true">{{
                          formattedDate }}</v-text-field>
                    </template>
                    <v-date-picker class="ml-10" :min-date="new Date()" is-required v-model="date" />
                  </v-menu>
                </v-col>
              </v-row>
            </v-col>
            <v-col xl="3" lg="3" md="5" sm="12" xs="12">
              <v-row>
                <span class="text-h6">¿Hora de inicio?</span>
              </v-row>
              <v-row>
                <v-col>
                  <v-select v-model="startTime" :items="generateAllTimes()" label="Inicio" prepend-icon="mdi-timer-sand"
                    variant="outlined" density="compact" class="ml-n3" clearable />
                </v-col>
              </v-row>
            </v-col>
            <v-col xl="3" lg="3" md="5" sm="12" xs="12">
              <v-row>
                <span class="text-h6">¿Duración?</span>
              </v-row>
              <v-row>
                <v-col>
                  <v-select v-model="durationSearched" :items="timeFrames" item-title="label" item-value="value"
                    label="Duración" prepend-icon="mdi-timer-outline" variant="outlined" density="compact" class="ml-n3"
                    clearable />
                </v-col>
              </v-row>
            </v-col>
            <v-col xl="3" lg="3" md="5" sm="12" xs="12">
              <v-row>
                <span class="text-h6">¿Número de asientos?</span>
              </v-row>
              <v-row>
                <v-col>
                  <v-text-field v-model.number="reservationSeats" label="Número de asientos"
                    prepend-icon="mdi-table-chair" type="number" variant="outlined" density="compact" required
                    @input="reservationSeats = Math.max(1, reservationSeats)" />
                </v-col>
              </v-row>
            </v-col>
          </v-card-text>
        </v-card>
      </v-row>

      <!-- Loader -->
      <div v-if="isLoading" class="loader-overlay">
        <v-progress-circular indeterminate color="primary" size="50"></v-progress-circular>
      </div>

      <!-- Espacios filtrados -->
      <v-row class="mt-6" v-if="!filteredSpaces.length && !isLoading">
        <v-col class="text-center">
          <span class="text-h5">No hay espacios disponibles con estos filtros</span>
        </v-col>
      </v-row>
      <v-row class="mt-6 mx-n6" v-else>
        <v-col v-for="spc in filteredSpaces" :key="spc._id" cols="12" md="6" lg="4">
          <v-card>
            <v-img :src="spc.image" height="200px" cover />
            <v-card-title class="text-h4 mb-n1">{{ spc.name }}</v-card-title>
            <v-card-text>
              <div class="d-flex align-center ga-2">
                <v-icon style="color: #4f5b66">mdi-clock-outline</v-icon>
                <span class="text-h6" style="color: #4f5b66">
                  Abre: {{ makeHoursAndMinutes(spc.opening) }} —
                  Cierra: {{ makeHoursAndMinutes(spc.closing) }}
                </span>
              </div>
              <div class="d-flex align-center ga-2">
                <v-icon style="color: #4f5b66">mdi-table-chair</v-icon>
                <span class="text-h6" style="color: #4f5b66">
                  Capacidad: {{ spc.seats }} asientos
                </span>
              </div>
              <div class="d-flex align-center ga-2">
                <v-icon style="color: #4f5b66">mdi-timer-outline</v-icon>
                <span class="text-h6" style="color: #4f5b66" v-if="spc.duration < 60">Tiempos de: {{ spc.duration }}
                  minutos</span>
                <span class="text-h6" style="color: #4f5b66" v-if="spc.duration == 60">Tiempos de: {{ spc.duration / 60
                }}
                  hora</span>
                <span class="text-h6" style="color: #4f5b66" v-if="spc.duration > 60">Tiempos de: {{ spc.duration / 60
                }}
                  horas</span>
              </div>
            </v-card-text>

            <v-divider />

            <!-- Selectores siempre visibles -->
            <v-card-text>
              <v-row>
                <v-col>
                  <v-select :model-value="slotsBySpace[spc._id].reservationTimes.start"
                    @update:model-value="val => slotsBySpace[spc._id].updateReservation('start', val)"
                    :items="slotsBySpace[spc._id].availableStartTimes" label="Inicio" prepend-icon="mdi-timer-sand"
                    variant="outlined" density="compact" clearable />
                </v-col>
                <v-col>
                  <v-select :model-value="slotsBySpace[spc._id].reservationTimes.end"
                    @update:model-value="val => slotsBySpace[spc._id].updateReservation('end', val)"
                    :items="slotsBySpace[spc._id].availableEndTimes" label="Fin" prepend-icon="mdi-timer-sand-complete"
                    :disabled="!slotsBySpace[spc._id].reservationTimes.start" variant="outlined" density="compact"
                    clearable />
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12">
                  <v-alert class="mt-n8 mb-12" v-if="slotsBySpace[spc._id].reservationTimes.end
                    && slotsBySpace[spc._id].maxSeatsAllowed === 0" type="error" variant="tonal" density="compact">
                    Ya tienes una reserva en ese horario
                  </v-alert>
                  <v-alert class="mt-n8 mb-12" v-else-if="slotsBySpace[spc._id].reservationTimes.end" :type="slotsBySpace[spc._id].maxSeatsAllowed >= reservationSeats
                    ? 'success'
                    : 'error'
                    " density="compact" variant="tonal">
                    Quedan {{ slotsBySpace[spc._id].maxSeatsAllowed }} asientos
                  </v-alert>
                </v-col>
              </v-row>
            </v-card-text>

            <v-card-actions class="mt-n14 mx-2 mb-2">
              <TonalButton block color="blue" text="Reservar" :disabled="!slotsBySpace[spc._id].reservationTimes.start ||
                !slotsBySpace[spc._id].reservationTimes.end ||
                slotsBySpace[spc._id].maxSeatsAllowed < reservationSeats
                " @click="createReservation(spc)" />
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-col>
  </v-container>
</template>

<script setup>
import { ref, watch, onMounted, computed, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useSpaceStore } from '@/store/spaceStore';
import { useUserStore } from '@/store/userStore';
import { useReservationStore } from '@/store/reservationStore';
import { reservationService } from '@/services/reservationService';
import { spaceService } from '@/services/spaceService';
import { useTime } from '@/composables/useTime';
import { useReservationSlots } from '@/composables/useReservationSlots';
import TonalButton from '@/components/TonalButton.vue';

const router = useRouter();
const spaceStore = useSpaceStore();
const userStore = useUserStore();
const reservationStore = useReservationStore();

// helpers de tiempo
const {
  timeFrames,
  generateAllTimes,
  parseToStringDate,
  parseToYYYYMMDD,
  makeMinutes,
  makeHoursAndMinutes
} = useTime();

// Estado general
const spaces = ref([]);
const filteredSpaces = ref([]);
const date = ref(new Date());
const formattedDate = ref(parseToStringDate(date.value));
const startTime = ref(null);
const initialLoad = ref(false);
const durationSearched = ref(null);
const reservationSeats = ref(1);
const isLoading = ref(false);
const reservationsByDate = ref([]);
const periodicReservations = ref([]);

// Diccionario de slots por espacio
const slotsBySpace = reactive({});

// Cada vez que cambiamos fecha, recargamos datos y slots
watch(date, () => {
  formattedDate.value = parseToStringDate(date.value);
  if (initialLoad.value) {
    startTime.value = null;
  }
  // Marcamos que ya pudo cargar la hora inicial de la store
  // El problema es que se inicializaba a null aunque hubiese una hora en la store
  initialLoad.value = true;
  loadDayData();
});

onMounted(async () => {
  spaces.value = (await spaceService.getSpaces()).data.spaces;
  await loadDayData();

  const calendarDate = reservationStore.getCalendarDate;
  if (calendarDate) {
    const [datePart, timePart] = calendarDate.split(' ');
    date.value = new Date(datePart);
    if (timePart) {
      startTime.value = timePart;
    }
  }
});

// Cada vez que cambian filtros, actualizamos lista
watch([startTime, durationSearched, reservationSeats], filterSpaces);

// Función que carga reservas y reconstruye slots por espacio
async function loadDayData() {
  isLoading.value = true;
  const day = parseToYYYYMMDD(formattedDate.value);

  let oneShot = [];
  try {
    const d1 = await reservationService.getReservationsByDate(day);
    oneShot = d1.data.reservations || [];
  } catch (e) {
    if (e.response?.status === 404) {
      // no hay reservas: lo tomamos como un array vacío
      oneShot = [];
    } else throw e;

  }
  reservationsByDate.value = oneShot;

  let periodic = [];
  try {
    const d2 = await reservationService.getPeriodicReservations();
    periodic = d2.data.periodicReservations || [];
  } catch (e) {
    if (e.response?.status === 404) {
      // no hay reservas periódicas: lo tomamos como un array vacío
      periodic = [];
    } else throw e;
  }
  periodicReservations.value = periodic;

  // Inicializa slots para cada espacio
  spaces.value.forEach(spc => {
    slotsBySpace[spc._id] = useReservationSlots({
      space: computed(() => spaces.value.find(s => s._id === spc._id)),
      reservationDate: date,
      reservationsByDate,
      periodicReservations,
      initialReservation: null
    });
  });

  filterSpaces();
  isLoading.value = false;
}

// Filtra espacios con los criterios actuales
function filterSpaces() {
  filteredSpaces.value = spaces.value.filter(spc => {
    // Si no hay filtro de hora/duración/asientos, mostrar todos
    if (!startTime.value && !durationSearched.value && !reservationSeats.value) {
      return true;
    }

    //---------------------------------------------------------------------------------
    const st = startTime.value
      ? makeMinutes(startTime.value)
      : null;

    const startOk = st == null
      ? true
      : slotsBySpace[spc._id].availableStartTimes.some(s => s === startTime.value);
    //---------------------------------------------------------------------------------

    //---------------------------------------------------------------------------------
    const seatsOk = !reservationSeats.value || spc.seats >= reservationSeats.value;
    //---------------------------------------------------------------------------------

    //---------------------------------------------------------------------------------
    const slots = slotsBySpace[spc._id].allSlots;
    const durationOk = !durationSearched.value ||
      (spc.duration <= durationSearched.value &&
        calcDurationAvailable(slots, durationSearched.value));
    //---------------------------------------------------------------------------------

    return startOk && seatsOk && durationOk;
  });
};

function calcDurationAvailable(slots, duration) {
  const interval = 15;                          // Cada slot es de 15 min
  const needed = Math.ceil(duration / interval);// Cuántos slots consecutivos hacen falta para cubrir la duración

  // Recorremos todos los posibles inicios de bloque
  // hasta slots.length - needed, para que quepa needed slots y no sobrepase el array cuando i = slots.length - needed
  for (let i = 0; i <= slots.length - needed; i++) {
    // Extraemos un bloque de tamaño needed
    // slots[i], slots[i+1], ..., slots[i+needed-1]
    const block = slots.slice(i, i + needed);

    // Verificamos que todos los slots del bloque tengan asientos libres
    const allFree = block.every(slot => slot.seatsLeft > 0);
    if (allFree) return true; // Si este bloque tiene asientos y es válido, devolvemos true

    // Si no, seguimos buscando en el siguiente índice
  }
  // Si hemos recorrido todo sin encontrar bloque, devolvemos false
  return false;
}

// Crea y guarda la reserva, y redirige

async function createReservation(spc) {
  const day = parseToYYYYMMDD(formattedDate.value);
  const start = slotsBySpace[spc._id].reservationTimes.start;
  const end = slotsBySpace[spc._id].reservationTimes.end;
  const startISO = new Date(`${day}T${start}:00Z`).toISOString();
  const endISO = new Date(`${day}T${end}:00Z`).toISOString();

  const payload = {
    spaceId: spc._id,
    userId: userStore.getId,
    startTime: startISO,
    endTime: endISO,
    seatsReserved: reservationSeats.value,
    repetition: 'none'
  };

  reservationStore.setReservation(payload);
  spaceStore.setSelectedSpace(spc);
  router.push('/confirmReservation');
}
</script>
<style scoped>
.loader-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}
</style>
