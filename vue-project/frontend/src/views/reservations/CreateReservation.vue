<template>
  <v-container fluid>
    <v-col>
      <v-row>
        <span class="text-h4">Nueva reserva</span>
      </v-row>
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
                        variant="outlined" class="ml-n3" :readonly="true">{{ formattedDate }}</v-text-field>
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
      <div v-if="isLoading" class="loader-overlay">
        <v-progress-circular indeterminate color="primary" size="50"></v-progress-circular>
      </div>
      <v-row class="mx-n7">
        <v-col v-if="!filteredSpaces.length && !isLoading" class="d-flex justify-center align-center mt-5">
          <span class="text-h4">No hay espacios disponibles para esos filtros de búsqueda</span>
        </v-col>
        <v-col v-else class="px-0">
          <v-container fluid>
            <v-row>
              <v-col v-for="space in filteredSpaces" :key="space._id" xl="3" lg="4" md="6" sm="12" xs="12">
                <v-card>
                  <v-img :src="space?.image" color="surface-variant" height="200px" cover></v-img>
                  <v-card-title class="text-h4 mb-1">{{ space?.name }}</v-card-title>
                  <v-card-text>
                    <v-row class="d-flex align-center">
                      <v-col>
                        <v-row class="d-flex align-center">
                          <v-col cols="1">
                            <v-icon size="small" icon="mdi-weather-sunny" />
                          </v-col>
                          <v-col><span class="text-h6">Abre:
                              {{ makeHoursAndMinutes(space?.opening) }}</span></v-col>
                        </v-row>
                      </v-col>
                      <v-col>
                        <v-row class="d-flex align-center">
                          <v-col cols="1">
                            <v-icon size="small" icon="mdi-weather-night" />
                          </v-col>
                          <v-col><span class="text-h6">Cierra:
                              {{ makeHoursAndMinutes(space?.closing) }}</span></v-col>
                        </v-row>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col>
                        <v-row>
                          <v-col cols="1" class="d-flex align-center">
                            <v-icon icon="mdi-timer-outline" size="small" />
                          </v-col>
                          <v-col>
                            <span class="pt-2 text-h6" v-if="space.duration < 60">Tiempos de: {{ space.duration }}
                              minutos</span>
                            <span class="pt-2 text-h6" v-if="space.duration == 60">Tiempos de: {{ space.duration / 60 }}
                              hora</span>
                            <span class="pt-2 text-h6" v-if="space.duration > 60">Tiempos de: {{ space.duration / 60 }}
                              horas</span>
                          </v-col>
                        </v-row>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col>
                        <v-row class="d-flex align-center">
                          <v-col cols="1">
                            <v-icon icon="mdi-table-chair" size="small" />
                          </v-col>
                          <v-col><span class="text-h6">Máx. {{ space?.seats }} asientos</span></v-col>
                        </v-row>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col>
                        <v-select :model-value="reservationTimes[space._id]?.reservationStartTime || null"
                          @update:model-value="val => updateReservation(space, 'reservationStartTime', val)"
                          :items="availableTimes[space._id]" label="Inicio" prepend-icon="mdi-timer-sand"
                          variant="outlined" density="compact" clearable />
                      </v-col>
                      <v-col>
                        <v-select :model-value="reservationTimes[space._id]?.reservationEndTime || null"
                          @update:model-value="val => updateReservation(space, 'reservationEndTime', val)"
                          :items="calcEndTimeOfSpace(space)" label="Final" prepend-icon="mdi-timer-sand-complete"
                          variant="outlined" density="compact" clearable
                          :disabled="!reservationTimes[space._id]?.reservationStartTime" />
                      </v-col>
                    </v-row>
                    <v-row class="mt-n6 mx-0 mb-2">
                      <v-fade-transition>
                        <v-alert v-if="reservationTimes[space._id]?.reservationNotAllowed" type="error"
                          icon="mdi-alert-outline" density="compact" variant="tonal">
                          Ya tiene una reserva a esa hora
                        </v-alert>
                      </v-fade-transition>

                      <v-fade-transition>
                        <v-alert v-if="reservationTimes[space._id]?.seatsLeft"
                          :type="reservationTimes[space._id].seatsLeft == space.seats ? 'success' : reservationTimes[space._id].seatsLeft > 3 ? 'warning' : 'error'"
                          icon="mdi-information-outline" density="compact" variant="tonal">
                          Quedan
                          {{ reservationTimes[space._id].seatsLeft }} asientos
                        </v-alert>
                      </v-fade-transition>
                    </v-row>
                  </v-card-text>
                  <v-card-actions class="mt-n6 mx-2 mb-2">
                    <TonalButton block class="" color="blue" text="Reservar"
                      :disabled="(!reservationTimes[space._id]?.reservationStartTime || !reservationTimes[space._id]?.reservationEndTime) || reservationTimes[space._id]?.reservationNotAllowed == true"
                      @click="createReservation(space)" />
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </v-col>
      </v-row>
    </v-col>
  </v-container>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import TonalButton from '@/components/TonalButton.vue';
import { spaceService } from '@/services/spaceService';
import { reservationService } from '@/services/reservationService';
import { useUserStore } from '@/store/userStore';
import { useSpaceStore } from '@/store/spaceStore';
import { useReservationStore } from '@/store/reservationStore';
import { useTime } from '@/composables/useTime';
import { useSpaceReservation } from '@/composables/useSpaceReservation'

// -----------------------------------------------------------------------------------------------------
// Instancias de router y stores
const router = useRouter();
const userStore = useUserStore();
const spaceStore = useSpaceStore();
const reservationStore = useReservationStore();

// Extraemos funciones del composable useTime
const {
  timeFrames,
  generateAllTimes,
  makeMinutes,
  makeHoursAndMinutes,
  parseToStringDate,
  parseToYYYYMMDD,
} = useTime();
// Cambiamos el label de la última duración del filtro para que incluya el 'o más'
// Ya que en timeFrames no lo incluye
timeFrames[timeFrames.length - 1].label = '3 horas o más';


// Reactive state
const spaces = ref([])
const filteredSpaces = ref([])
const reservationSeats = ref(1)
const date = ref(new Date())
const today = ref(new Date())
const formattedDate = ref(parseToStringDate(date.value))
const startTime = ref(null)
const durationSearched = ref(null)
const isLoading = ref(false)
const reservationsByDate = ref([])
const periodicReservations = ref([])

// Composable de lógica de reserva por espacio
const {
  reservationTimes,
  availableTimes,
  updateAvailableTimes,
  calcEndTimeOfSpace,
  updateReservation,
} = useSpaceReservation(reservationsByDate, periodicReservations, date)
// -----------------------------------------------------------------------------------------------------


// -----------------------------------------------------------------------------------------------------
// Hook onMounted
// -----------------------------------------------------------------------------------------------------
onMounted(async () => {
  // Llamamos a getSpaces para obtener los espacios al montar el componente
  await fetchSpaces();
  await fetchReservationsByDate();
  await fetchPeriodicReservations();
  updateAvailableTimes(spaces.value);
  filterSpaces();

  const calendarDate = reservationStore.getCalendarDate;

  if (calendarDate) {                     // Comprueba si hay una fecha guardada
    let [datePart, timePart] = calendarDate.split(" ");

    if (!timePart) {                      // Si solo tiene la fecha, guardamos la parte de la fecha
      date.value = new Date(datePart);
    } else {                              // Si tiene la fecha y la hora, guardamos ambas partes
      startTime.value = timePart;         // Guardar la hora en otra variable
      date.value = new Date(datePart);    // Guardar solo la fecha
    }
  }
});

// Fetch de espacios
async function fetchSpaces() {
  isLoading.value = true;
  try {
    const res = await spaceService.getSpaces();
    spaces.value = res.data.spaces;
    //updateAvailableTimes(spaces.value)
  } finally {
    isLoading.value = false;
  }
}

// Fetch de reservas por fecha
async function fetchReservationsByDate() {
  const parsed = parseToYYYYMMDD(formattedDate.value);
  const res = await reservationService.getReservationsByDate(parsed);
  reservationsByDate.value = res.data.reservations;
}

// Fetch de reservas periódicas
async function fetchPeriodicReservations() {
  const res = await reservationService.getPeriodicReservations();
  periodicReservations.value = res.data.periodicReservations;
}

// Filtra espacios según filtros globales
function filterSpaces() {
  isLoading.value = true;
  filteredSpaces.value = spaces.value.filter(space => {
    const slots = availableTimes[space._id] || [];
    if (!slots.length) return false;

    const okStart = !startTime.value || (
      makeHoursAndMinutes(space.opening) <= startTime.value &&
      makeHoursAndMinutes(space.closing) > startTime.value &&
      slots.includes(startTime.value)
    );

    const okDuration = !durationSearched.value || (
      space.duration <= durationSearched.value &&
      calcDurationAvailable(durationSearched.value, availableTimes[space._id], space));

    const okSeats = !reservationSeats.value || space.seats >= reservationSeats.value
    return okStart && okDuration && okSeats
  });

  isLoading.value = false;
}
// -----------------------------------------------------------------------------------------------------


// Verifica si existe un intervalo de tiempo disponible para la duración solicitada
const calcDurationAvailable = (duration, availableTimesForSpace, space) => {
  let hoursReserved = reservationStore.getHoursReservedBySpace(space._id) || [];
  const first = makeMinutes(availableTimesForSpace[0]);

  hoursReserved = hoursReserved?.filter(hour => hour.seatsReserved >= space.seats);

  if (!hoursReserved || hoursReserved.length === 0) {
    const total = space.closing - first;
    return total >= duration;
  }

  const allTimes = [];

  for (let minute = first; minute <= space.closing; minute += 15) {
    allTimes.push(minute);
  }

  let flag = false;
  for (let time of allTimes) {
    for (let hourReserved of hoursReserved) {
      if ((time + duration > space.closing)) {
        flag = false;
        break;
      }
      if (time >= hourReserved.startMinutes && time < hourReserved.endMinutes) {
        flag = false;
        break;
      }
      if (time >= hourReserved.endMinutes && time + duration >= hourReserved.endMinutes) {
        flag = true;
        continue;
      }

      if (time < hourReserved.startMinutes && time + duration <= hourReserved.startMinutes) {
        flag = true;
        break;
      }
      if (time < hourReserved.startMinutes && time + duration > hourReserved.startMinutes) {
        flag = false;
        break;
      }
      if (time === hourReserved.startMinutes && time + duration === hourReserved.endMinutes) {
        flag = false;
        break;
      }
    }
    if (flag) return true;
  }
  return false;
};
// -----------------------------------------------------------------------------------------------------


// -----------------------------------------------------------------------------------------------------
// Crea la reserva y redirige a la pantalla de confirmación de la reserva
// -----------------------------------------------------------------------------------------------------
const createReservation = async (space) => {
  const selectedDate = parseToYYYYMMDD(formattedDate.value);
  const startTimeString = reservationTimes[space._id].reservationStartTime;
  const endTimeString = reservationTimes[space._id].reservationEndTime;
  const startTimeObj = new Date(`${selectedDate}T${startTimeString}:00Z`);
  const endTimeObj = new Date(`${selectedDate}T${endTimeString}:00Z`);

  const reservation = {
    spaceId: space._id,
    userId: userStore.getId,
    startTime: startTimeObj.toISOString(),
    endTime: endTimeObj.toISOString(),
    seatsReserved: reservationSeats.value,
    repetition: "none",
  };

  reservationStore.setReservation(reservation);
  spaceStore.setSelectedSpace(space);
  router.push('/confirmReservation');
};
// -----------------------------------------------------------------------------------------------------


// -----------------------------------------------------------------------------------------------------
// Watchers
// -----------------------------------------------------------------------------------------------------
watch(date, async (newVal) => {
  formattedDate.value = parseToStringDate(newVal);
  await fetchReservationsByDate();
  await fetchPeriodicReservations();
  updateAvailableTimes(spaces.value);
  filterSpaces();
  reservationStore.clearStore();
  Object.keys(reservationTimes).forEach(id => delete reservationTimes[id]);
})
watch(startTime, filterSpaces)
watch(durationSearched, filterSpaces)
watch(reservationSeats, filterSpaces)
// -----------------------------------------------------------------------------------------------------

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
