<template>
    <v-container fluid v-if="user">
        <v-row class="mt-1 d-flex ga-3">
            <v-col>
                <v-row>
                    <span class="text-h4">Bienvenido {{ user.name }},</span>
                </v-row>
                <v-row v-if="reservations.length == 0" class="mt-6 ml-n5">
                    <v-col cols="auto" class="d-flex flex-column ga-4">
                        <span class="text-h5">Aún no tiene reservas</span>
                        <TonalButton color="blue" text="Reservar" size="x-large"
                            @click="this.$router.push('/createReservation')" />
                    </v-col>
                </v-row>
                <!-- Poner la proxima reserva en grande -->
                <v-row v-if="todayReservation" class="mt-6">
                    <v-col>
                        <v-row>
                            <span class="text-h5">
                                Tiene una reserva:
                            </span>
                        </v-row>
                        <v-row>
                            <v-col class="ma-0 mt-2 pa-0">
                                <v-card>
                                    <v-img :src="todayReservation.spaceId?.image || todayReservation.materialId?.image"
                                        color="surface-variant" height="300px" cover />
                                    <v-card-text>
                                        <v-col>
                                            <v-row class="mt-n5 mb-n3" cols="12">
                                                <v-col>
                                                    <span class="text-h4">{{ todayReservation.spaceId?.name ||
                                                        todayReservation.materialId?.name }}</span>
                                                </v-col>
                                                <v-col cols="auto" v-if="isExpired(todayReservation.endTime)">
                                                    <span style="color: red;" class="text-h5">
                                                        Expirada
                                                    </span>
                                                </v-col>
                                            </v-row>
                                            <v-row class="my-n3" cols="12">
                                                <v-col cols="1" class="d-flex align-center">
                                                    <v-icon icon="mdi-text" />
                                                </v-col>
                                                <v-col>
                                                    <span class="text-h6">{{ todayReservation.spaceId?.description ||
                                                        todayReservation.materialId?.description }}</span>
                                                </v-col>
                                            </v-row>
                                            <v-row class="my-n3">
                                                <v-col cols="1" class="d-flex align-center">
                                                    <v-icon icon="mdi-calendar-outline" size="small" />
                                                </v-col>
                                                <v-col><span class="text-h6"> {{ parseToStringDate(new
                                                    Date(todayReservation.startTime)) }}</span></v-col>
                                            </v-row>
                                            <v-row class="my-n3 d-flex justify-center align-center" cols="12">
                                                <v-col>
                                                    <v-row>
                                                        <v-col :cols="todayReservation.spaceId ? '2' : '1'"
                                                            class="d-flex align-center">
                                                            <v-icon icon="mdi-clock-outline" size="small" />
                                                        </v-col>
                                                        <v-col>
                                                            <span class="pt-2 text-h6">
                                                                {{ getHoursAndMinsFromDate(todayReservation.startTime)
                                                                }}h
                                                                -
                                                                {{ getHoursAndMinsFromDate(todayReservation.endTime) }}h
                                                            </span>
                                                        </v-col>
                                                    </v-row>
                                                </v-col>
                                                <v-col v-if="todayReservation.seatsReserved">
                                                    <v-row>
                                                        <v-col cols="2" class="d-flex align-center">
                                                            <v-icon icon="mdi-table-chair" size="small" />
                                                        </v-col>
                                                        <v-col>
                                                            <span class="text-h6"
                                                                v-if="todayReservation.seatsReserved == 1">{{
                                                                    todayReservation.seatsReserved }} asiento
                                                                reservado</span>
                                                            <span class="text-h6" v-else>{{
                                                                todayReservation.seatsReserved
                                                            }}
                                                                asientos
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
                                                                <span v-if="todayReservation.periodicReservationId">
                                                                    {{
                                                                        parseRepetition(todayReservation.periodicReservationId.periodicity)
                                                                    }}
                                                                </span>
                                                                <span v-else>
                                                                    Sin repetición
                                                                </span>
                                                            </span>
                                                        </v-col>
                                                    </v-row>
                                                </v-col>
                                                <v-col v-if="todayReservation">
                                                    <v-row>
                                                        <v-col cols="2" class="d-flex align-center">
                                                            <v-icon icon="mdi-hand-coin-outline" size="small" />
                                                        </v-col>
                                                        <v-col>
                                                            <span class="text-h6">
                                                                {{ calculatePrice(todayReservation,
                                                                    todayReservation.startTime,
                                                                    todayReservation.endTime) }}€
                                                                <span v-if="todayReservation.isPaid">
                                                                    (Pagada)
                                                                </span>
                                                                <span v-else>
                                                                    (Sin pagar)
                                                                </span>
                                                            </span>
                                                        </v-col>
                                                    </v-row>
                                                </v-col>
                                            </v-row>
                                        </v-col>
                                    </v-card-text>
                                    <v-card-actions v-if="!todayReservation.isPaid"
                                        class="d-flex justify-end ga-3 mt-n3 mb-5 mr-5">
                                        <TonalButton :color="show ? 'grey' : 'blue'" :loading="isLoading"
                                            v-if="!todayReservation.isPaid" :text="show ? 'Cancelar pago' : 'Pagar'"
                                            @click="show ? closePayPal() : startPayPalPayment()" />
                                    </v-card-actions>
                                    <v-expand-transition>
                                        <div v-show="show" class="mt-n2 ma-7">
                                            <div style="width: 100%;" id="paypal-button-container" />
                                        </div>
                                    </v-expand-transition>
                                </v-card>
                            </v-col>
                        </v-row>
                    </v-col>
                </v-row>

                <v-row v-else-if="!todayReservation && reservations.length > 1" class="mt-6 ml-n5">
                    <v-col cols="auto" class="d-flex flex-column ga-4">
                        <span class="text-h5">No tiene reservas para hoy</span>
                        <TonalButton color="blue" text="Reservar" size="x-large"
                            @click="this.$router.push('/createReservation')" />
                    </v-col>
                </v-row>


            </v-col>
            <v-col v-if="reservations.length > 0" class="mt-2">
                <v-row>
                    <span class="text-h5 ml-3">
                        Tiene {{ reservations.length }}
                        <span v-if="reservations.length == 1">reserva</span>
                        <span v-else>reservas</span>
                        esta semana:
                    </span>
                </v-row>
                <v-row>
                    <v-col class="d-flex flex-column ga-2">
                        <v-card @click="openReservation(reservation)" style="width: 100%;"
                            class="mx-auto pa-2 main-container mainBorder"
                            :class="isExpired(reservation.endTime) ? 'expired' : ''" :ripple="false" elevation="0"
                            v-for="reservation in otherReservations.slice(0, 5)" :key="reservation._id">
                            <v-row>
                                <v-col>
                                    <v-row>
                                        <v-col>
                                            <span class="text-h6">
                                                {{ reservation.spaceId?.name ||
                                                    reservation.materialId?.name }}
                                            </span>
                                        </v-col>
                                        <v-col cols="auto">
                                            <span class="text-h6">
                                                <span class="grey" v-if="isToday(reservation.startTime)">(Hoy)
                                                </span>
                                                <span class="grey"
                                                    v-else-if="isWithinNext24Hours(reservation.startTime)">(Mañana)
                                                </span>
                                                {{ parseToStringDate(new Date(reservation.startTime)) }}
                                            </span>
                                        </v-col>
                                    </v-row>
                                    <div v-if="isExpired(reservation.endTime)" class="expired-overlay">
                                        <span class="expired-text text-h4">Expirada</span>
                                    </div>
                                    <v-row class="mt-n3">
                                        <v-col>
                                            <v-row class="d-flex align-center justify-space-between">
                                                <v-col cols="auto">
                                                    <span class="grey">
                                                        Precio:
                                                    </span>
                                                    <span>
                                                        {{ calculatePrice(reservation, reservation.startTime,
                                                            reservation.endTime) }}€
                                                    </span>
                                                    <span v-if="reservation.isPaid">
                                                        (Pagada)
                                                    </span>
                                                    <span v-else>
                                                        (Sin pagar)
                                                    </span>
                                                </v-col>
                                                <v-col cols="auto">
                                                    <span class="grey">Horas: </span>
                                                    <span>
                                                        {{
                                                            getHoursAndMinsFromDate(reservation?.startTime)
                                                        }}h
                                                        -
                                                        {{
                                                            getHoursAndMinsFromDate(reservation?.endTime)
                                                        }}h
                                                    </span>
                                                </v-col>
                                            </v-row>
                                        </v-col>
                                    </v-row>
                                </v-col>
                            </v-row>
                        </v-card>
                    </v-col>
                </v-row>
                <v-row v-if="reservations.length > 5" class="mt-1">
                    <v-col class="d-flex justify-center">
                        <TonalButton text="Ver más…" @click="$router.push('/reservations')" />
                    </v-col>
                </v-row>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { authService } from '@/services/authService';
import { reservationService } from '@/services/reservationService';
import { paypalService } from '@/services/paypalService';
import { useReservationStore } from '@/store/reservationStore';
import { useSpaceStore } from '@/store/spaceStore';
import { useMaterialStore } from '@/store/materialStore';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import TonalButton from '@/components/TonalButton.vue'

import { useTime } from '@/composables/useTime';

const router = useRouter();
const reservationStore = useReservationStore();
const spaceStore = useSpaceStore();
const materialStore = useMaterialStore();

const {
    parseRepetition,
    parseToStringDate,
    getHoursAndMinsFromDate,
    makeMinutesFromIsoLocal,
    isToday,
    isWithinNext24Hours,
    isWithinNext7Days
} = useTime();

const user = ref(null);
const reservations = ref([]);

const paypalLoaded = ref(false);
const isLoading = ref(false);
const show = ref(false);
const now = ref(new Date());

onMounted(async () => {
    Promise.allSettled([
        await getUser(),
        await getUserReservations()
    ]);

    // Actualiza el now cada minuto para forzar recálculo de todayReservation
    setInterval(() => {
        now.value = new Date();
    }, 60_000);
})

const todayReservation = computed(() => {
    // forzamos recálculo cada vez que cambie now.value
    now.value

    // sólo reservas de hoy, ordenadas
    const todayList = reservations.value
        .filter(r => isToday(r.startTime))
        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    // buscamos la primera que termine en el futuro
    return todayList.find(r => !isExpired(r.endTime)) || null;
});

const otherReservations = computed(() => {
    // si no hay todayReservation, devolvemos todo
    if (!todayReservation.value) return reservations.value;
    // filtramos por _id (o el campo único que uses)
    return reservations.value.filter(r => r._id !== todayReservation.value._id);
});

function calculatePrice(reservation, start, end) {
    const startMin = makeMinutesFromIsoLocal(start)
    const endMin = makeMinutesFromIsoLocal(end)
    let dur = 0;
    let pricePer = 0;

    if (reservation.spaceId) {
        dur = reservation.spaceId.duration      // duración de un bloque, en minutos
        pricePer = reservation.spaceId.pricing       // precio por bloque
    } else {
        dur = reservation.materialId.duration      // duración de un bloque, en minutos
        pricePer = reservation.materialId.pricing       // precio por bloque
    }

    const seats = reservation?.seatsReserved || 1

    // calculo cuántos bloques completos caben
    const blocks = (endMin - startMin) / dur

    // en caso de que no sea un múltiplo exacto, redondeamos hacia abajo
    const fullBlocks = Math.floor(blocks)
    const total = fullBlocks * pricePer * seats

    return total.toFixed(2)
}

async function getUser() {
    await authService.getUser()
        .then(res => {
            user.value = res.data.user;
        })
        .catch(error => {
            console.log(error);
        });
}

async function getUserReservations() {
    try {
        const res = await reservationService.getUserReservations(user.value._id);
        // ordenar y filtrar para la semana
        reservations.value = res.data.reservations
            .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
            .filter(r => isWithinNext7Days(r.startTime));
    } catch (err) {
        console.error(err);
    }
}

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

        const price = calculatePrice(todayReservation.value,
            todayReservation.value.startTime,
            todayReservation.value.endTime);

        // Sólo renderizamos los botones si aún no existen
        const container = document.getElementById('paypal-button-container');
        if (container) {
            container.innerHTML = ''
        }
        paypal.Buttons({
            createOrder: () => {
                return paypalService
                    .createOrder(todayReservation.value._id, price)
                    .then(r => r.data.orderID);
            },
            onApprove: async (data) => {
                const res = await paypalService.captureOrder(data.orderID, todayReservation.value._id);
                if (res.data.paymentStatus === 'COMPLETED') {
                    toast.success('Pago completado con éxito');
                    show.value = false;
                    getUserReservations();
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

function openReservation(reservation) {
    reservationStore.setReservation(reservation);

    if (reservation.spaceId) spaceStore.setSelectedSpace(reservation.spaceId);
    else materialStore.setSelectedMaterial(reservation.materialId);

    router.push('/reservationInfo');
}

function closePayPal() {
    show.value = false
}

function parseLocalDate(isoString) {
    // elimina Z o +02:00, -05:00, etc.
    const localIso = isoString.replace(/Z|[+\-]\d\d:\d\d$/, '')
    return new Date(localIso)
}

function isExpired(endTime) {
    const end = parseLocalDate(endTime)
    return now.value > end
}


</script>
<style scoped>
.grey {
    color: grey;
}

.main-container {
    color: black;
    border-radius: 4px;
}

.mainBorder {
    border: 0.5px solid #333ca0;
    border-left: 5px solid #333ca0;
}

.expired {
    background-color: #dfdfdf;
    border-left: 5px solid grey;
}

.expired-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.75);
    /* ajusta la opacidad */

    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;
}

/* texto grande y centrado */
.expired-text {
    font-size: 2rem;
    /* aprox. h3 */
    font-weight: bold;
    color: #444;
    text-transform: uppercase;
}

#square {
    background-color: white;
    border: 0.5px solid #333ca0;
    border-radius: 25px;

    width: 100%;
    height: 200px;
}
</style>