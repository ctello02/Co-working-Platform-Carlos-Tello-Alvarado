<template>
  <v-container fluid class="container">
    <v-col>
      <v-row>
        <span class="text-h4">Confirmar reserva</span>
      </v-row>
      <v-row v-if="!reservation || (reservation && reservation.length === 0)" class="mt-8">
        <span class="text-h5">No se encuentran datos</span>
      </v-row>
      <v-row v-else>
        <v-col>
          <v-card class="mx-auto px-2 text-center" width="100%" max-width="600">
            <v-card-text>
              <v-col>
                <!-- Detalles de la reserva -->
                <v-row>
                  <v-col>
                    <span :class="xs ? 'text-h6' : 'text-h5'">Detalles de la reserva:</span>
                  </v-col>
                </v-row>
                <v-divider class="mt-1" />
                <v-row class="d-flex align-center justify-center mt-6" cols="12">
                  <span :class="xs ? 'text-h5' : 'text-h4'" v-if="reservation.item === 'space'">{{ space.name }}</span>
                  <span :class="xs ? 'text-h5' : 'text-h4'" v-else>{{ material.name }}</span>
                  <v-btn v-if="!xs" icon="mdi-information-outline" variant="text" density="compact" :ripple="false"
                    @click="reservation.item === 'space' ? showSpaceModal = !showSpaceModal : showMaterialModal = !showMaterialModal" />
                </v-row>
                <v-row>
                  <v-col>
                    <v-row>
                      <v-col style="color: grey" class="text-center">
                        <span :class="xs ? '' : 'text-h6'">Fecha: </span>
                      </v-col>
                    </v-row>
                    <v-row>
                      <v-col class="text-center mt-n7">
                        <span :class="xs ? 'text-h5' : 'text-h4'">{{ parseToStringDate(new Date(reservation.startTime))
                        }}</span>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
                <v-divider class="mt-6" />
                <v-row class="d-flex align-center my-2" :class="xs ? 'justify-center' : ''">
                  <div class="d-flex align-center">
                    <v-col cols="1">
                      <v-icon size="small" icon="mdi-timer-sand" />
                    </v-col>
                    <v-col class="mr-7">
                      <span :class="xs ? '' : 'text-h6'">Hora de inicio: {{ startTime }}</span>
                    </v-col>
                  </div>
                  <div class="d-flex align-center">
                    <v-col cols="1">
                      <v-icon size="small" icon="mdi-timer-sand-complete" />
                    </v-col>
                    <v-col class=" mr-7">
                      <span :class="xs ? '' : 'text-h6'">Hora de fin: {{ endTime }}</span>
                    </v-col>
                  </div>
                </v-row>
                <v-divider />

                <v-row v-if="reservation.item === 'space'" class="d-flex mt-5 mb-n8" :class="xs ? 'flex-column' : ''">
                  <v-col :cols="xs ? 12 : 5">
                    <v-text-field v-model.number="reservationSeats" :disabled="show" label="Número de asientos"
                      prepend-icon="mdi-table-chair" type="number" variant="outlined" density="compact" required
                      @input="reservationSeats = Math.max(1, reservationSeats)" />
                  </v-col>
                  <v-col v-if="admitsRepetition" cols="7">
                    <v-select v-model="repetition" :items="repetitionOptions" :disabled="show" item-title="label"
                      item-value="value" label="Repetición" prepend-icon="mdi-repeat" variant="outlined"
                      density="compact" />
                  </v-col>
                  <v-col v-else>
                    <v-row>
                      <v-col cols="1" class="d-flex align-center ml-5">
                        <v-icon size="small" icon="mdi-repeat-off" />
                      </v-col>
                      <v-col>
                        <span class="" :class="xs ? '' : 'ml-n4 text-h6'">Repetición no disponible</span>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>

                <v-row v-if="reservation.item === 'material'" class="mt-3 d-flex align-center justify-center">
                  <v-col v-if="admitsRepetition" cols="7" class="mb-n5">
                    <v-select v-model="repetition" :items="repetitionOptions" item-title="label" item-value="value"
                      label="Repetición" prepend-icon="mdi-repeat" variant="outlined" density="compact" />
                  </v-col>
                  <v-col v-else>
                    <v-row class="d-flex align-center justify-center">
                      <v-col cols="1" class="d-flex align-center ml-4 mr-n6">
                        <v-icon size="small" icon="mdi-repeat-off" />
                      </v-col>
                      <v-col cols="6">
                        <span :class="xs ? '' : 'text-h6'">Repetición no disponible</span>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>

                <v-divider class="mt-6" />
                <v-row class="mt-3 mb-n3 d-flex align-start ">
                  <v-col cols="1" class="d-flex align-center ">
                    <v-icon icon="mdi-hand-coin-outline" />
                  </v-col>
                  <v-col class="d-flex ga-2 ml-n1 mt-n1">
                    <span class="text-h6">
                      Precio: {{ calculatePrice }}€
                    </span>
                    <v-tooltip v-if="repetition !== 'no_repeat'" v-model="showTooltip" location="top">
                      <template v-slot:activator="{ props }">
                        <v-icon class="mt-1" v-bind="props" size="small">
                          mdi-information-outline
                        </v-icon>
                      </template>
                      <span>
                        Únicamente se pagará la reserva seleccionada.
                        <br>El resto de reservas deberán pagarse manualmente.
                      </span>
                      <span v-if="applyToAll">
                        <br> Solo se pagará esta reserva.
                      </span>
                    </v-tooltip>
                  </v-col>
                </v-row>
                <v-fade-transition>
                  <v-row class="mb-n3" v-if="reservationSeats >= maxAllowed">
                    <v-col class="mt-n2" style="display: flex; flex-direction: column; gap: 15px;">
                      <v-alert v-if="reservationSeats >= maxAllowed && reservation.item === 'space'" type="warning"
                        density="compact" variant="tonal">
                        No se pueden reservar más de {{ maxAllowed }} asientos.
                      </v-alert>
                      <v-alert v-if="periodicReservedModal" type="warning" density="compact" variant="tonal">
                        No se puede reservar periódicamente, ya hay una reserva con el mismo horario.
                      </v-alert>
                    </v-col>
                  </v-row>
                </v-fade-transition>
              </v-col>
            </v-card-text>
            <v-card-actions>
              <v-row class="d-flex ga-3" :class="xs ? 'flex-column ma-3' : 'mt-n5 mb-6 mr-5 '">
                <TonalButton :class="xs ? 'mb-n2' : 'ml-8'" color="grey" text="Volver" @click="routerBack" />
                <v-spacer />

                <TonalButton v-if="!show" color="blue" text="Reservar" :loading="isLoading"
                  @click="handleSubmit(false)" />
                <TonalButton v-if="calculatePrice > 0" :color="show ? 'grey' : 'blue'"
                  :text="show ? 'Cancelar' : 'Reservar y pagar'" :loading="isLoading"
                  @click="show ? closePayPal() : handleSubmit(true)" />
              </v-row>
            </v-card-actions>

            <v-expand-transition>
              <div v-show="show" class="mt-n2" :class="xs ? 'ma-5' : 'ma-7'">
                <div style="width: 100%;" id="paypal-button-container" />
              </div>
            </v-expand-transition>
          </v-card>
        </v-col>

        <transition name="slide-right" mode="out-in">
          <v-col v-if="space && showSpaceModal" class="mt-n5">
            <SpaceCard :space="space" :adminActions="false" :reserveActions="false" />
          </v-col>
        </transition>
        <transition name="slide-right" mode="out-in">
          <v-col v-if="material && showMaterialModal" class="mt-n5">
            <MaterialCard :material="material" :adminActions="false" :reserveActions="false" />
          </v-col>
        </transition>
      </v-row>
    </v-col>
  </v-container>
</template>

<script setup>
import { ref, watch, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useReservationStore } from '@/store/reservationStore';
import { useSpaceStore } from '@/store/spaceStore';
import { useMaterialStore } from '@/store/materialStore';
import { reservationService } from '@/services/reservationService';
import { paypalService } from '@/services/paypalService';
import { useToast } from 'vue-toastification';

import TonalButton from '@/components/TonalButton.vue';
import SpaceCard from '@/components/SpaceCard.vue';
import MaterialCard from '@/components/MaterialCard.vue';

import { useTime } from '@/composables/useTime';
import { useDisplay } from 'vuetify'

const { xs } = useDisplay()

// ------------------------------------------------
// Instancias de Router y Stores
// ------------------------------------------------
const router = useRouter();
const reservationStore = useReservationStore();
const spaceStore = useSpaceStore();
const materialStore = useMaterialStore();
// ------------------------------------------------


// ------------------------------------------------
// Extraemos funciones del composable useTime
// ------------------------------------------------
const {
  makeMinutes,
  getHoursAndMinsFromDate,
  parseToStringDate,
  makeMinutesFromIsoLocal,
} = useTime();
// ------------------------------------------------


// ------------------------------------------------
// Variables Reactivas
// ------------------------------------------------
const reservation = ref(null);
const periodicReservations = ref([]);
const startTime = ref(null);
const endTime = ref(null);
const admitsRepetition = ref(null);
const pricing = ref(null);

const space = ref(null);
const material = ref(null);
const showSpaceModal = ref(false);
const showMaterialModal = ref(false);
const periodicReservedModal = ref(false);

const paypalLoaded = ref(false);
const isLoading = ref(false);
const show = ref(false);
const showTooltip = ref(false)

const reservationSeats = ref(1);
const maxAllowed = ref(null);

const repetition = ref('no_repeat');
const repetitionOptions = [
  { label: 'No repetir', value: 'no_repeat', occurrences: 0 },
  { label: 'Cada día', value: 'daily', occurrences: 60 },
  { label: 'Cada semana este día', value: 'weekly', occurrences: 16 },
  { label: 'Cada mes este día', value: 'monthly', occurrences: 12 },
];
// ------------------------------------------------


// ------------------------------------------------
// onMounted
// ------------------------------------------------
onMounted(async () => {
  reservation.value = reservationStore.getReservation;

  if (!reservationStore.getReservation) {
    router.push('/createReservation');
  } else {
    if (reservation?.value.item === 'space') {
      space.value = spaceStore.getSelectedSpace;
      admitsRepetition.value = space.value.admitsRepetition;
      pricing.value = space.value.pricing;
    } else {
      material.value = materialStore.getSelectedMaterial;
      admitsRepetition.value = material.value.admitsRepetition;
      pricing.value = material.value.pricing;
    }

    await getPeriodicReservations();

    if (reservation.value.item === 'space') {
      reservationSeats.value = reservation.value.seatsReserved;
      maxAllowed.value = reservation.value.maxAllowed;
    }

    startTime.value = getHoursAndMinsFromDate(reservation.value.startTime);
    endTime.value = getHoursAndMinsFromDate(reservation.value.endTime);
  }
});
// ------------------------------------------------

// ------------------------------------------------
// Obtener reservas periódicas
// ------------------------------------------------
async function getPeriodicReservations() {
  let periodic = [];
  try {
    const pr = await reservationService.getPeriodicReservations();
    periodic = pr.data.periodicReservations || [];
  } catch (e) {
    if (e.response?.status === 404) {
      periodic = [];
    } else throw e;
  }
  periodicReservations.value = periodic.filter(r => {
    return (reservation.value.spaceId ? r.spaceId === space.value._id : r.materialId === material.value._id)
  }) || [];

};
// ------------------------------------------------


// ------------------------------------------------
// Función para confirmar la reserva y para pagarla
// ------------------------------------------------
async function handleSubmit(doPay = false) {
  const toast = useToast();
  const price = calculatePrice.value;
  isLoading.value = true;

  // Montamos el formData
  const formData = new FormData();
  if (reservation.value.item === 'space') {
    formData.append('spaceId', reservation.value.spaceId);
    formData.append('spaceName', space.value.name);
    formData.append('seatsReserved', reservationSeats.value);
    formData.append('materialId', null);
  } else {
    formData.append('materialId', reservation.value.materialId);
    formData.append('materialName', material.value.name);
    formData.append('spaceId', null);
  }
  formData.append('price', price);
  formData.append('userId', reservation.value.userId);
  formData.append('startTime', reservation.value.startTime);
  formData.append('endTime', reservation.value.endTime);

  // Comprobar si hay reservas periodicas
  // Si hay:
  //   - Comprobar cada una si es diaria, semanal o mensual
  // Si no hay: 
  //   - Sin restricciones
  if (checkPeriodicReservations()) {
    periodicReservedModal.value = true;
    isLoading.value = false;
    return;
  }
  //---- Si llega hasta aquí es porque se puede reservar ----

  // Si no se va a pagar, añadimos isPaid = false y procesamos
  if (!doPay) {
    formData.append('isPaid', false);
    const ok = await processReservation(formData);
    isLoading.value = false;
    if (ok) router.push('/reservations');
    return;
  }

  // Si se va a pagar, arrancamos PayPal
  try {
    await loadPayPalSdk();

    const container = document.getElementById('paypal-button-container');
    if (container) container.innerHTML = '';

    paypal.Buttons({
      createOrder: () =>
        paypalService
          .createOrder(reservation.value._id, price)
          .then(r => r.data.orderID),
      onApprove: async (data) => {
        const captureRes = await paypalService.captureOrder(
          data.orderID,
          reservation.value._id
        );
        if (captureRes.data.paymentStatus !== 'COMPLETED') {
          return toast.error('Pago invalidado');
        }

        formData.append('paypalOrderId', data.orderID);
        formData.append('paypalCaptureId', captureRes.data.capture);
        formData.append('paymentStatus', 'COMPLETED');
        formData.append('isPaid', true);

        const ok = await processReservation(formData);
        show.value = false;
        if (ok) {
          router.push('/reservations');
        }
      },
      onError: (err) => {
        toast.error('Error en la pasarela PayPal');
        isLoading.value = false;
      }
    }).render(container);
    show.value = true;
  } catch (err) {
    console.error('Error arrancando PayPal:', err);
    toast.error('No se pudo iniciar el pago');
  } finally {
    isLoading.value = false;
  }
}

function loadPayPalSdk() {
  if (paypalLoaded.value) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${import.meta.env.VITE_PAYPAL_CLIENT_ID}&currency=EUR`;
    script.onload = () => { paypalLoaded.value = true; resolve(); };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}
// ------------------------------------------------


// ------------------------------------------------
// Función para comprobar si hay reservas periodicas
// ------------------------------------------------
function checkPeriodicReservations() {
  if (periodicReservations.value.length > 0) {
    let isReserved = true;

    for (let periodicReservation of periodicReservations.value) {
      const reservationDate = new Date(reservation.value.startTime);
      const periodicReservationDate = new Date(periodicReservation.startTime);
      // Hay tres casos:
      //   - Reserva diaria: tengo que comprobar la hora, porque como se repiten todos los días, con comprobar las horas es suficiente
      //   - Reserva semanal: tengo que comprobar el día de la semana y la hora. Si coinciden las dos reservas en lunes, hay que ver si se puede hacer la nueva reserva y no coincide con el horario de la periódica
      //   - Reserva mensual: tengo que comprobar el día del mes y la hora. Es similar a la semanal 

      if (reservationDate < periodicReservationDate && repetition.value === 'no_repeat') {
        return false;
      }

      if (periodicReservation.periodicity === 'weekly') {
        if (periodicReservationDate.getDay() !== reservationDate.getDay()) {
          // Si no coinciden los días de la reserva que se quiere crear y de la periodicReservation que existe, se puede reservar
          isReserved = false;
          if (repetition.value === 'daily') {
            isReserved = true;
          }
          continue;
        }
      } else if (periodicReservation.periodicity === 'monthly') {
        if (periodicReservationDate.getDate() !== reservationDate.getDate()) {
          // Si no coinciden los días de la reserva que se quiere crear y de la periodicReservation que existe, se puede reservar
          isReserved = false;
          if (repetition.value === 'daily') {
            isReserved = true;
          }
          continue;
        }
      }

      const periodicStartTime = getHoursAndMinsFromDate(periodicReservation.startTime);
      const periodicEndTime = getHoursAndMinsFromDate(periodicReservation.endTime);
      const periodicReservationStartMinutes = makeMinutes(periodicStartTime);
      const periodicReservationEndMinutes = makeMinutes(periodicEndTime);

      const reservationStartMinutes = makeMinutes(startTime.value);
      const reservationEndMinutes = makeMinutes(endTime.value);

      if (reservationStartMinutes < periodicReservationStartMinutes &&
        reservationEndMinutes <= periodicReservationStartMinutes) {
        isReserved = false;
      }
      else
        if (reservationStartMinutes >= periodicReservationEndMinutes &&
          reservationEndMinutes > periodicReservationEndMinutes) {
          isReserved = false;
        }
        else {
          // Comprobamos los asientos de la reserva periódica
          if (reservationSeats.value <= (space.value.seats - periodicReservation.seatsReserved)) {
            return false;
          }

          return true;
        }
    };
    return isReserved;
  }
  return false;
};
// ------------------------------------------------


// ------------------------------------------------
// Helper para enviar la reserva a la API
// ------------------------------------------------
async function processReservation(formData) {
  const toast = useToast();
  try {
    // Comprobar qué tipo de repetición
    //  - Sin repetición: se crea directamente
    //  - Diaria, Semanal o Mensual: hay que meter cosas en el formData
    const res = await sendReservation(formData);
    toast.success(res.data.message);

    const conflicts = res.data.conflictObjects || [];
    if (conflicts.length > 0) {
      toast.warning(
        `Se han producido ${conflicts.length} conflictos. ` +
        `Debe reservar manualmente los días donde ha habido un error.`
      );
    }
    return true;
  } catch (error) {
    console.error(error);
    if (
      error.response?.status === 409 &&
      error.response.data?.errorCode === 'TOO_MANY_CONFLICTS'
    ) {
      toast.error(error.response.data.message);
    } else {
      toast.error('Error al crear la reserva');
    }
    return false;
  }
}
// ------------------------------------------------


// ------------------------------------------------
// Función para comprobar si hay reservas periodicas
// ------------------------------------------------
async function sendReservation(formData) {
  let res;
  if (repetition.value === 'no_repeat')
    res = await reservationService.createReservation(formData);     // Si no selecciona repetición, creamos una reserva normal
  else {
    // Si selecciona repetición, creamos una periodicReservation
    // Calculamos el campo lastOccurrenceGenerated. De momento se puede hacer en el front, pero a la hora de implementar la API, se debe hacer en el back
    const selectedOption = repetitionOptions.find(option => option.value === repetition.value);
    const last = new Date(reservation.value.startTime);

    if (repetition.value === 'daily') {
      last.setUTCDate(last.getUTCDate() + selectedOption.occurrences);
    }
    else if (repetition.value === 'weekly') {
      last.setUTCDate(last.getUTCDate() + selectedOption.occurrences * 7);
    }
    else if (repetition.value === 'monthly') {
      last.setUTCMonth(last.getUTCMonth() + selectedOption.occurrences);
    }

    formData.append('lastOccurrenceGenerated', last.toISOString());
    formData.append('periodicity', repetition.value);

    res = await reservationService.createPeriodicReservation(formData);
  }

  return res;

};
// ------------------------------------------------


// ------------------------------------------------
// Watcher validar número de asientos
// ------------------------------------------------
watch(reservationSeats, (newValue) => {
  if (newValue > maxAllowed.value) {
    reservationSeats.value = reservationSeats.value - 1;
  }
});
// ------------------------------------------------


// ------------------------------------------------
// Métodos Auxiliares 
// ------------------------------------------------
const calculatePrice = computed(() => {
  const startStr = reservation.value.startTime
  const endStr = reservation.value.endTime
  let dur = 0;
  let pricePer = 0;
  if (reservation.value.item === 'space') {
    dur = space.value.duration
    pricePer = space.value.pricing
  } else {
    dur = material.value.duration
    pricePer = material.value.pricing
  }

  const startMin = makeMinutesFromIsoLocal(startStr)
  const endMin = makeMinutesFromIsoLocal(endStr)

  const blocks = (endMin - startMin) / dur

  const fullBlocks = Math.floor(blocks)
  const total = fullBlocks * pricePer * reservationSeats.value

  return total.toFixed(2)
})

function closePayPal() {
  show.value = false
}

const routerBack = () => {
  router.go(-1);
};
// ------------------------------------------------

</script>

<style scoped>
.slide-right-enter-active,
.slide-right-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.slide-right-enter-from,
.slide-right-leave-to {
  opacity: 0;
  transform: translateX(100px);
}

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