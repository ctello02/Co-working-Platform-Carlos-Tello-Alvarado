<template>
    <v-container>
        <v-card @click="infoEvent(reservation)" class="text-center main-container" :ripple="false" elevation="0">
            <v-card-title>
                <span class="text-h6">
                    Reserva de
                    {{ reservation?.spaceId?.name || reservation?.materialId?.name }}
                </span>
                <v-divider class="mt-1" />
            </v-card-title>
            <v-card-text>
                <v-row>
                    <v-col cols="12" v-if="showMoreDetails">
                        <v-row>
                            <v-col style="color: grey">
                                <span class="text-h7">Usuario:
                                </span>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col class="mt-n7">
                                <span class="text-h6"> {{ reservation.userId.name }}
                                </span>
                            </v-col>
                        </v-row>
                    </v-col>
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
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useTime } from '@/composables/useTime';
import { useReservationStore } from '@/store/reservationStore';
import { useSpaceStore } from '@/store/spaceStore';
import { useMaterialStore } from '@/store/materialStore';

const props = defineProps({
    reservation: { type: Object, required: true },
    showMoreDetails: { type: Boolean, required: false },
});

onMounted(() => {
    console.log(props.reservation);

})

const router = useRouter();
const reservationStore = useReservationStore();
const spaceStore = useSpaceStore();
const materialStore = useMaterialStore();

// Extraemos funciones del composable useTime
const {
    getHoursAndMinsFromDate,
    twoDigitsDate,
} = useTime();

const infoEvent = (reservation) => {
    if (reservation.spaceId) spaceStore.setSelectedSpace(reservation.spaceId);
    else materialStore.setSelectedMaterial(reservation.materialId);
    reservationStore.setReservation(reservation);
    router.push('/reservationInfo');
}
</script>

<style scoped>
.main-container {
    background-color: #f8f9f9;
    color: black;
    border: 0.5px solid #333ca0;
    border-left: 5px solid #333ca0;
    border-radius: 4px;
}
</style>