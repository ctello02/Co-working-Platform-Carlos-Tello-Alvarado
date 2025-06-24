<template>
    <v-container class="pa-5 container">
        <v-card v-if="reservation" class="mx-auto" max-width="600">
            <v-img :src="reservation.spaceId?.image" color="surface-variant" height="300px" cover />
            <v-card-text v-if="reservation">
                <v-col>
                    <v-row class="mt-n5 mb-n3" cols="12">
                        <v-col>
                            <span class="text-h4">{{ reservation.spaceId?.name }}</span>
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
                                <span v-if="reservation.periodicReservationId">
                                    {{ parseRepetition(reservation.periodicReservationId.periodicity) }}
                                </span>
                                <span v-else>
                                    No se repite
                                </span>
                            </span>
                        </v-col>
                    </v-row>
                </v-col>
            </v-card-text>

            <v-card-actions class="d-flex justify-end ga-3 mt-n3 mb-3 mr-5">
                <TonalButton color="grey" text="Volver" @click="routerBack" />
            </v-card-actions>
        </v-card>

        <AskModal v-model="deleteModal" :title="'¿Borrar reserva?'"
            :message="'¿Estás seguro de que quieres borrar esta reserva?'" :actionText="'Borrar reserva'"
            :closeModal="closeDialog" :action="deleteReservation"
            :checkboxAction="reservationStore.getReservation?.periodicReservationId ? toggleCheckbox : null" />

    </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useReservationStore } from '@/store/reservationStore';
import { useSpaceStore } from '@/store/spaceStore';
import { useRouter } from 'vue-router';
import TonalButton from '@/components/TonalButton.vue'
import AskModal from '@/components/AskModal.vue';
import { reservationService } from '@/services/reservationService';
import { useTime } from '@/composables/useTime';
import { useToast } from 'vue-toastification';

// Instanciar stores
const reservationStore = useReservationStore();
const spaceStore = useSpaceStore();
const router = useRouter();

// Variables reactivas
const reservation = ref(null);
const canEdit = ref(false);
const deleteModal = ref(false);
const bulkDeleteReservations = ref(false);


// Extraemos funciones del composable useTime
const {
    getHoursAndMinsFromDate,
    parseToStringDate,
    calcPastEvents,
    isWithinNext24Hours,
    isToday,
    parseDateTo_YYYYMMDD_HHMM
} = useTime();

// Al montar el componente, se asigna la reserva y se redirige si no existe
onMounted(() => {
    reservation.value = reservationStore.getReservation;

    if (!reservation.value) {
        router.push('/reservations');
    } else {

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

function openEditReservationInfo() {
    spaceStore.setSelectedSpace(reservation.value.spaceId);
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
            .then(res => {
                closeDialog();
                toast.success('Reserva periódica eliminada con éxito');
                routerBack();
            })
            .catch(error => {
                console.error('Error al borrar reserva:', error);
            });

    } else {
        reservationService.deleteReservation(reservation.value._id)
            .then(res => {
                closeDialog();
                toast.success('Reserva eliminada con éxito');
                routerBack();
            })
            .catch(error => {
                console.error('Error al borrar reserva:', error);
            });
    }
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

const routerBack = () => {
    router.push('/reservations');
};
</script>