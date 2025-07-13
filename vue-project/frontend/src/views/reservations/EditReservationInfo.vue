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
                                    <span class="text-h4">{{ space?.name || material?.name }}</span>
                                    <v-btn icon="mdi-information-outline" variant="text" density="compact"
                                        :ripple="false"
                                        @click="reservation.spaceId ? showSpaceModal = !showSpaceModal : showMaterialModal = !showMaterialModal" />
                                </v-row>
                                <v-row>
                                    <v-col>
                                        <v-row>
                                            <v-col style="color: grey" class="text-center"><span
                                                    class="text-h6">Fecha:</span>
                                            </v-col>
                                        </v-row>
                                        <v-row>
                                            <v-col class="text-center mt-n7"><span class="text-h4">
                                                    {{
                                                        parseToStringDate(new Date(reservation.startTime))
                                                    }}
                                                </span>
                                            </v-col>
                                        </v-row>
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
                                <v-row class="mt-3 d-flex justify-center">
                                    <v-col v-if="reservation.spaceId">
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
                                    <v-col :cols="admitsRepetition ? '6' : '7'" class="mt-1">
                                        <v-row class="d-flex align-center justify-center ">
                                            <v-col cols="1" class="d-flex align-center">
                                                <v-icon size="small"
                                                    :icon="admitsRepetition ? 'mdi-repeat' : 'mdi-repeat-off'" />
                                            </v-col>
                                            <v-col class="d-flex align-start"
                                                :class="reservation.spaceId ? 'ml-2' : 'ml-n2'">
                                                <span class="text-h6">
                                                    {{
                                                        admitsRepetition ?
                                                            repetitionOptions.find(option => option.value === repetition).label
                                                            : 'Repetición no disponible'
                                                    }}
                                                </span>
                                            </v-col>
                                        </v-row>
                                    </v-col>
                                </v-row>

                                <v-fade-transition>
                                    <v-row class="my-2 mb-n9">
                                        <v-col>
                                            <v-fade-transition>
                                                <v-row
                                                    v-if="!reservation.isPaid && reservationTimes.end && maxAllowed !== 0"
                                                    class="mb-0">
                                                    <v-divider class="mt-4 mb-1 mx-3" />
                                                    <v-col cols="1" class="d-flex align-center ">
                                                        <v-icon icon="mdi-hand-coin-outline" size="small" />
                                                    </v-col>
                                                    <v-col class="d-flex align-start ml-n3">
                                                        <span class="text-h6">
                                                            Precio:
                                                            {{
                                                                calculatePrice(reservationTimes.start, reservationTimes.end)
                                                            }}€ (Sin pagar)
                                                        </span>
                                                    </v-col>
                                                </v-row>
                                            </v-fade-transition>
                                            <v-fade-transition>
                                                <v-row v-if="reservation.isPaid" class="mb-0">
                                                    <v-divider class="mt-4 mb-1 mx-3" />
                                                    <v-col cols="1" class="d-flex align-center ">
                                                        <v-icon icon="mdi-hand-coin-outline" size="small" />
                                                    </v-col>
                                                    <v-col class="d-flex align-start ml-n3">
                                                        <span class="text-h6">
                                                            Precio pagado: {{ initialPrice }}€
                                                        </span>
                                                    </v-col>
                                                    <v-col v-if="reservationTimes.end && initialPrice != calculatePrice(reservationTimes.start,
                                                        reservationTimes.end)" class="d-flex align-center ml-n8 ga-3">
                                                        <v-tooltip v-model="showTooltip" location="top">
                                                            <template v-slot:activator="{ props }">
                                                                <v-icon v-bind="props" size="small">
                                                                    mdi-information-outline
                                                                </v-icon>
                                                            </template>
                                                            <span>Se devolverá el pago y se efectuará el cobro del nuevo
                                                                importe.</span>
                                                            <span v-if="applyToAll">
                                                                <br> Solo se pagará esta reserva.
                                                            </span>
                                                        </v-tooltip>

                                                        <span class="text-h6">
                                                            Precio a pagar: {{ calculatePrice(reservationTimes.start,
                                                                reservationTimes.end) }}€
                                                        </span>
                                                    </v-col>
                                                </v-row>
                                            </v-fade-transition>
                                        </v-col>
                                    </v-row>
                                </v-fade-transition>

                                <v-row v-if="reservation.periodicReservationId && reservationTimes.end" class="mt-5">
                                    <v-col class="d-flex ml-n2 mt-n4 mb-n8">
                                        <v-checkbox label="Aplicar a todas las reservas periódicas" v-model="applyToAll"
                                            @click="applyToAll = !applyToAll" />
                                    </v-col>
                                </v-row>
                                <v-fade-transition>
                                    <v-row v-if="reservationSeats >= maxAllowed"
                                        :class="reservation.periodicReservationId ? 'mt-n3 mb-n4' : 'mt-3 mb-n9'">
                                        <v-col class="d-flex flex-column ga-2">
                                            <v-alert v-if="reservationTimes.end && maxAllowed === 0" type="error"
                                                variant="tonal" density="compact">
                                                Ya tienes una reserva en ese horario.
                                            </v-alert>
                                            <v-alert v-if="reservationSeats >= maxAllowed && maxAllowed !== 0"
                                                type="warning" density="compact" variant="tonal">
                                                No se pueden reservar más de {{ maxAllowed }} asientos.
                                            </v-alert>
                                        </v-col>
                                    </v-row>
                                </v-fade-transition>
                            </v-col>
                        </v-card-text>
                        <v-card-actions>
                            <v-row class="mb-6 mr-5" :class="reservation.periodicReservationId ? 'mt-n5' : 'mt-0'">
                                <TonalButton class="ml-8" color="grey" text="Reiniciar" @click="initialValues" />
                                <v-spacer></v-spacer>
                                <div class="d-flex ga-3">
                                    <TonalButton color="grey" text="Volver" @click="routerBack" />
                                    <TonalButton color="blue" text="Actualizar" :loading="isLoading"
                                        :disabled="isUpdateDisabled" @click="submit" />
                                </div>
                            </v-row>
                        </v-card-actions>
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
import { ref, onMounted, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useReservationStore } from '@/store/reservationStore';
import { useSpaceStore } from '@/store/spaceStore';
import { useMaterialStore } from '@/store/materialStore';
import { reservationService } from '@/services/reservationService';
import { paypalService } from '@/services/paypalService';
import { useTime } from '@/composables/useTime';
import { useSpaceSlots } from '@/composables/useSpaceSlots';
import { useMaterialSlots } from '@/composables/useMaterialSlots';
import TonalButton from '@/components/TonalButton.vue';
import SpaceCard from '@/components/SpaceCard.vue';
import MaterialCard from '@/components/MaterialCard.vue';
import { useToast } from 'vue-toastification';

const router = useRouter();
const reservationStore = useReservationStore();
const spaceStore = useSpaceStore();
const materialStore = useMaterialStore();

const {
    parseToStringDate,
    getHoursAndMinsFromDate,
    makeMinutes,
} = useTime();

// refs
const space = ref(null);
const material = ref(null);
const reservation = ref(null);
const initialReservation = ref(null);
const initialPrice = ref(null);
const reservationDate = ref(null);
const reservationsByDate = ref([]);
const periodicReservations = ref([]);

const reservationSeats = ref(1);
const admitsRepetition = ref(false);
const repetition = ref('no_repeat');
const applyToAll = ref(false);
const showSpaceModal = ref(false);
const showMaterialModal = ref(false);
const showTooltip = ref(false)
const isLoading = ref(false);

const repetitionOptions = [
    { label: 'Sin repetición', value: 'no_repeat', occurrences: 0 },
    { label: 'Cada día', value: 'daily', occurrences: 60 },
    { label: 'Cada semana este día', value: 'weekly', occurrences: 16 },
    { label: 'Cada mes este día', value: 'monthly', occurrences: 12 },
];

// onMounted: carga datos y prepara slots
onMounted(async () => {
    reservation.value = reservationStore.getReservation;

    if (!reservation.value) return router.push('/reservations');

    if (reservation.value.spaceId) {
        space.value = spaceStore.getSelectedSpace;
        admitsRepetition.value = space?.value.admitsRepetition;
    } else {
        material.value = materialStore.getSelectedMaterial;
        admitsRepetition.value = material?.value.admitsRepetition;
    }

    initialReservation.value = reservationStore.getReservation;
    let start = getHoursAndMinsFromDate(reservation.value.startTime);
    let end = getHoursAndMinsFromDate(reservation.value.endTime);
    initialPrice.value = calculatePrice(start, end);
    reservationSeats.value = reservation.value.seatsReserved;
    repetition.value = reservation.value.periodicReservationId?.periodicity || 'no_repeat';
    reservationDate.value = new Date(reservation.value.startTime);
    reservationDate.value.setHours(0, 0, 0, 0);

    try {
        const [resResult, perResResult] = await Promise.allSettled([
            reservationService.getReservationsByDate(reservationDate.value),
            reservationService.getPeriodicReservations()
        ]);

        let rawRes = { data: { reservations: [] } };
        let rawPerRes = { data: { periodicReservations: [] } };

        if (resResult.status === 'fulfilled') {
            rawRes = resResult.value;
        } else {
            console.error('Error al obtener reservas puntuales:', resResult.reason);
        }

        if (perResResult.status === 'fulfilled') {
            rawPerRes = perResResult.value;
        } else {
            console.error('Error al obtener reservas periódicas:', perResResult.reason);
        }

        const res = rawRes.data.reservations || [];
        const perRes = rawPerRes.data.periodicReservations || [];

        reservationsByDate.value = res.filter(r =>
            reservation.value.spaceId
                ? r.spaceId === space.value._id
                : r.materialId === material.value._id
        );

        periodicReservations.value = perRes.filter(pr =>
            reservation.value.spaceId
                ? pr.spaceId === space.value._id
                : pr.materialId === material.value._id
        );

    } catch (err) {
        console.error('Error inesperado al gestionar las reservas:', err);
    }
});

// Instanciamos ambos composables 
const spaceSlots = useSpaceSlots({
    space,
    reservationDate,
    reservationsByDate,
    periodicReservations,
    initialReservation: reservation
});
const materialSlots = useMaterialSlots({
    material,
    reservationDate,
    reservationsByDate,
    periodicReservations,
    initialReservation: reservation
});

const slotsApi = computed(() => {
    if (!reservation.value) return spaceSlots;
    return reservation.value.spaceId
        ? spaceSlots
        : materialSlots;
});

//-----------------------------------------------------------------------------
const reservationTimes = computed(() => slotsApi.value.reservationTimes);
const availableStartTimes = computed(
    () => slotsApi.value.availableStartTimes.value
);
const availableEndTimes = computed(
    () => slotsApi.value.availableEndTimes.value
);
const maxAllowed = computed(
    () => slotsApi.value.maxAllowed.value
);
function updateReservation(key, val) {
    return slotsApi.value.updateReservation(key, val);
}

function calculatePrice(start, end) {
    const startMin = makeMinutes(start)
    const endMin = makeMinutes(end)
    let dur = 0;
    let pricePer = 0;
    if (reservationStore.getReservation?.spaceId) {
        dur = space?.value.duration      // duración de un bloque, en minutos
        pricePer = space?.value.pricing       // precio por bloque
    } else {
        dur = material?.value.duration      // duración de un bloque, en minutos
        pricePer = material?.value.pricing       // precio por bloque
    }

    // calculo cuántos bloques completos caben
    const blocks = (endMin - startMin) / dur

    // en caso de que no sea un múltiplo exacto, redondeamos hacia abajo
    const fullBlocks = Math.floor(blocks)
    const total = fullBlocks * pricePer * reservationSeats?.value

    return total.toFixed(2)
}

async function submit() {
    const toast = useToast();
    isLoading.value = true;

    // Guardamos original para poder revertir si hay algún error
    const original = {
        _id: reservation.value._id,
        startTime: reservation.value.startTime,
        endTime: reservation.value.endTime,
        seatsReserved: reservation.value.seatsReserved,
    };

    const day = reservation.value.startTime.split('T')[0];
    const start = reservationTimes.value.start;
    const end = reservationTimes.value.end;

    const startISO = new Date(`${day}T${start}:00Z`).toISOString();
    const endISO = new Date(`${day}T${end}:00Z`).toISOString();

    const newReservation = {
        _id: applyToAll.value
            ? reservation.value.periodicReservationId
            : reservation.value._id,
        startTime: startISO,
        endTime: endISO,
        seatsReserved: reservationSeats.value,
    };

    const newPrice = calculatePrice(start, end);

    try {
        let res;
        if (applyToAll.value === true) {
            res = await reservationService.updatePeriodicReservation(newReservation);
        } else {
            res = await reservationService.updateReservation(newReservation);
        }

        if (res.data.conflictCount?.length) {
            toast.warning(
                `Se han producido ${res.data.conflictCount.length} conflictos. ` +
                `Debe reservar manualmente los días donde ha habido un error.`
            );
        }

        if (reservation.value.isPaid) {
            try {
                // Reembolso completo
                await paypalService.refundPayment(reservation.value._id);
                toast.success('Pago original reembolsado con éxito.');

                // Crear orden nueva por el nuevo importe
                const orderRes = await paypalService.createOrder(
                    reservation.value._id,
                    newPrice
                );

                console.log(orderRes.data)
                console.log(orderRes.data.orderID)

                // Capturar nueva orden
                await paypalService.captureOrder(
                    orderRes.data.orderID,
                    reservation.value._id
                );
                toast.success('Nuevo pago completado con éxito.');
            } catch (err) {
                console.error('Error de PayPal:', err);
                if (applyToAll.value) {
                    await reservationService.updatePeriodicReservation({
                        _id: reservation.value.periodicReservationId,
                        ...original
                    });
                } else {
                    await reservationService.updateReservation(original);
                }

                reservationStore.setReservation({
                    ...reservation.value,
                    ...original
                });

                toast.error('Hubo un error con PayPal. La reserva ha sido revertida.');
                router.go(-1);
                return;
            }
        }

        reservationStore.setReservation({
            ...reservation.value,
            ...newReservation
        });

        toast.success(res.data.message);
        router.go(-1);
    } catch (err) {
        console.error('Error al actualizar la reserva:', err);
        toast.error("No se pudo actualizar la reserva: " + err.message);
    } finally { isLoading.value = false; }
}

const isUpdateDisabled = computed(() => {
    if (!reservation.value) return true

    // hora original
    const originalStart = getHoursAndMinsFromDate(reservation.value.startTime)
    const originalEnd = getHoursAndMinsFromDate(reservation.value.endTime)

    // No ha cambiado nada (start, end y seats)
    const sameAsOriginal =
        reservationTimes.value.start === originalStart &&
        reservationTimes.value.end === originalEnd &&
        reservationSeats.value === reservation.value.seatsReserved

    // No hay fin seleccionado
    const noEndSelected = !reservationTimes.value.end

    // Más asientos de los permitidos
    const tooManySeats = reservationSeats.value > maxAllowed.value

    // Flag para cuando el usuario ya tiene reservado esa hora (maxAllowed === 0)
    const isReservedByMe = maxAllowed.value === 0

    return sameAsOriginal
        || noEndSelected
        || tooManySeats
        || isReservedByMe
})

function initialValues() {
    reservationTimes.value.start = getHoursAndMinsFromDate(reservation.value.startTime);
    reservationTimes.value.end = getHoursAndMinsFromDate(reservation.value.endTime);
    reservationSeats.value = reservation.value.seatsReserved;
    applyToAll.value = false;
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
watch(
    () => reservationTimes.value.start,
    () => {
        reservationSeats.value = 1
    }
)

watch(
    () => reservationTimes.value.end,
    () => {

        const initialStart = getHoursAndMinsFromDate(reservation.value.startTime)
        const initialEnd = getHoursAndMinsFromDate(reservation.value.endTime)

        if (reservationTimes.value.start === initialStart &&
            reservationTimes.value.end === initialEnd) {
            reservationSeats.value = reservation.value.seatsReserved
        } else if (maxAllowed.value === 0) {
            reservationSeats.value = 0
        }

    }
)
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