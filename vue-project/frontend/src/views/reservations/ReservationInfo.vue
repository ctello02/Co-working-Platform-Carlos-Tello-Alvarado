<template>
    <v-container class="pa-5 container">
        <v-card v-if="reservation && reservationUser" class="mx-auto" max-width="600">
            <v-img :src="reservation.spaceId?.image || reservation.materialId?.image" color="surface-variant"
                :height="smAndDown ? '200px' : '300px'" cover />

            <v-card-text v-if="reservation">
                <v-col>
                    <v-row class="mt-n5 mb-n3" cols="12">
                        <v-col>
                            <span :class="smAndDown ? 'text-h5' : 'text-h4'">
                                {{ reservation.spaceId?.name || reservation.materialId?.name }}
                            </span>
                        </v-col>
                        <v-col class="d-flex align-center justify-end ga-3">
                            <v-btn v-if="canEdit" @click="openEditReservationInfo()" variant="tonal" size="small"
                                icon="mdi-pencil" />
                            <v-btn v-if="canEdit" @click="deleteModal = true" variant="tonal" size="small"
                                icon="mdi-trash-can-outline" />
                        </v-col>
                    </v-row>

                    <v-row :class="smAndDown ? 'my-n3' : 'my-n2'" cols="12">
                        <v-col cols="1" class="d-flex align-center">
                            <v-icon icon="mdi-text" />
                        </v-col>
                        <v-col>
                            <span :class="smAndDown ? '' : 'text-h6'">
                                {{ reservation.spaceId?.description || reservation.materialId?.description }}
                            </span>
                        </v-col>
                    </v-row>

                    <v-row v-if="userStore.isAdmin" :class="smAndDown ? '' : 'my-n3'" cols="12">
                        <v-col cols="1" class="d-flex align-center">
                            <v-icon icon="mdi-account-outline" />
                        </v-col>
                        <v-col>
                            <span :class="smAndDown ? '' : 'text-h6'">
                                {{ reservationUser?.name }}, {{ reservationUser?.email }}
                            </span>
                        </v-col>
                    </v-row>

                    <v-row :class="!smAndDown ? 'my-n3' : ''">
                        <v-col cols="1" class="d-flex align-center">
                            <v-icon icon="mdi-calendar-outline" size="small" />
                        </v-col>
                        <v-col>
                            <span class="text-h6" v-if="!smAndDown">
                                {{ parseToStringDate(new Date(reservation.startTime)) }}
                            </span>
                            <span v-else>
                                {{ twoDigitsDate(reservation.startTime) }}
                            </span>
                        </v-col>
                    </v-row>

                    <v-row class="d-flex justify-center align-center" :class="!smAndDown ? 'my-n3' : ''" cols="12">
                        <v-col :cols="smAndDown ? 12 : ''">
                            <v-row>
                                <v-col :cols="reservation.spaceId ? (smAndDown ? 1 : 2) : 1"
                                    class="d-flex align-center">
                                    <v-icon icon="mdi-clock-outline" size="small" />
                                </v-col>
                                <v-col>
                                    <span :class="smAndDown ? '' : 'text-h6'">
                                        {{ getHoursAndMinsFromDate(reservation.startTime) }}h -
                                        {{ getHoursAndMinsFromDate(reservation.endTime) }}h
                                    </span>
                                </v-col>
                            </v-row>
                        </v-col>

                        <v-col v-if="reservation.seatsReserved" :cols="smAndDown ? 12 : ''">
                            <v-row>
                                <v-col :cols="smAndDown ? 1 : 2" class="d-flex align-center">
                                    <v-icon icon="mdi-table-chair" size="small" />
                                </v-col>
                                <v-col>
                                    <span :class="smAndDown ? '' : 'text-h6'">
                                        <template v-if="reservation.seatsReserved == 1">
                                            {{ reservation.seatsReserved }} asiento reservado
                                        </template>
                                        <template v-else>
                                            {{ reservation.seatsReserved }} asientos reservados
                                        </template>
                                    </span>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>

                    <v-row class="d-flex justify-center align-center" :class="!smAndDown ? 'my-n3' : ''" cols="12">
                        <v-col :cols="smAndDown ? 12 : ''">
                            <v-row>
                                <v-col :cols="smAndDown ? 1 : 2" class="d-flex align-center">
                                    <v-icon icon="mdi-repeat" size="small" />
                                </v-col>
                                <v-col>
                                    <span :class="smAndDown ? '' : 'text-h6'">
                                        <span v-if="reservation.periodicReservationId">
                                            {{ parseRepetition(reservation.periodicReservationId.periodicity) }}
                                        </span>
                                        <span v-else>Sin repetición</span>
                                    </span>
                                </v-col>
                            </v-row>
                        </v-col>

                        <v-col v-if="reservation" :cols="smAndDown ? 12 : ''">
                            <v-row>
                                <v-col :cols="smAndDown ? 1 : 2" class="d-flex align-center">
                                    <v-icon icon="mdi-hand-coin-outline" size="small" />
                                </v-col>
                                <v-col>
                                    <span :class="smAndDown ? '' : 'text-h6'">
                                        <span v-if="calculatePrice > 0">
                                            {{ calculatePrice }}€
                                            <span v-if="reservation.isPaid">
                                                (Pagada)
                                            </span>
                                            <span v-else>
                                                (Sin pagar)
                                            </span>
                                        </span>
                                        <span v-else>
                                            Gratis
                                        </span>
                                    </span>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>
                </v-col>
            </v-card-text>

            <v-card-actions class="d-flex ga-3"
                :class="xs ? 'mt-2 mb-4 mr-3 justify-center flex-column' : 'mt-n3 mb-5 mr-5 justify-end'">
                <TonalButton color="grey" text="Volver" @click="routerBack" />

                <TonalButton v-if="!reservation.isPaid && reservationUser._id !== userStore.getId" color="blue"
                    text="Marcar como pagada" @click="markPaidModal = true" />

                <TonalButton :color="show ? 'grey' : 'blue'" :loading="isLoading"
                    v-if="!reservation.isPaid && reservationUser._id === userStore.getId"
                    :text="show ? 'Cancelar pago' : 'Pagar'" @click="show ? closePayPal() : startPayPalPayment()" />
            </v-card-actions>

            <v-expand-transition>
                <div v-show="show" class="mt-n2 ma-7" :class="xs ? 'ma-0' : ''">
                    <div style="width: 100%;" id="paypal-button-container" />
                </div>
            </v-expand-transition>
        </v-card>

        <AskModal v-model="deleteModal" :title="'¿Borrar reserva?'"
            :message="reservation?.isPaid ? '¿Estás seguro de que quieres borrar esta reserva? Se te devolverá el importe de esta reserva y de otras que hayas pagado.' : '¿Estás seguro de que quieres borrar esta reserva?'"
            :actionText="'Borrar reserva'" :closeModal="closeDialog" :action="deleteReservation"
            :checkboxAction="reservationStore.getReservation?.periodicReservationId ? toggleCheckbox : null"
            :warnPaymentRefund="!reservationStore.getReservation?.isPaid && reservationStore.getReservation?.periodicReservationId" />

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

import { useDisplay } from 'vuetify'

const { smAndDown, xs } = useDisplay()

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

const paypalLoaded = ref(false);
const isLoading = ref(false);

const show = ref(false);

const {
    parseRepetition,
    getHoursAndMinsFromDate,
    parseToStringDate,
    twoDigitsDate,
    calcPastEvents,
    isWithinNext24Hours,
    isToday,
    parseDateTo_YYYYMMDD_HHMM,
    makeMinutesFromIsoLocal
} = useTime();

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
            .then((res) => {
                closeDialog();
                toast.success(res.data.message);
                routerBack();
            })
            .catch(error => {
                console.error('Error al borrar reserva:', error);
            });

    } else {
        reservationService.deleteReservation(reservation.value._id)
            .then((res) => {
                closeDialog();
                toast.success(res.data.message);

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
        dur = space?.value.duration
        pricePer = space?.value.pricing
    } else {
        dur = material?.value.duration
        pricePer = material?.value.pricing
    }

    const startMin = makeMinutesFromIsoLocal(startStr)
    const endMin = makeMinutesFromIsoLocal(endStr)

    const blocks = (endMin - startMin) / dur

    const fullBlocks = Math.floor(blocks)
    const total = fullBlocks * pricePer * reservationSeats?.value

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

        const price = calculatePrice.value;

        // Sólo renderizamos los botones si aún no existen
        const container = document.getElementById('paypal-button-container');
        if (container) {
            container.innerHTML = ''
        }
        paypal.Buttons({
            createOrder: () => {
                return paypalService
                    .createOrder(reservation.value._id, price)
                    .then(r => r.data.orderID);
            },
            onApprove: async (data) => {
                const res = await paypalService.captureOrder(data.orderID, reservation.value._id);
                if (res.data.paymentStatus === 'COMPLETED') {
                    toast.success('Pago completado con éxito');
                    reservation.value.isPaid = true;
                    reservationStore.setReservation(reservation.value);
                    show.value = false;
                }
            },
            onError: (err) => {
                console.error(err);
                toast.error('Error en el pago');
            }
        }).render(container);
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

function closePayPal() {
    show.value = false
}

const routerBack = () => {
    router.go(-1);
};
</script>