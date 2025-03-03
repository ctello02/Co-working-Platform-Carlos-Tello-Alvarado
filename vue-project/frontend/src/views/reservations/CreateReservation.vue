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
                          :items="calcEndTimeOfSpace(space)" item-title="label" item-value="value" label="Final"
                          prepend-icon="mdi-timer-sand-complete" variant="outlined" density="compact" clearable
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
import { ref, reactive, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import TonalButton from '@/components/TonalButton.vue';
import { spaceService } from '@/services/spaceService';
import { reservationService } from '@/services/reservationService';
import { useUserStore } from '@/store/userStore';
import { useSpaceStore } from '@/store/spaceStore';
import { useReservationStore } from '@/store/reservationStore';
import { useTime } from '@/composables/useTime';

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
  getHoursAndMinsFromDate,
  parseToStringDate,
  parseToYYYYMMDD
} = useTime();
// Cambiamos el label de la última duración del filtro para que incluya el 'o más'
// Ya que en timeFrames no lo incluye
timeFrames[timeFrames.length - 1].label = '3 horas o más';


// Variables reactivas
const spaces = ref([]);
const filteredSpaces = ref([]);
const reservationTimes = reactive({});
const reservationSeats = ref(1);
const reservationsByDate = ref([]);

const date = ref(new Date());
const formattedDate = ref(parseToStringDate(new Date()));

const startTime = ref(null);
const durationSearched = ref(null);

const availableTimes = reactive({});
const isLoading = ref(false);

/* ------------------------- Ciclo de vida ------------------------- */
onMounted(() => {
  // Llamamos a getSpaces para obtener los espacios al montar el componente
  getSpaces();
});


/* ------------------------- Funciones del componente ------------------------- */
// Obtiene los espacios a través del servicio
const getSpaces = () => {
  spaceService.getSpaces()
    .then(res => {
      spaces.value = res.data.spaces;
      filterSpaces();
    })
    .catch(error => {
      console.error(error);
    });
};

// Obtiene las reservas para la fecha seleccionada
const getReservationsByDate = async (dateParam) => {
  const parsedDate = parseToYYYYMMDD(dateParam);
  try {
    const response = await reservationService.getReservationsByDate(parsedDate);
    reservationsByDate.value = response.data.reservations;
  } catch (error) {
    console.error(error);
  }
};

// Actualiza los horarios disponibles de cada espacio
const updateAvailableTimes = () => {
  const today = new Date();
  const todayInMinutes = today.getHours() * 60 + today.getMinutes();

  const dateSelected = new Date(date.value);
  dateSelected.setHours(0, 0, 0, 0);

  spaces.value.forEach(space => {
    const temp = calcStartTimeOfSpace(space);
    if (dateSelected > today) {
      availableTimes[space._id] = temp;
    } else {
      availableTimes[space._id] = temp.filter(spaceTime => makeMinutes(spaceTime) > todayInMinutes);
    }
  });
};

// Actualiza los datos de reserva para un espacio
const updateReservation = (space, key, value) => {
  if (!reservationTimes[space._id]) {
    reservationTimes[space._id] = { reservationStartTime: null, reservationEndTime: null, seatsLeft: null, reservationNotAllowed: false };
  }

  reservationTimes[space._id][key] = value;

  if (key === 'reservationStartTime') {
    reservationTimes[space._id].reservationEndTime = null;
    reservationTimes[space._id].reservationNotAllowed = false;
  }

  if (key === 'reservationEndTime' && value != null) {
    calcSeatsAllowed(space);
    calcReservationAllowed(space);
  }

  if (value == null) {
    reservationTimes[space._id].seatsLeft = null;
    reservationTimes[space._id].reservationNotAllowed = false;
  }
};

// Calcula la cantidad de asientos disponibles según las reservas existentes
const calcSeatsAllowed = (space) => {
  let hoursReserved = reservationStore.getHoursReservedBySpace(space._id) || [];
  if (!hoursReserved || hoursReserved.length === 0) {
    reservationTimes[space._id].seatsLeft = space.seats;
    return;
  }

  const start = makeMinutes(reservationTimes[space._id].reservationStartTime);
  const end = makeMinutes(reservationTimes[space._id].reservationEndTime);
  let max = 0;

  hoursReserved.forEach(res => {
    const startReservation = res.startMinutes;
    const endReservation = res.endMinutes;
    if (
      (start < startReservation && end <= startReservation) ||
      (start >= endReservation && end > endReservation)
    ) {
      return;
    }
    if (res.seatsReserved > max) {
      max = res.seatsReserved;
    }
  });

  reservationTimes[space._id].seatsLeft = space.seats - max;
};

// Valida si se permite la reserva según las reservas del usuario
const calcReservationAllowed = (space) => {
  const events = reservationsByDate.value.filter(reservation =>
    reservation.spaceId === space._id && reservation.userId === userStore.getId
  );

  if (events && events.length > 0) {
    const selectedDate = parseToYYYYMMDD(formattedDate.value);
    const startTimeString = reservationTimes[space._id].reservationStartTime;
    const endTimeString = reservationTimes[space._id].reservationEndTime;

    const selectedStartTime = new Date(`${selectedDate}T${startTimeString}:00Z`).toUTCString();
    const selectedEndTime = new Date(`${selectedDate}T${endTimeString}:00Z`).toUTCString();

    for (let ev of events) {
      const evStartTime = new Date(ev.startTime).toUTCString();
      const evEndTime = new Date(ev.endTime).toUTCString();
      if (
        (selectedStartTime < evStartTime && selectedEndTime <= evStartTime) ||
        (selectedStartTime >= evEndTime && selectedEndTime > evEndTime)
      ) {
        reservationTimes[space._id].reservationNotAllowed = false;
      } else {
        reservationTimes[space._id].reservationNotAllowed = true;
        reservationTimes[space._id].seatsLeft = null;
        return;
      }
    }
  }

  reservationTimes[space._id].reservationNotAllowed = false;
};

// Filtra los espacios en función de varios criterios (horario, duración, asientos)
const filterSpaces = async () => {
  isLoading.value = true;
  if (!reservationsByDate.value || reservationsByDate.value.length === 0) {
    await getReservationsByDate(formattedDate.value);
  }
  updateAvailableTimes();

  filteredSpaces.value = spaces.value.filter(space => {
    const isAvailable = availableTimes[space._id] || [];
    if (isAvailable.length === 0) return false;

    const matchesStartTime = startTime.value == null ||
      (makeHoursAndMinutes(space.opening) <= startTime.value &&
        makeHoursAndMinutes(space.closing) > startTime.value &&
        availableTimes[space._id].includes(startTime.value));

    const matchesDuration = durationSearched.value == null ||
      (space.duration <= durationSearched.value &&
        calcDurationAvailable(durationSearched.value, availableTimes[space._id], space));

    const matchesSeats = reservationSeats.value == null || space.seats >= reservationSeats.value;

    return matchesStartTime && matchesDuration && matchesSeats;
  });
  isLoading.value = false;
};

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

// Calcula el inicio de los intervalos disponibles para un espacio
const calcStartTimeOfSpace = (space) => {
  return calcFrameTimesOfSpace(space, space.opening, space.closing, 15, space.duration, true);
};

// Calcula el final de los intervalos disponibles a partir del inicio seleccionado
const calcEndTimeOfSpace = (space) => {
  if (reservationTimes[space._id] != null && reservationTimes[space._id].reservationStartTime != undefined) {
    const start = makeMinutes(reservationTimes[space._id].reservationStartTime);
    return calcFrameTimesOfSpace(space, start + space.duration, space.closing, space.duration, space.duration, false);
  }
};

// Calcula los intervalos (frames) de tiempo disponibles para un espacio
const calcFrameTimesOfSpace = (space, startingTime, endingTime, interval, duration, needsVerification) => {
  const availableHours = [];
  let hoursReserved = [];

  if (reservationsByDate.value.length > 0) {
    const events = reservationsByDate.value
      .filter(reservation => reservation.spaceId === space._id)
      .flatMap(reservation => {
        const startTimeStr = getHoursAndMinsFromDate(reservation.startTime);
        const endTimeStr = getHoursAndMinsFromDate(reservation.endTime);
        const seats = reservation.seatsReserved;
        const startMinutes = makeMinutes(startTimeStr);
        const endMinutes = makeMinutes(endTimeStr);
        return [
          { time: startMinutes, change: seats },
          { time: endMinutes, change: -seats },
        ];
      });
    events.sort((a, b) => a.time - b.time);

    let currentSeats = 0;
    let currentTime = events[0] ? events[0].time : 0;

    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      if (event.time !== currentTime) {
        if (currentSeats !== 0) {
          hoursReserved.push({
            start: makeHoursAndMinutes(currentTime),
            end: makeHoursAndMinutes(event.time),
            startMinutes: currentTime,
            endMinutes: event.time,
            seatsReserved: currentSeats,
          });
        }
        currentTime = event.time;
      }
      currentSeats += event.change;
    }
    reservationStore.setHoursReservedBySpace(space._id, hoursReserved);
  }

  for (let time = startingTime; time <= endingTime; time += interval) {
    if (needsVerification && time + duration > endingTime) break;
    const currentTimeFormatted = makeHoursAndMinutes(time);

    if (reservationsByDate.value.length > 0) {
      const { reserved, isEnd } = isTimeReserved(time, duration, hoursReserved, space, needsVerification);
      if (reserved) continue;
      if (isEnd) {
        availableHours.push(currentTimeFormatted);
        break;
      }
    }
    availableHours.push(currentTimeFormatted);
  }
  return availableHours;
};

// Determina si un intervalo de tiempo se encuentra reservado
const isTimeReserved = (time, duration, hoursReserved, space, needsVerification) => {
  const reservationInterval = binarySearchReservation(time, duration, hoursReserved);
  if (!reservationInterval) return { reserved: false, isEnd: false };

  if (!needsVerification && time + duration > reservationInterval.startMinutes && reservationInterval.seatsReserved >= space.seats) {
    return { reserved: false, isEnd: true };
  }
  if (!needsVerification && time >= reservationInterval.startMinutes && reservationInterval.seatsReserved >= space.seats) {
    return { reserved: false, isEnd: true };
  }
  if (time + duration > reservationInterval.startMinutes && time + duration < reservationInterval.endMinutes && reservationInterval.seatsReserved >= space.seats) {
    return { reserved: true, isEnd: false };
  }
  if (time === reservationInterval.startMinutes && reservationInterval.seatsReserved < space.seats) {
    return { reserved: false, isEnd: false };
  }
  if (time >= reservationInterval.startMinutes && reservationInterval.seatsReserved >= space.seats) {
    return { reserved: true, isEnd: false };
  }
  return { reserved: false, isEnd: false };
};

// Búsqueda binaria para encontrar un intervalo que contenga el tiempo
const binarySearchReservation = (time, duration, hoursReserved) => {
  let low = 0;
  let high = hoursReserved.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const interval = hoursReserved[mid];
    if (time >= interval.startMinutes && time < interval.endMinutes) return interval;
    if (time + duration >= interval.startMinutes && time + duration < interval.endMinutes) return interval;
    if (time < interval.startMinutes) {
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }
  return null;
};


// Crea la reserva y redirige a la pantalla de confirmación
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
  router.push("/confirmReservation");
};

/* ------------------------- Watchers ------------------------- */

// Cuando cambia la fecha, se actualiza la fecha formateada, se reinician reservas y se filtran espacios
watch(date, (newVal) => {
  formattedDate.value = parseToStringDate(newVal);
  reservationsByDate.value = [];
  // Reiniciamos el objeto reservationTimes
  for (const key in reservationTimes) {
    delete reservationTimes[key];
  }
  reservationStore.clearStore();
  filterSpaces();
});

watch(startTime, () => {
  filterSpaces();
});

watch(durationSearched, () => {
  filterSpaces();
});

watch(reservationSeats, () => {
  filterSpaces();
});
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
