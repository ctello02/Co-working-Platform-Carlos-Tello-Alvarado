<template>
    <v-container fluid class="container">
        <v-col>
            <v-row v-if="!reservation" class="mt-8">
                <span class="text-h5">No se encuentran datos</span>
            </v-row>
            <v-row class="mt-n5" v-else>
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
                                    <v-btn icon="mdi-information-outline" variant="text" density="compact"
                                        :ripple="false" @click="showSpaceModal = !showSpaceModal" />
                                </v-row>
                                <v-row>
                                    <v-col>
                                        <v-row><v-col style="color: grey" class="text-center"><span
                                                    class="text-h6">Fecha:</span></v-col></v-row>
                                        <v-row><v-col class="text-center mt-n7"><span class="text-h4">{{
                                            parseToStringDate(new Date(reservation.startTime))
                                                    }}</span></v-col></v-row>
                                    </v-col>
                                </v-row>
                                <v-divider class="mt-6" />
                                <v-row class="d-flex justify-space-between my-2">
                                    <v-col>
                                        <v-row>
                                            <v-col cols="1" class="d-flex align-center">
                                                <v-icon size="small" icon="mdi-timer-sand" />
                                            </v-col>
                                            <v-col class="d-flex align-center ml-2">
                                                <v-select label="Inicio" variant="outlined" density="compact"
                                                    class="mb-n5" :model-value="reservationTimes?.start"
                                                    @update:model-value="val => updateReservation('start', val)"
                                                    :items="availableStartTimes" item-title="time" item-value="time" />
                                            </v-col>
                                        </v-row>
                                    </v-col>
                                    <v-col>
                                        <v-row>
                                            <v-col cols="1" class="d-flex align-center"><v-icon size="small"
                                                    icon="mdi-timer-sand-complete" /></v-col>
                                            <v-col class="d-flex ml-2">
                                                <v-select label="Fin" variant="outlined" density="compact" class="mb-n5"
                                                    :model-value="reservationTimes?.end"
                                                    @update:model-value="val => updateReservation('end', val)"
                                                    :items="availableEndTimes" item-title="time" item-value="time"
                                                    :disabled="!reservationTimes.start" />
                                            </v-col>
                                        </v-row>
                                    </v-col>
                                </v-row>
                                <v-divider />
                                <v-row class="mt-5 mb-n9 d-flex justify-space-between">
                                    <v-col>
                                        <v-row>
                                            <v-col cols="1" class="d-flex align-center"><v-icon size="small"
                                                    icon="mdi-table-chair" /></v-col>
                                            <v-col class="d-flex ml-2" style="height:60px;">
                                                <v-text-field v-model.number="reservationSeats"
                                                    label="Número de asientos" type="number" variant="outlined"
                                                    density="compact" :max="maxAllowed"
                                                    @input="reservationSeats = Math.max(1, reservationSeats)" />
                                            </v-col>
                                        </v-row>
                                    </v-col>
                                    <v-col>
                                        <v-row>
                                            <v-col cols="1" class="d-flex align-center">
                                                <v-icon size="small"
                                                    :icon="space.admitsRepetition ? 'mdi-repeat' : 'mdi-repeat-off'" />
                                            </v-col>
                                            <v-col class="d-flex ml-2">
                                                <span class="text-h6">{{
                                                    space.admitsRepetition ?
                                                        repetitionOptions.find(option => option.value === repetition).label
                                                        : 'Repetición no disponible'
                                                }}</span>
                                            </v-col>
                                        </v-row>
                                    </v-col>
                                </v-row>
                                <v-row v-if="reservation.periodicReservationId" class="mt-5">
                                    <v-col class="d-flex ml-n2 mt-n2 mb-n8">
                                        <v-checkbox label="Aplicar a todas las reservas periódicas"
                                            @click="applyToAll = !applyToAll" />
                                    </v-col>
                                </v-row>
                                <v-row :class="reservation.periodicReservationId ? 'mt-n5 mb-n4' : 'mt-7 mb-n9'">
                                    <v-col>
                                        <v-fade-transition>
                                            <v-alert v-if="reservationTimes.end && maxAllowed === 0" type="error"
                                                variant="tonal" density="compact">
                                                Ya tienes una reserva en ese horario.
                                            </v-alert>
                                            <v-alert
                                                v-if="reservationSeats >= maxAllowed && reservationTimes.end != null"
                                                type="warning" density="compact" variant="tonal">
                                                No se pueden reservar más de {{ maxAllowed }} asientos.
                                            </v-alert>
                                        </v-fade-transition>
                                    </v-col>
                                </v-row>
                            </v-col>
                        </v-card-text>
                        <v-card-actions>
                            <v-row class="mb-6 mr-5 d-flex justify-end ga-3"
                                :class="reservation.periodicReservationId ? 'mt-n5' : 'mt-0'">
                                <TonalButton color="grey" text="Volver" @click="routerBack" />
                                <TonalButton color="blue" text="Actualizar" :loading="isLoading"
                                    :disabled="reservationSeats > maxAllowed || maxAllowed === 0" @click="submit" />
                            </v-row>
                        </v-card-actions>
                    </v-card>
                </v-col>

                <transition name="slide-right" mode="out-in">
                    <v-col v-if="showSpaceModal" class="mt-n5">
                        <SpaceCard :space="space" :adminActions="false" :reserveActions="false" />
                    </v-col>
                </transition>
            </v-row>
        </v-col>
    </v-container>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useReservationStore } from '@/store/reservationStore';
import { useSpaceStore } from '@/store/spaceStore';
import { reservationService } from '@/services/reservationService';
import { useTime } from '@/composables/useTime';
import { useSpaceSlots } from '@/composables/useSpaceSlots';
import TonalButton from '@/components/TonalButton.vue';
import SpaceCard from '@/components/SpaceCard.vue';
import { useToast } from 'vue-toastification';

const router = useRouter();
const reservationStore = useReservationStore();
const spaceStore = useSpaceStore();

const {
    parseToStringDate,
    getHoursAndMinsFromDate,
} = useTime();

// refs
const space = ref(null);
const reservation = ref(null);
const initialReservation = ref(null);
const reservationDate = ref(null);
const reservationsByDate = ref([]);
const periodicReservations = ref([]);

const reservationSeats = ref(1);
const repetition = ref('no_repeat');
const applyToAll = ref(false);
const showSpaceModal = ref(false);
const isLoading = ref(false);

const {
    reservationTimes,
    availableStartTimes,
    availableEndTimes,
    maxAllowed,
    updateReservation
} = useSpaceSlots({
    space,
    reservationDate,
    reservationsByDate,
    periodicReservations,
    initialReservation
});

const repetitionOptions = [
    { label: 'Sin repetición', value: 'no_repeat', occurrences: 0 },
    { label: 'Cada día', value: 'daily', occurrences: 60 },
    { label: 'Cada semana este día', value: 'weekly', occurrences: 16 },
    { label: 'Cada mes este día', value: 'monthly', occurrences: 12 },
];

// onMounted: carga datos y prepara slots
onMounted(async () => {
    space.value = spaceStore.getSelectedSpace;
    reservation.value = reservationStore.getReservation;
    if (!space.value || !reservation.value) return router.push('/reservations');

    initialReservation.value = reservationStore.getReservation;
    reservationSeats.value = reservation.value.seatsReserved;
    repetition.value = reservation.value.periodicReservationId?.periodicity || 'no_repeat';
    reservationDate.value = new Date(reservation.value.startTime);
    reservationDate.value.setHours(0, 0, 0, 0);

    // fetch de reservas puntuales y periódicas…
    const [rawRes, rawPerRes] = await Promise.all([
        reservationService.getReservationsByDate(reservationDate.value),
        reservationService.getPeriodicReservations()
    ]);
    const res = rawRes.data.reservations || [];
    const perRes = rawPerRes.data.periodicReservations || [];

    reservationsByDate.value = res ? res.filter(r => r.spaceId === space.value._id) : [];
    periodicReservations.value = perRes ? perRes.filter(pr => pr.spaceId === space.value._id) : [];
});

async function submit() {
    const toast = useToast();
    isLoading.value = true;

    const day = reservation.value.startTime.split('T')[0];

    const start = reservationTimes.start;
    const end = reservationTimes.end;
    const startISO = new Date(`${day}T${start}:00Z`).toISOString();
    const endISO = new Date(`${day}T${end}:00Z`).toISOString();

    const newReservation = {
        _id: applyToAll.value ? reservation.value.periodicReservationId : reservation.value._id,
        startTime: startISO,
        endTime: endISO,
        seatsReserved: reservationSeats.value,
    };

    try {
        let res;
        if (applyToAll.value === true) {
            res = await reservationService.updatePeriodicReservation(newReservation);
        } else {
            res = await reservationService.updateReservation(newReservation);
        }
        isLoading.value = false;
        toast.success(res.data.message);

        const conflictCount = res.data.conflictCount;
        if (conflictCount) {
            toast.warning(`Se han producido ${conflictCount.length} conflictos. Debe reservar manualmente los días donde ha habido un error.`);
        }
        router.go(-1);
        console.log(res.data);
    } catch (e) {
        toast.error("No se pudo actualizar: " + e.message);
    } finally { isLoading.value = false; }
}

function routerBack() { router.go(-1); }

// Watcher validar número de asientos. Se evita que el usuario teclee numeros incorrectos
// ------------------------------------------------
watch(reservationSeats, (newValue) => {
    if (newValue > maxAllowed.value) {
        reservationSeats.value = reservationSeats.value - 1;
    }
});
// Watchers para resetear reservationSeats al cambiar reservationTimes.start o reservationTimes.end
// ------------------------------------------------
watch(() => reservationTimes.start, () => {
    reservationSeats.value = 1;
});
watch(() => reservationTimes.end, () => {
    if (reservationTimes.start === getHoursAndMinsFromDate(reservation.value.startTime) &&
        reservationTimes.end === getHoursAndMinsFromDate(reservation.value.endTime)) {
        reservationSeats.value = reservation.value.seatsReserved;
    } else
        reservationSeats.value = 1;

});
</script>

<style scoped>
.slide-right-enter-active,
.slide-right-leave-active {
    transition: opacity .3s ease, transform .3s ease;
}

.slide-right-enter-from,
.slide-right-leave-to {
    opacity: 0;
    transform: translateX(100px);
}
</style>