<template>
    <v-container class="pa-5 container">
        <v-card v-if="reservation && reservationUser" class="mx-auto" max-width="600">
            <v-img :src="reservation.spaceId?.image || reservation.materialId?.image" color="surface-variant"
                height="300px" cover />
            <v-card-text v-if="reservation">
                <v-col>
                    <v-row class="mt-n5 mb-n3" cols="12">
                        <v-col>
                            <span class="text-h4">{{ reservation.spaceId?.name || reservation.materialId?.name }}</span>
                        </v-col>
                        <v-col class="d-flex align-center justify-end ga-3">
                            <v-btn v-if="canEdit" @click="openEditReservationInfo()" variant="tonal" size="small"
                                icon="mdi-pencil" />
                            <v-btn v-if="canEdit" @click="deleteModal = true" variant="tonal" size="small"
                                icon="mdi-trash-can-outline" />
                        </v-col>
                    </v-row>

                    <v-row class="my-n3" cols="12">
                        <v-col cols="1" class="d-flex align-center">
                            <v-icon icon="mdi-text" />
                        </v-col>
                        <v-col>
                            <span class="text-h6">{{ reservation.spaceId?.description ||
                                reservation.materialId?.description }}</span>
                        </v-col>
                    </v-row>

                    <v-row v-if="userStore.isAdmin" class="my-n3" cols="12">
                        <v-col cols="1" class="d-flex align-center">
                            <v-icon icon="mdi-account-outline" />
                        </v-col>
                        <v-col>
                            <span class="text-h6">{{ reservationUser?.name }}, {{ reservationUser?.email }}</span>
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
                                <v-col :cols="reservation.spaceId ? '2' : '1'" class="d-flex align-center">
                                    <v-icon icon="mdi-clock-outline" size="small" />
                                </v-col>
                                <v-col>
                                    <span class="pt-2 text-h6">
                                        {{ getHoursAndMinsFromDate(reservation.startTime) }}h
                                        -
                                        {{ getHoursAndMinsFromDate(reservation.endTime) }}h
                                    </span>
                                </v-col>
                            </v-row>
                        </v-col>
                        <v-col v-if="reservation.seatsReserved">
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

                    <v-row class="my-n3 d-flex justify-center align-center" cols="12">
                        <v-col>
                            <v-row>
                                <v-col cols="2" class="d-flex align-center">
                                    <v-icon icon="mdi-repeat" size="small" />
                                </v-col>
                                <v-col>
                                    <span class="pt-2 text-h6">
                                        <span v-if="reservation.periodicReservationId">
                                            {{ parseRepetition(reservation.periodicReservationId.periodicity) }}
                                        </span>
                                        <span v-else>
                                            Sin repetición
                                        </span>
                                    </span>
                                </v-col>
                            </v-row>
                        </v-col>
                        <v-col v-if="reservation">
                            <v-row>
                                <v-col cols="2" class="d-flex align-center">
                                    <v-icon icon="mdi-hand-coin-outline" size="small" />
                                </v-col>
                                <v-col>
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
                </v-col>
            </v-card-text>

            <v-card-actions class="d-flex justify-end ga-3 mt-n3 mb-5 mr-5">
                <TonalButton color="grey" text="Volver" @click="routerBack" />

                <TonalButton v-if="!buttonsRendered && !reservation.isPaid && reservationUser._id !== userStore.getId"
                    color="blue" text="Marcar como pagada" @click="markPaidModal = true" />

                <TonalButton :color="show ? 'grey' : 'blue'" :loading="isLoading"
                    v-if="!buttonsRendered && !reservation.isPaid && reservationUser._id === userStore.getId"
                    :text="show ? 'Cancelar pago' : 'Pagar'" @click="show ? closePayPal() : startPayPalPayment()" />
            </v-card-actions>

            <v-expand-transition>
                <div v-show="show" class="mt-n2 ma-7">
                    <div style="width: 100%;" id="paypal-button-container" />
                </div>
            </v-expand-transition>
        </v-card>

        <AskModal v-model="deleteModal" :title="'¿Borrar reserva?'"
            :message="'¿Estás seguro de que quieres borrar esta reserva?'" :actionText="'Borrar reserva'"
            :closeModal="closeDialog" :action="deleteReservation"
            :checkboxAction="reservationStore.getReservation?.periodicReservationId ? toggleCheckbox : null" />

        <AskModal v-model="markPaidModal" :title="'¿Se ha pagado la reserva?'"
            :message="'¿Ha pagado el cliente el importe de la reserva?'" :actionText="'Marcar como pagada'"
            :closeModal="() => markPaidModal = false" :action="markAsPaid" />

    </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useUserStore } from '@/store/userStore';
import { useReservationStore } from '@/store/reservationStore';
import { useSpaceStore } from '@/store/spaceStore';
import { useMaterialStore } from '@/store/materialStore';
import { useRouter } from 'vue-router';
import TonalButton from '@/components/TonalButton.vue'
import AskModal from '@/components/AskModal.vue';
import { reservationService } from '@/services/reservationService';
import { paypalService } from '@/services/paypalService';
import { useTime } from '@/composables/useTime';
import { useToast } from 'vue-toastification';

// Instanciar stores
const userStore = useUserStore();
const reservationStore = useReservationStore();
const spaceStore = useSpaceStore();
const materialStore = useMaterialStore();
const router = useRouter();

// Variables reactivas
const reservationUser = ref(null);
const space = ref(null);
const material = ref(null);
const reservation = ref(null);
const reservationSeats = ref(1);
const canEdit = ref(false);
const deleteModal = ref(false);
const markPaidModal = ref(false);
const bulkDeleteReservations = ref(false);

const paymentStarted = ref(false);
const paypalLoaded = ref(false);
const buttonsRendered = ref(false);
const isLoading = ref(false);

const show = ref(false);

// Extraemos funciones del composable useTime
const {
    getHoursAndMinsFromDate,
    parseToStringDate,
    calcPastEvents,
    isWithinNext24Hours,
    isToday,
    parseDateTo_YYYYMMDD_HHMM,
    makeMinutesFromIsoLocal
} = useTime();

// Al montar el componente, se asigna la reserva y se redirige si no existe
onMounted(async () => {
    reservation.value = await reservationStore.getReservation;

    if (!reservation.value) {
        router.push('/reservations');
    } else {
        if (reservation.value.spaceId) {
            space.value = spaceStore.getSelectedSpace;
            reservationSeats.value = reservation.value.seatsReserved;
        } else {
            material.value = materialStore.getSelectedMaterial;
        }

        if (reservation.value.toPayment) {
            startPayPalPayment();
        }

        getUserByReservationId(reservation.value._id);

        // si es el pasado, es hoy, o queda menos de 24 horas para que empiece, 
        // NO se puede editar
        if (calcPastEvents(reservation.value.startTime) ||
            isToday(reservation.value.startTime) ||
            isWithinNext24Hours(parseDateTo_YYYYMMDD_HHMM(reservation.value.startTime))
        )
            canEdit.value = false;
        else canEdit.value = true;
    }
});

function getUserByReservationId() {
    reservationService.getUserByReservationId(reservation.value._id)
        .then(res => {
            reservationUser.value = res.data.reservation.userId;
        })
        .catch(error => {
            console.error('Error al obtener el usuario:', error);
        });
};

function openEditReservationInfo() {
    if (reservation.value.spaceId) {
        spaceStore.setSelectedSpace(reservation.value.spaceId);
    } else {
        materialStore.setSelectedMaterial(reservation.value.materialId);
    }

    router.push('/editReservationInfo');
}

function toggleCheckbox() {
    bulkDeleteReservations.value = !bulkDeleteReservations.value;
};

function closeDialog() {
    deleteModal.value = false;
}

function deleteReservation() {
    const toast = useToast();
    if (reservation.value.periodicReservationId && bulkDeleteReservations.value) {
        reservationService.deletePeriodicReservation(reservation.value.periodicReservationId._id)
            .then(() => {
                closeDialog();
                toast.success('Reserva periódica eliminada con éxito');
                routerBack();
            })
            .catch(error => {
                console.error('Error al borrar reserva:', error);
            });

    } else {
        reservationService.deleteReservation(reservation.value._id)
            .then(() => {
                closeDialog();
                toast.success('Reserva eliminada con éxito');
                routerBack();
            })
            .catch(error => {
                console.error('Error al borrar reserva:', error);
            });
    }
}

const calculatePrice = computed(() => {
    const startStr = reservation.value.startTime
    const endStr = reservation.value.endTime
    let dur = 0;
    let pricePer = 0;
    if (reservationStore.getReservation?.spaceId) {
        dur = space?.value.duration      // duración de un bloque, en minutos
        pricePer = space?.value.pricing       // precio por bloque
    } else {
        dur = material?.value.duration      // duración de un bloque, en minutos
        pricePer = material?.value.pricing       // precio por bloque
    }

    // convierto fecha ISO en minutos
    const startMin = makeMinutesFromIsoLocal(startStr)
    const endMin = makeMinutesFromIsoLocal(endStr)

    // calculo cuántos bloques completos caben
    const blocks = (endMin - startMin) / dur

    // en caso de que no sea un múltiplo exacto, redondeamos hacia abajo
    const fullBlocks = Math.floor(blocks)
    const total = fullBlocks * pricePer * reservationSeats?.value

    // toFixed devuelve una string con dos decimales
    return total.toFixed(2)
});

// Carga dinámica del SDK de PayPal
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

async function startPayPalPayment() {
    const toast = useToast();
    isLoading.value = true;

    try {
        await loadPayPalSdk();

        // Crear orden en backend
        const amount = calculatePrice.value;
        const res = await paypalService.createOrder(reservation.value._id, amount);
        const orderID = res.data.orderID;

        // Sólo renderizamos los botones si aún no existen
        const container = document.getElementById('paypal-button-container');
        if (container && !container.hasChildNodes()) {
            paypal.Buttons({
                createOrder: () => orderID,
                onApprove: async (data) => {
                    await paypalService.captureOrder(data.orderID, reservation.value._id);
                    toast.success('Pago completado con éxito');
                    reservation.value.isPaid = true;
                    reservationStore.setReservation(reservation.value);
                    show.value = false;
                },
                onError: (err) => {
                    console.error(err);
                    toast.error('Error en el pago');
                }
            }).render(container);
        }
        show.value = true;
    } catch (err) {
        console.error(err);
        toast.error('No se pudo cargar PayPal o crear la orden');
    } finally {
        isLoading.value = false;
    }
}

function markAsPaid() {
    const toast = useToast();

    reservationService.markAsPaid(reservation.value._id)
        .then(() => {
            reservation.value.isPaid = true;
            reservationStore.setReservation(reservation.value);
            toast.success('Reserva marcada como pagada');
        })
        .catch(error => {
            console.error('Error al marcar reserva como pagada:', error);
        });
}

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

function closePayPal() {
    show.value = false
}

const routerBack = () => {
    router.go(-1);
};
</script>