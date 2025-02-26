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
                      <span class="text-h5">Detalles de la reserva:</span>
                    </v-col>
                  </v-row>
                  <v-divider class="mt-1" />
                  <v-row class="d-flex align-center justify-center mt-6" cols="12">
                    <span class="text-h4">{{ space.name }}</span>
                    <v-btn
                      icon="mdi-information-outline"
                      variant="text"
                      density="compact"
                      :ripple="false"
                      @click="showSpaceModal = !showSpaceModal"
                    />
                  </v-row>
                  <v-row>
                    <v-col>
                      <v-row>
                        <v-col style="color: grey" class="text-center">
                          <span class="text-h6">Fecha: </span>
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col class="text-center mt-n7">
                          <span class="text-h4">{{ parseToStringDate(new Date(reservation.startTime)) }}</span>
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>
                  <v-divider class="mt-6" />
                  <v-row class="d-flex align-center my-2">
                    <v-col cols="1">
                      <v-icon size="small" icon="mdi-weather-sunny" />
                    </v-col>
                    <v-col class="ml-n4 mr-7">
                      <span class="text-h6">Hora de inicio: {{ getHoursAndMinsFromDate(reservation.startTime) }}</span>
                    </v-col>
                    <v-col cols="1">
                      <v-icon size="small" icon="mdi-weather-night" />
                    </v-col>
                    <v-col class="ml-n7 mr-7">
                      <span class="text-h6">Hora de fin: {{ getHoursAndMinsFromDate(reservation.endTime) }}</span>
                    </v-col>
                  </v-row>
                  <v-divider />
                  <v-row class="mt-5 mb-n8">
                    <v-col cols="5">
                      <v-text-field
                        v-model.number="reservationSeats"
                        label="Número de asientos"
                        prepend-icon="mdi-table-chair"
                        type="number"
                        variant="outlined"
                        density="compact"
                        required
                        @input="reservationSeats = Math.max(1, reservationSeats)"
                      />
                    </v-col>
                    <v-col v-if="space.repetition">
                      <v-select
                        v-model="repetition"
                        :items="repetitionOptions"
                        item-title="label"
                        item-value="value"
                        label="Repetición"
                        prepend-icon="mdi-repeat"
                        variant="outlined"
                        density="compact"
                      />
                    </v-col>
                    <v-col v-else>
                      <v-row>
                        <v-col cols="1" class="d-flex align-center">
                          <v-icon size="small" icon="mdi-repeat-off" />
                        </v-col>
                        <v-col>
                          <span class="text-h6">Repetición no disponible</span>
                        </v-col>
                      </v-row>
                    </v-col>
                  </v-row>
                  <v-row class="mt-n3 mb-n4">
                    <v-col>
                      <v-fade-transition>
                        <v-alert v-if="reservationSeats >= maxSeatsAllowed" type="warning" density="compact" variant="tonal">
                          No se pueden reservar más de {{ maxSeatsAllowed }} asientos.
                        </v-alert>
                      </v-fade-transition>
                    </v-col>
                  </v-row>
                </v-col>
              </v-card-text>
              <v-card-actions>
                <v-row class="mt-n6 mb-3 mr-2 d-flex justify-end ga-3">
                  <TonalButton color="grey" text="Volver" @click="routerBack" />
                  <TonalButton color="blue" text="Reservar" @click="confirmReservation" />
                </v-row>
              </v-card-actions>
            </v-card>
          </v-col>
  
          <transition name="slide-right" mode="out-in">
            <v-col v-if="space && showSpaceModal">
              <SpaceCard :space="space" :adminActions="false" :reserveActions="false" />
            </v-col>
          </transition>
        </v-row>
      </v-col>
    </v-container>
</template>
  
<script setup>
  import { ref, watch, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useReservationStore } from '@/store/reservationStore';
  import { useSpaceStore } from '@/store/spaceStore';
  import { reservationService } from '@/services/reservationService';
  import { useToast } from 'vue-toastification';
  
  import TonalButton from '@/components/TonalButton.vue';
  import SpaceCard from '@/components/SpaceCard.vue';

  import { useTime } from '@/composables/useTime';
  
  // ------------------------------------------------
  // Instancias de Router, Toast y Stores
  // ------------------------------------------------
  const router = useRouter();
  const toast = useToast();
  const reservationStore = useReservationStore();
  const spaceStore = useSpaceStore();
  // ------------------------------------------------

  
  // ------------------------------------------------
  // Extraemos funciones del composable useTime
  // ------------------------------------------------
  const { 
    makeMinutes, 
    getHoursAndMinsFromDate, 
    parseToStringDate, 
  } = useTime();
  // ------------------------------------------------
  

  // ------------------------------------------------
  // Variables Reactivas
  // ------------------------------------------------
  const reservation = ref(null);
  const space = ref(null);
  const hoursReserved = ref(null);
  const showSpaceModal = ref(false);
  
  const reservationSeats = ref(0);
  const maxSeatsAllowed = ref(null);
  
  const repetition = ref('no_repeat');
  const repetitionOptions = [
    { label: 'No repetir', value: 'no_repeat' },
    { label: 'Cada día', value: 'daily' },
    { label: 'Todos los días laborales (de lunes a viernes)', value: 'workdays' },
    { label: 'Cada semana este día', value: 'weekly' },
    { label: 'Cada mes este día', value: 'monthly' },
  ];
  // ------------------------------------------------

  
  // ------------------------------------------------
  // Método: Calcular asientos permitidos
  // ------------------------------------------------
  const calcSeatsAllowed = () => {
    if (!hoursReserved.value || hoursReserved.value.length === 0) {
      maxSeatsAllowed.value = space.value.seats;
      return;
    }
  
    const startTime = getHoursAndMinsFromDate(reservation.value.startTime);
    const endTime = getHoursAndMinsFromDate(reservation.value.endTime);
    const reservationStartTime = makeMinutes(startTime);
    const reservationEndTime = makeMinutes(endTime);
    let max = 0;
  
    hoursReserved.value.forEach(res => {
      const startMinutes = res.startMinutes;
      const endMinutes = res.endMinutes;
  
      // Si la reserva actual está completamente antes o después de la existente, se ignora
      if (
        (reservationStartTime < startMinutes && reservationEndTime <= startMinutes) ||
        (reservationStartTime >= endMinutes && reservationEndTime > endMinutes)
      ) {
        return;
      }
  
      if (res.seatsReserved > max) {
        max = res.seatsReserved;
      }
    });
  
    maxSeatsAllowed.value = space.value.seats - max;
  };
  // ------------------------------------------------
  

  // ------------------------------------------------
  // Método: Confirmar Reserva
  // ------------------------------------------------
  const confirmReservation = async () => {
    const formData = new FormData();
    formData.append('spaceId', reservation.value.spaceId);
    formData.append('userId', reservation.value.userId);
    formData.append('startTime', reservation.value.startTime);
    formData.append('endTime', reservation.value.endTime);
    formData.append('seatsReserved', reservationSeats.value);
    formData.append('repetition', repetition.value);
  
    try {
      const res = await reservationService.createReservation(formData);
      console.log(res.data);
      toast.success('Reserva creada con éxito');
      router.push('/reservations');
    } catch (error) {
      console.error(error);
    }
  };
  // ------------------------------------------------

  
  // ------------------------------------------------
  // Watcher: Validar número de asientos
  // ------------------------------------------------
  watch(reservationSeats, (newValue) => {
    if (newValue > maxSeatsAllowed.value) {
      reservationSeats.value = reservationSeats.value - 1;
    }
  });
  // ------------------------------------------------

  
  // ------------------------------------------------
  // Hook: onMounted (Inicialización)
  // ------------------------------------------------
  onMounted(() => {
    space.value = spaceStore.getSelectedSpace;
    reservation.value = reservationStore.getReservation;
  
    if (!space.value || !reservation.value) {
      router.push('/createReservation');
    } else {
      hoursReserved.value = reservationStore.getHoursReservedBySpace(space.value._id);
      reservationSeats.value = reservation.value.seatsReserved;
      calcSeatsAllowed();
    }
  });
  // ------------------------------------------------


  // ------------------------------------------------
  // Métodos Auxiliares 
  // ------------------------------------------------
  const routerBack = () => {
    router.go(-1);
  };
  // ------------------------------------------------

</script>
  
<style scoped>
/* Transición de deslizamiento hacia la derecha (mostrar SpaceCard) */
.slide-right-enter-active,
.slide-right-leave-active {
    transition: opacity 0.3s ease, transform 0.3s ease;
}

.slide-right-enter-from,
.slide-right-leave-to {
    opacity: 0;
    transform: translateX(100px);
}
</style>
  