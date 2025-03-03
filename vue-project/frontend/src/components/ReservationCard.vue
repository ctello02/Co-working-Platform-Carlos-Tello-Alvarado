<template>
    <v-container>
        <v-card @click="infoEvent(reservation)" class="text-center" max-width="400" :ripple="false">
            <v-card-title>
                <span class="text-h6">Reserva de {{ reservation?.spaceId.name }}</span>
                <v-divider class="mt-1" />
            </v-card-title>
            <v-card-text>
                <v-row>
                    <v-col cols="12">
                        <v-row>
                            <v-col style="color: grey">
                                <span class="text-h7">Fecha:
                                </span>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col class="mt-n7">
                                <span class="text-h6"> {{ twoDigitsDate(new
                                    Date(reservation.startTime)) }}
                                </span>
                            </v-col>
                        </v-row>
                    </v-col>
                    <v-col cols="12">
                        <v-row>
                            <v-col style="color: grey">
                                <span class="text-h7">Horas:
                                </span>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col class="mt-n7">
                                <span class="text-h6">
                                    {{
                                        getHoursAndMinsFromDate(reservation.startTime)
                                    }}h
                                    -
                                    {{
                                        getHoursAndMinsFromDate(reservation.endTime)
                                    }}h
                                </span>
                            </v-col>
                        </v-row>
                    </v-col>
                </v-row>
            </v-card-text>
        </v-card>
    </v-container>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useTime } from '@/composables/useTime';
import { useReservationStore } from '@/store/reservationStore';

const props = defineProps({
    reservation: { type: Object, required: true }
})

const router = useRouter();
const reservationStore = useReservationStore();

// Extraemos funciones del composable useTime
const {
    getHoursAndMinsFromDate,
    twoDigitsDate,
} = useTime();

const infoEvent = (reservation) => {
    reservationStore.setReservation(reservation);
    router.push('/reservationInfo');
}
</script>