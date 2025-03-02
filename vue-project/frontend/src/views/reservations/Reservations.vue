<template>
    <v-container fluid class="container">
        <v-col>
            <v-row>
                <span class="text-h4">Reservas del usuario</span>
                <v-spacer></v-spacer>
                <div class="d-flex align-center">
                    <TonalButton color="blue" text="Crear reserva" class="mr-3" @click="openCreateReservation" />
                    <v-btn variant="text" :ripple="false"
                        :icon="list ? 'mdi-view-grid-outline' : 'mdi-format-list-bulleted'" @click="list = !list" />
                </div>
            </v-row>
            <v-row v-if="reservations.length === 0" class="mt-8">
                <span class="text-h5">No se encuentran datos</span>
            </v-row>
            <v-row v-else>
                <v-col v-for="reservation in reservations" :key="reservation._id" lg="3" md="4" sm="12" xs="12">
                    <v-card @click="infoEvent(reservation)" class="text-center" max-width="400" :ripple="false">
                        <v-card-title>
                            <span class="text-h5">Reserva de {{ reservation.spaceId.name }}</span>
                            <v-divider class="mt-1" />
                        </v-card-title>
                        <v-card-text>
                            <v-col>
                                <v-row>
                                    <v-col>
                                        <v-row>
                                            <v-col style="color: grey"><span class="text-h6">Fecha: </span></v-col>
                                        </v-row>
                                        <v-row>
                                            <v-col class="mt-n7"><span class="text-h6"> {{ twoDigitsDate(new
                                                Date(reservation.startTime)) }}</span></v-col>
                                        </v-row>
                                    </v-col>
                                    <v-col>
                                        <v-row>
                                            <v-col style="color: grey"><span class="text-h6">Horas: </span></v-col>
                                        </v-row>
                                        <v-row>
                                            <v-col class="mt-n7"><span class="text-h6">{{
                                                    getHoursAndMinsFromDate(reservation.startTime) }}h-{{
                                                    getHoursAndMinsFromDate(reservation.endTime) }}h</span></v-col>
                                        </v-row>
                                    </v-col>
                                </v-row>
                            </v-col>
                        </v-card-text>
                    </v-card>
                </v-col>
            </v-row>
        </v-col>
    </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '@/store/userStore';
import { useRouter } from 'vue-router';
import { useReservationStore } from '@/store/reservationStore';
import TonalButton from '@/components/TonalButton.vue';
import { reservationService } from '@/services/reservationService';

import { useTime } from '@/composables/useTime';

// Instancias de router y stores
const userStore = useUserStore();
const router = useRouter();
const reservationStore = useReservationStore();

// Variables reactivas
const reservations = ref([]);
const list = ref(false);

// Extraemos funciones del composable useTime
const {
    getHoursAndMinsFromDate,
    twoDigitsDate,
} = useTime();


/* ------------------------- Funciones del componente ------------------------- */
onMounted(() => {
    reservations.value = reservationStore.getReservation;
    if (!reservations.value) {
        router.push('/reservations');
    }
    getUserReservations();
});

/* ------------------------- Funciones del componente ------------------------- */
// Obtiene las reservas del usuario a través del servicio
const getUserReservations = () => {
    try {
        reservationService.getUserReservations(userStore.getId)
            .then(res => {
                reservations.value = res.data.reservations;
            })
            .catch(error => {
                console.error(error);
            });
    } catch (error) {
        console.error(error);
    }
}

const infoEvent = (reservation) => {
    console.log(reservation.value);
    reservationStore.setReservation(reservation);
    router.push('/reservationInfo');
}

const openCreateReservation = () => {
    router.push('/createReservation');
}

</script>