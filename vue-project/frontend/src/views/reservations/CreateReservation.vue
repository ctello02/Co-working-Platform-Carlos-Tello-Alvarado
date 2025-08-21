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

      <v-tabs class="mt-10" v-model="reservationTab" align-tabs="center" slider-color="#1056bd" height="40">
        <v-tab :ripple="false" value="spaces" class="no-hover text-none v-tab-text">Espacios</v-tab>
        <v-tab :ripple="false" value="materials" class="no-hover text-none v-tab-text">Materiales</v-tab>
      </v-tabs>

      <!-- Espacios filtrados -->
      <v-row>
        <v-col>
          <v-tabs-window v-model="reservationTab">
            <v-tabs-window-item value="spaces">
              <v-row class="mt-3" v-if="!filteredSpaces.length && !isLoading">
                <v-col class="text-center">
                  <span class="text-h5">No hay espacios disponibles con estos filtros</span>
                </v-col>
              </v-row>
              <v-row class="my-2 mx-n1" v-else>
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
                        <span class="text-h6" style="color: #4f5b66" v-if="spc.duration < 60">Tiempos de: {{
                          spc.duration }}
                          minutos</span>
                        <span class="text-h6" style="color: #4f5b66" v-if="spc.duration == 60">Tiempos de: {{
                          spc.duration /
                          60
                        }}
                          hora</span>
                        <span class="text-h6" style="color: #4f5b66" v-if="spc.duration > 60">Tiempos de: {{
                          spc.duration /
                          60
                        }}
                          horas</span>
                      </div>
                      <div class="d-flex align-center ga-2">
                        <v-icon style="color: #4f5b66">mdi-hand-coin-outline</v-icon>
                        <span class="text-h6" style="color: #4f5b66" v-if="spc.pricing > 0">
                          Precio por franja horaria: {{ spc.pricing }}€
                        </span>
                        <span class="text-h6" style="color: #4f5b66" v-else>
                          Reservas gratis
                        </span>
                      </div>
                    </v-card-text>
                    <v-divider />
                    <!-- Selectores siempre visibles -->
                    <v-card-text>
                      <v-row>
                        <v-col>
                          <v-select :model-value="slotsBySpace[spc._id].reservationTimes.start"
                            @update:model-value="val => slotsBySpace[spc._id].updateReservation('start', val)"
                            :items="slotsBySpace[spc._id].availableStartTimes" label="Inicio"
                            prepend-icon="mdi-timer-sand" variant="outlined" density="compact" clearable />
                        </v-col>
                        <v-col>
                          <v-select :model-value="slotsBySpace[spc._id].reservationTimes.end"
                            @update:model-value="val => slotsBySpace[spc._id].updateReservation('end', val)"
                            :items="slotsBySpace[spc._id].availableEndTimes" label="Fin"
                            prepend-icon="mdi-timer-sand-complete"
                            :disabled="!slotsBySpace[spc._id].reservationTimes.start" variant="outlined"
                            density="compact" clearable />
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col cols="12">
                          <v-alert class="mt-n8 mb-12" v-if="slotsBySpace[spc._id].reservationTimes.end
                            && slotsBySpace[spc._id].maxAllowed === 0" type="error" variant="tonal" density="compact">
                            Ya tienes una reserva en ese horario
                          </v-alert>
                          <v-alert class="mt-n8 mb-12" v-else-if="slotsBySpace[spc._id].reservationTimes.end" :type="slotsBySpace[spc._id].maxAllowed >= reservationSeats
                            ? 'success'
                            : 'error'
                            " density="compact" variant="tonal">
                            Quedan {{ slotsBySpace[spc._id].maxAllowed }} asientos
                          </v-alert>
                        </v-col>
                      </v-row>
                    </v-card-text>
                    <v-card-actions class="mt-n14 mx-2 mb-2">
                      <TonalButton block color="blue" text="Reservar" :disabled="!slotsBySpace[spc._id].reservationTimes.start ||
                        !slotsBySpace[spc._id].reservationTimes.end ||
                        slotsBySpace[spc._id].maxAllowed < reservationSeats
                        " @click="createSpaceReservation(spc)" />
                    </v-card-actions>
                  </v-card>
                </v-col>
              </v-row>
            </v-tabs-window-item>
            <v-tabs-window-item value="materials">
              <v-row class="mt-3" v-if="!filteredMaterials.length && !isLoading">
                <v-col class="text-center">
                  <span class="text-h5">No hay materiales disponibles con estos filtros</span>
                </v-col>
              </v-row>
              <v-row class="mt-2 mx-n1" v-else>
                <v-col v-for="mtl in filteredMaterials" :key="mtl._id" cols="12" md="6" lg="4">
                  <v-card>
                    <v-img :src="mtl.image" height="200px" cover />
                    <v-card-title class="text-h4 mb-n1">{{ mtl.name }}</v-card-title>
                    <v-card-text>
                      <div class="d-flex align-center ga-2">
                        <v-icon style="color: #4f5b66">mdi-clock-outline</v-icon>
                        <span class="text-h6" style="color: #4f5b66">
                          Abre: {{ makeHoursAndMinutes(mtl.opening) }} —
                          Cierra: {{ makeHoursAndMinutes(mtl.closing) }}
                        </span>
                      </div>
                      <div class="d-flex align-center ga-2">
                        <v-icon style="color: #4f5b66">mdi-timer-outline</v-icon>
                        <span class="text-h6" style="color: #4f5b66" v-if="mtl.duration < 60">Tiempos de: {{
                          mtl.duration }}
                          minutos</span>
                        <span class="text-h6" style="color: #4f5b66" v-if="mtl.duration == 60">Tiempos de: {{
                          mtl.duration /
                          60
                        }}
                          hora</span>
                        <span class="text-h6" style="color: #4f5b66" v-if="mtl.duration > 60">Tiempos de: {{
                          mtl.duration /
                          60
                        }}
                          horas</span>
                      </div>
                      <div class="d-flex align-center ga-2">
                        <v-icon style="color: #4f5b66">mdi-hand-coin-outline</v-icon>
                        <span class="text-h6" style="color: #4f5b66" v-if="mtl.pricing > 0">
                          Precio por reserva: {{ mtl.pricing }}€
                        </span>
                        <span class="text-h6" style="color: #4f5b66" v-else>
                          Reservas gratis
                        </span>
                      </div>
                    </v-card-text>
                    <v-divider />
                    <!-- Selectores siempre visibles -->
                    <v-card-text>
                      <v-row>
                        <v-col>
                          <v-select :model-value="slotsByMaterial[mtl._id].reservationTimes.start"
                            @update:model-value="val => slotsByMaterial[mtl._id].updateReservation('start', val)"
                            :items="slotsByMaterial[mtl._id].availableStartTimes" label="Inicio"
                            prepend-icon="mdi-timer-sand" variant="outlined" density="compact" clearable />
                        </v-col>
                        <v-col>
                          <v-select :model-value="slotsByMaterial[mtl._id].reservationTimes.end"
                            @update:model-value="val => slotsByMaterial[mtl._id].updateReservation('end', val)"
                            :items="slotsByMaterial[mtl._id].availableEndTimes" label="Fin"
                            prepend-icon="mdi-timer-sand-complete"
                            :disabled="!slotsByMaterial[mtl._id].reservationTimes.start" variant="outlined"
                            density="compact" clearable />
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col cols="12">
                          <v-alert class="mt-n8 mb-12" v-if="slotsByMaterial[mtl._id].reservationTimes.end
                            && slotsByMaterial[mtl._id].maxAllowed === 0" type="error" variant="tonal"
                            density="compact">
                            Ya tienes una reserva en ese horario
                          </v-alert>
                        </v-col>
                      </v-row>
                    </v-card-text>
                    <v-card-actions class="mt-n14 mx-2 mb-2">
                      <TonalButton block color="blue" text="Reservar" :disabled="!slotsByMaterial[mtl._id].reservationTimes.start ||
                        !slotsByMaterial[mtl._id].reservationTimes.end" @click="createMaterialReservation(mtl)" />
                    </v-card-actions>
                  </v-card>
                </v-col>
              </v-row>
            </v-tabs-window-item>
          </v-tabs-window>
        </v-col>
      </v-row>
    </v-col>
  </v-container>
</template>

<script setup>
import { ref, watch, onMounted, computed, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useSpaceStore } from '@/store/spaceStore';
import { useMaterialStore } from '@/store/materialStore';
import { useUserStore } from '@/store/userStore';
import { useReservationStore } from '@/store/reservationStore';
import { reservationService } from '@/services/reservationService';
import { spaceService } from '@/services/spaceService';
import { materialService } from '@/services/materialService';
import { useTime } from '@/composables/useTime';
import { useSpaceSlots } from '@/composables/useSpaceSlots';
import { useMaterialSlots } from '@/composables/useMaterialSlots';
import TonalButton from '@/components/TonalButton.vue';

const router = useRouter();
const spaceStore = useSpaceStore();
const materialStore = useMaterialStore();
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
const reservationTab = ref(null);
const spaces = ref([]);
const materials = ref([]);
const filteredSpaces = ref([]);
const filteredMaterials = ref([]);
const date = ref(new Date());
const formattedDate = ref(parseToStringDate(date.value));
const startTime = ref(null);
const initialLoaded = ref(false);
const durationSearched = ref(null);
const reservationSeats = ref(1);
const isLoading = ref(false);
const reservationsByDate = ref([]);
const periodicReservations = ref([]);

// Diccionario de slots por espacio
const slotsBySpace = reactive({});
const slotsByMaterial = reactive({});

// Cada vez que cambiamos fecha, recargamos datos y slots
watch(date, () => {
  formattedDate.value = parseToStringDate(date.value);
  if (initialLoaded.value) {
    startTime.value = null;
  }
  // Marcamos que ya pudo cargar la hora inicial de la store
  // El problema es que se inicializaba a null aunque hubiese una hora en la store
  initialLoaded.value = true;
  loadDayData();
});

onMounted(async () => {
  spaces.value = (await spaceService.getSpaces()).data.spaces;
  materials.value = (await materialService.getMaterials()).data.materials;
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
watch([startTime, durationSearched, reservationSeats], () => {
  filterSpaces();
  filterMaterials();
});

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
    slotsBySpace[spc._id] = useSpaceSlots({
      space: computed(() => spaces.value.find(s => s._id === spc._id)),
      reservationDate: date,
      reservationsByDate,
      periodicReservations,
      initialReservation: null
    });
  });

  materials.value.forEach(mtl => {
    slotsByMaterial[mtl._id] = useMaterialSlots({
      material: computed(() => materials.value.find(m => m._id === mtl._id)),
      reservationDate: date,
      reservationsByDate,
      periodicReservations,
      initialReservation: null
    });
  });

  filterSpaces();
  filterMaterials();
  isLoading.value = false;
}

// Filtra espacios con los criterios actuales
function filterSpaces() {
  filteredSpaces.value = spaces.value.filter(spc => {
    // Si la fecha que se está buscando es hoy, se eliminan los espacios que no están abiertos a la hora actual
    let searchedDate = new Date(date.value);
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();
    if (searchedDate.toDateString() == now.toDateString() && spc.closing < nowMins) {
      return false;
    }

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

function filterMaterials() {
  filteredMaterials.value = materials.value.filter(mtl => {
    // Si la fecha que se está buscando es hoy, se eliminan los materiales que no están abiertos a la hora actual
    let searchedDate = new Date(date.value);
    const now = new Date();
    const nowMins = now.getHours() * 60 + now.getMinutes();
    if (searchedDate.toDateString() == now.toDateString() && mtl.closing < nowMins) {
      return false;
    }

    // Si no hay filtro de hora/duración/asientos, mostrar todos
    if (!startTime.value && !durationSearched.value) {
      return true;
    }

    //---------------------------------------------------------------------------------
    const st = startTime.value
      ? makeMinutes(startTime.value)
      : null;

    const startOk = st == null
      ? true
      : slotsByMaterial[mtl._id].availableStartTimes.some(m => m === startTime.value);
    //---------------------------------------------------------------------------------

    //---------------------------------------------------------------------------------
    const slots = slotsByMaterial[mtl._id].allSlots;
    const durationOk = !durationSearched.value ||
      (mtl.duration <= durationSearched.value &&
        calcDurationAvailable(slots, durationSearched.value));
    //---------------------------------------------------------------------------------

    return startOk && durationOk;
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
    const allFree = block.every(slot => slot.unitsLeft > 0);
    if (allFree) return true; // Si este bloque tiene asientos y es válido, devolvemos true

    // Si no, seguimos buscando en el siguiente índice
  }
  // Si hemos recorrido todo sin encontrar bloque, devolvemos false
  return false;
}

// Crea y guarda la reserva, y redirige

async function createSpaceReservation(spc) {
  const day = parseToYYYYMMDD(formattedDate.value);
  const start = slotsBySpace[spc._id].reservationTimes.start;
  const end = slotsBySpace[spc._id].reservationTimes.end;
  const startISO = new Date(`${day}T${start}:00Z`).toISOString();
  const endISO = new Date(`${day}T${end}:00Z`).toISOString();

  const payload = {
    item: 'space',
    spaceId: spc._id,
    userId: userStore.getId,
    startTime: startISO,
    endTime: endISO,
    seatsReserved: reservationSeats.value,
    maxAllowed: slotsBySpace[spc._id].maxAllowed
  };

  reservationStore.setReservation(payload);
  spaceStore.setSelectedSpace(spc);
  router.push('/confirmReservation');
}

async function createMaterialReservation(mtl) {
  const day = parseToYYYYMMDD(formattedDate.value);
  const start = slotsByMaterial[mtl._id].reservationTimes.start;
  const end = slotsByMaterial[mtl._id].reservationTimes.end;
  const startISO = new Date(`${day}T${start}:00Z`).toISOString();
  const endISO = new Date(`${day}T${end}:00Z`).toISOString();

  const payload = {
    item: 'material',
    materialId: mtl._id,
    userId: userStore.getId,
    startTime: startISO,
    endTime: endISO,
  };

  reservationStore.setReservation(payload);
  materialStore.setSelectedMaterial(mtl);
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

.v-tab-text {
  font-size: clamp(14px, 1.4vw, 20px);
  letter-spacing: normal;

}

.v-subtab-text {
  font-size: clamp(10px, 1.2vw, 18px);
  letter-spacing: normal;
  color: rgb(92, 92, 92);
}
</style>
