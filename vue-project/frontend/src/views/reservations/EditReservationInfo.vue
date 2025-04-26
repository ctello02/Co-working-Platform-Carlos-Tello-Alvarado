<template>
    <v-container fluid class="container">
        <v-col>
            <v-row>
                <span class="text-h4">Confirmar reserva</span>
            </v-row>
            <v-row v-if="!reservation" class="mt-8">
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
                                                    class="mb-n5" :model-value="reservationTimes.start"
                                                    @update:model-value="val => updateReservation('start', val)"
                                                    :items="availableTimes" item-title="time" item-value="time" />
                                            </v-col>
                                        </v-row>
                                    </v-col>
                                    <v-col>
                                        <v-row>
                                            <v-col cols="1" class="d-flex align-center"><v-icon size="small"
                                                    icon="mdi-timer-sand-complete" /></v-col>
                                            <v-col class="d-flex ml-2">
                                                <v-select label="Fin" variant="outlined" density="compact" class="mb-n5"
                                                    :model-value="reservationTimes.end"
                                                    @update:model-value="val => updateReservation('end', val)"
                                                    :items="endTimes" item-title="time" item-value="time"
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
                                                    density="compact" :max="maxSeatsAllowed"
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
                                            <v-alert v-if="reservedByUserModal" type="warning" density="compact"
                                                variant="tonal">
                                                Ya tienes una reserva en ese horario.
                                            </v-alert>
                                            <v-alert
                                                v-if="reservationSeats >= maxSeatsAllowed && reservationTimes.end != null"
                                                type="warning" density="compact" variant="tonal">
                                                No se pueden reservar más de {{ maxSeatsAllowed }} asientos.
                                            </v-alert>
                                        </v-fade-transition>
                                    </v-col>
                                </v-row>
                            </v-col>
                        </v-card-text>
                        <v-card-actions>
                            <v-row class="mb-3 mr-2 d-flex justify-end ga-3"
                                :class="reservation.periodicReservationId ? 'mt-n5' : 'mt-0'">
                                <TonalButton color="grey" text="Volver" @click="routerBack" />
                                <TonalButton color="blue" text="Actualizar" :loading="isLoading"
                                    :disabled="reservationSeats > maxSeatsAllowed || reservedByUserModal"
                                    @click="submitUpdate" />
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
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useReservationStore } from '@/store/reservationStore';
import { useSpaceStore } from '@/store/spaceStore';
import { reservationService } from '@/services/reservationService';
import { useTime } from '@/composables/useTime';
import TonalButton from '@/components/TonalButton.vue';


const router = useRouter();
const reservationStore = useReservationStore();
const spaceStore = useSpaceStore();
const {
    getHoursAndMinsFromDate,
    makeMinutesFromIsoLocal,
    makeMinutes,
    makeHoursAndMinutes,
    parseToStringDate,
    occursOn,
} = useTime();

// refs
const reservation = ref(null);
const space = ref(null);
const periodicReservations = ref([]);
const reservationsByDate = ref([]);
const reservationTimes = ref({ start: null, end: null });
const reservationSeats = ref(1);
const repetition = ref('no_repeat');
const applyToAll = ref(false);
const showSpaceModal = ref(false);
const reservedByUserModal = ref(false);
const isLoading = ref(false);

const repetitionOptions = [
    { label: 'Sin repetición', value: 'no_repeat', occurrences: 0 },
    { label: 'Cada día', value: 'daily', occurrences: 60 },
    { label: 'Cada semana este día', value: 'weekly', occurrences: 16 },
    { label: 'Cada mes este día', value: 'monthly', occurrences: 12 },
];

// fechas
const reservationDate = ref(null);

// onMounted: carga datos y prepara slots
onMounted(async () => {
    space.value = spaceStore.getSelectedSpace;
    reservation.value = reservationStore.getReservation;
    if (!space.value || !reservation.value) return router.push('/reservations');

    // inicializa tiempos
    reservationTimes.value.start = getHoursAndMinsFromDate(reservation.value.startTime);
    reservationTimes.value.end = getHoursAndMinsFromDate(reservation.value.endTime);

    reservationSeats.value = reservation.value.seatsReserved;
    repetition.value = reservation.value.periodicReservationId?.periodicity || 'no_repeat';

    reservationDate.value = new Date(reservation.value.startTime);
    reservationDate.value.setHours(0, 0, 0, 0);

    // fetch
    await Promise.all([
        reservationService.getPeriodicReservations().then(r => {
            periodicReservations.value = r.data.periodicReservations
                .filter(pr => pr.spaceId === space.value._id);
        }),
        reservationService.getReservationsByDate(reservation.value.startTime).then(r => {
            reservationsByDate.value = r.data.reservations
                .filter(r => r.spaceId === space.value._id);
        })
    ]);

});

// Computed: todas las reservas normalizadas
const allReservations = computed(() => {
    const arr = [];
    // ocurrencias reales
    reservationsByDate.value.forEach(r => {
        const start = makeMinutesFromIsoLocal(r.startTime);
        const end = makeMinutesFromIsoLocal(r.endTime);
        arr.push({ id: r._id, user: r.userId, start, end, seats: r.seatsReserved });
    });
    // periódicas
    periodicReservations.value.forEach(pr => {
        if (occursOn(pr, reservationDate.value)) {
            const start = makeMinutesFromIsoLocal(pr.startTime);
            const end = makeMinutesFromIsoLocal(pr.endTime);
            arr.push({ id: pr._id, user: pr.userId, start, end, seats: pr.seatsReserved });
        }
    });
    return arr;
});

// Computed: todos los slots cada 15' con seatsLeft y reservedByUser
const allSlots = computed(() => {
    const opening = space.value.opening;
    const closing = space.value.closing;
    const interval = 15;
    const cap = space.value.seats;
    const res = allReservations.value;
    const me = reservation.value.userId;
    const reservationId = reservation.value._id;
    const list = [];
    for (let t = opening; t <= closing; t += interval) {
        const used = res
            .filter(r => r.id !== reservationId && r.start <= t && t < r.end)
            .reduce((s, r) => s + r.seats, 0);
        const byMe = res.some(r => r.id !== reservationId && r.user === me && r.start <= t && t < r.end);
        list.push({
            time: makeHoursAndMinutes(t),
            minutes: t,
            seatsLeft: Math.max(cap - used, 0),
            reservedByUser: byMe
        });
    }
    return list;
});

// Computed: slots de inicio (availableTimes)
const availableTimes = computed(() => {
    const closing = space.value.closing;
    const interval = 15;
    const dur = space.value.duration;
    const slots = allSlots.value;

    return slots.filter((s, idx) => {
        // no pase de cierre
        if (s.minutes + dur > closing) return false;
        // entienda hoy/hora pasada
        const now = new Date();
        const m = now.getHours() * 60 + now.getMinutes();

        if (reservationDate.value <= now.setHours(0, 0, 0, 0) && s.minutes < m) return false;
        // cada sub-slot libre
        for (let k = 0; k < dur / interval; k++) {
            const sub = slots[idx + k];
            if (!sub || sub.seatsLeft <= 0) return false;
        }
        return true;
    });
});

// Computed: posibles endTimes en pasos de duration
const endTimes = computed(() => {
    const startMin = makeMinutes(reservationTimes.value.start);
    if (startMin == null) return [];
    const closing = space.value.closing;
    const dur = space.value.duration;
    const slots = allSlots.value;
    const res = [];
    for (let e = startMin + dur; e <= closing; e += dur) {
        const sub = slots.filter(x => x.minutes >= startMin && x.minutes < e);
        if (sub.some(x => x.seatsLeft === 0)) break;
        const f = slots.find(x => x.minutes === e);
        res.push(f || { time: makeHoursAndMinutes(e), minutes: e, seatsLeft: space.value.seats });
    }
    return res;
});

// Computed: máximo asientos (mínimo seatsLeft en [start,end))
const maxSeatsAllowed = computed(() => {
    if (!reservationTimes.value.start || !reservationTimes.value.end) return 1;

    const start = makeMinutes(reservationTimes.value.start);
    const end = makeMinutes(reservationTimes.value.end);

    const slicedSlots = allSlots.value.filter(s => s.minutes >= start && s.minutes < end);

    const isReserved = slicedSlots.some(s => s.reservedByUser === true && s.id !== reservation.value._id);
    if (isReserved) {
        reservedByUserModal.value = true;
        return 1;
    }

    if (!slicedSlots.length) return 1;

    return slicedSlots.reduce((mn, s) => Math.min(mn, s.seatsLeft), space.value.seats);
});

function updateReservation(key, val) {
    if (key === 'start') {
        reservationTimes.value.start = val;
        reservationTimes.value.end = null;
    } else {
        reservationTimes.value.end = val;
    }
    // reiniciar variables
    reservationSeats.value = 1;
    reservedByUserModal.value = false;
}

async function submitUpdate() {
    isLoading.value = true;
    try {
        await reservationService.updateReservation(reservation.value._id, {
            startTime: reservationTimes.value.start,     /* payload desde reservationTimes */
            endTime: reservationTimes.value.end,       /* lo mismo */
            seatsReserved: reservationSeats.value,
            applyToAll: applyToAll.value
        });
        // feedback y redirección
    } catch (e) {
        // toast error (p.ej. “No se pudo actualizar: ${e.message}”)
    } finally { isLoading.value = false; }
}

function routerBack() { router.go(-1); }

// Watcher validar número de asientos. Se evita que el usuario teclee numeros incorrectos
// ------------------------------------------------
watch(reservationSeats, (newValue) => {
    if (newValue > maxSeatsAllowed.value) {
        reservationSeats.value = reservationSeats.value - 1;
    }
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