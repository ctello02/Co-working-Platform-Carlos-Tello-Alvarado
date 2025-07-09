<template>
    <v-container>
        <v-card @click="infoEvent(reservation)" class="text-center main-container"
            :class="isExpired && showMoreDetails ? 'pastColor' : 'mainColor'" :ripple="false" elevation="0">
            <v-card-title>
                <span class="text-h6">
                    Reserva de
                    {{ reservation?.spaceId?.name || reservation?.materialId?.name }}
                </span>
                <v-divider class="mt-1" v-if="!isExpired" />
            </v-card-title>
            <v-card-text style="position: relative;">
                <div v-if="isExpired && showMoreDetails"
                    class="expired-overlay d-flex align-center justify-center mt-3">
                    <span class="text-h4">Expirada</span>
                </div>

                <v-row>
                    <v-col cols="12" v-if="showMoreDetails">
                        <v-row>
                            <v-col style="color: grey">
                                <span>Usuario:
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
                    <v-col cols="12" v-if="showMoreDetails" class="mt-n3">
                        <v-row>
                            <v-col style="color: grey">
                                <span>Email:
                                </span>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col class="mt-n7">
                                <span class="text-h6">{{ reservation.userId.email }}
                                </span>
                            </v-col>
                        </v-row>
                    </v-col>
                    <v-col cols="12" v-else>
                        <v-row>
                            <v-col style="color: grey">
                                <span>Fecha:
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
                    <v-col cols="12" class="mt-n3">
                        <v-row>
                            <v-col style="color: grey">
                                <span>Horas:
                                </span>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col class="mt-n7">
                                <span class="text-h6">
                                    {{ getHoursAndMinsFromDate(reservation.startTime) }}h
                                    -
                                    {{ getHoursAndMinsFromDate(reservation.endTime) }}h
                                </span>
                            </v-col>
                        </v-row>
                    </v-col>
                    <v-col cols="12" v-if="showMoreDetails">
                        <v-row>
                            <v-col class="">
                                <span v-if="reservation.isPaid" class="text-h6">
                                    Pagada ({{ calculatePrice }}€)
                                </span>
                                <span v-else class="text-h6">
                                    Sin pagar ({{ calculatePrice }}€)
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
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useTime } from '@/composables/useTime';
import { useReservationStore } from '@/store/reservationStore';
import { useSpaceStore } from '@/store/spaceStore';
import { useMaterialStore } from '@/store/materialStore';

const props = defineProps({
    reservation: { type: Object, required: true },
    showMoreDetails: { type: Boolean, required: false },
});

const router = useRouter();
const reservationStore = useReservationStore();
const spaceStore = useSpaceStore();
const materialStore = useMaterialStore();

// Extraemos funciones del composable useTime
const {
    makeMinutesFromIsoLocal,
    getHoursAndMinsFromDate,
    twoDigitsDate,
} = useTime();

const now = ref(Date.now());

let timer;
onMounted(() => {
    timer = setInterval(() => {
        now.value = Date.now();
    }, 15 * 60 * 1000);
});
onUnmounted(() => {
    clearInterval(timer);
});

const isExpired = computed(() => {
    const endLocal = parseLocalISO(props.reservation.endTime);
    return now.value > endLocal.getTime();
});

const infoEvent = (reservation) => {
    if (reservation.spaceId) spaceStore.setSelectedSpace(reservation.spaceId);
    else materialStore.setSelectedMaterial(reservation.materialId);
    reservationStore.setReservation(reservation);
    router.push('/reservationInfo');
};


const calculatePrice = computed(() => {
    const reservation = props.reservation;
    const startStr = reservation.startTime
    const endStr = reservation.endTime
    let dur = 0;
    let pricePer = 0;
    if (reservation?.spaceId) {
        dur = reservation.spaceId.duration      // duración de un bloque, en minutos
        pricePer = reservation.spaceId.pricing       // precio por bloque
    } else {
        dur = reservation.materialId.duration      // duración de un bloque, en minutos
        pricePer = reservation.materialId.pricing       // precio por bloque
    }

    // convierto fecha ISO en minutos
    const startMin = makeMinutesFromIsoLocal(startStr)
    const endMin = makeMinutesFromIsoLocal(endStr)

    // calculo cuántos bloques completos caben
    const blocks = (endMin - startMin) / dur
    //console.log(blocks)

    // en caso de que no sea un múltiplo exacto, redondeamos hacia abajo
    const fullBlocks = Math.floor(blocks)
    const seats = reservation?.seatsReserved || 1
    const total = fullBlocks * pricePer * seats

    // toFixed devuelve una string con dos decimales
    return total.toFixed(2)
});

function parseLocalISO(isoString) {
    // "2025-06-30T22:00:00.000Z" → ["2025-06-30", "22:00:00.000Z"]
    const [datePart, timePart] = isoString.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    // "22:00:00.000Z" → "22:00:00.000" → ["22","00","00.000"]
    const [hh, mm] = timePart.replace('Z', '').split(':').map(Number);
    return new Date(year, month - 1, day, hh, mm);
}
</script>

<style scoped>
.main-container {
    color: black;
    border-radius: 4px;
}

.mainColor {
    background-color: #f8f9f9;
    border: 0.5px solid #333ca0;
    border-left: 5px solid #333ca0;
}

.pastColor {
    background-color: #dfdfdf;
    border: 0.5px solid black;
}

.expired-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 20px;
    background: rgba(255, 255, 255, 0.8);
    pointer-events: none;
    z-index: 10;
}
</style>