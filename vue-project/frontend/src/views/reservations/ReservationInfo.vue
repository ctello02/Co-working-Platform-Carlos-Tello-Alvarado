<template>
    <v-container class="pa-5 container">
        <v-card v-if="reservation" class="mx-auto" max-width="600">
            <v-img :src="reservation.spaceId?.image" color="surface-variant" height="300px" cover />
            <v-card-text v-if="reservation">
                <v-col>
                    <v-row class="mt-n5 mb-n3" cols="12">
                        <v-col cols="9">
                            <span class="text-h4">{{ reservation.spaceId?.name }}</span>
                        </v-col>
                    </v-row>

                    <v-row class="my-n3" cols="12">
                        <v-col cols="1" class="d-flex align-center">
                            <v-icon icon="mdi-text" />
                        </v-col>
                        <v-col>
                            <span class="text-h6">{{ reservation.spaceId?.description }}</span>
                        </v-col>
                    </v-row>

                    <v-row class="my-n3">
                        <v-col cols="1" class="d-flex align-center">
                            <v-icon icon="mdi-calendar-outline" size="small" />
                        </v-col>
                        <v-col><span class="text-h6"> {{ parseToStringDate(new
                            Date(reservation.startTime)) }}</span></v-col>
                    </v-row>

                    <v-row class="my-n3 d-flex justify-center align-center" cols="12">
                        <v-col>
                            <v-row>
                                <v-col cols="2" class="d-flex align-center">
                                    <v-icon icon="mdi-clock-outline" size="small" />
                                </v-col>
                                <v-col><span class="pt-2 text-h6">{{ getHoursAndMinsFromDate(reservation.startTime) }}h
                                        -
                                        {{ getHoursAndMinsFromDate(reservation.endTime) }}h</span></v-col>
                            </v-row>
                        </v-col>
                        <v-col>
                            <v-row>
                                <v-col cols="2" class="d-flex align-center">
                                    <v-icon icon="mdi-table-chair" size="small" />
                                </v-col>
                                <v-col>
                                    <span class="text-h6" v-if="reservation.seatsReserved == 1">{{
                                        reservation.seatsReserved }} asiento
                                        reservado</span>
                                    <span class="text-h6" v-else>{{ reservation.seatsReserved }} asientos
                                        reservados</span>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>

                    <v-row class="my-n3" cols="12">
                        <v-col cols="1" class="d-flex align-center">
                            <v-icon icon="mdi-repeat" size="small" />
                        </v-col>
                        <v-col>
                            <span class="pt-2 text-h6">
                                {{ parseRepetition(reservation.periodicReservationId.periodicity) }}
                            </span>
                        </v-col>
                    </v-row>
                </v-col>
            </v-card-text>

            <v-card-actions class="d-flex justify-end ga-3 mt-n3 mb-3 mr-5">
                <TonalButton color="grey" text="Volver" @click="routerBack" />
            </v-card-actions>
        </v-card>

    </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useReservationStore } from '@/store/reservationStore';
import { useRouter } from 'vue-router';
import TonalButton from '@/components/TonalButton.vue'

import { useTime } from '@/composables/useTime';

// Instanciar stores
const reservationStore = useReservationStore();
const router = useRouter();

// Variables reactivas
const reservation = ref(null);

// Extraemos funciones del composable useTime
const {
    getHoursAndMinsFromDate,
    parseToStringDate,
} = useTime();

// Al montar el componente, se asigna la reserva y se redirige si no existe
onMounted(() => {
    reservation.value = reservationStore.getReservation;
    if (!reservation.value) {
        router.push('/reservations');
    }
});


// Traduce el valor de repetición a un string legible
const parseRepetition = (repetition) => {
    if (repetition === 'no_repeat') {
        return 'Sin repetición';
    } else if (repetition === 'daily') {
        return 'Se repite todos los días';
    } else if (repetition === 'weekly') {
        return 'Se repite todas las semanas este día';
    } else if (repetition === 'monthly') {
        return 'Se repite todas los meses este día';
    }
};

const routerBack = () => {
    router.push('/reservations');
};
</script>