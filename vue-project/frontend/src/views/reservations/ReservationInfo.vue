<template>
    <v-container class="pa-5 container">
        <v-card v-if="reservation" class="mx-auto" max-width="600" >
            <v-img
                :src="reservation.spaceId?.image"
                color="surface-variant"
                height="300px"
                cover  
            />                            
            <v-card-text v-if="reservation">
                <v-col>
                    <v-row class="mt-n5 mb-n3" cols="12">
                        <v-col cols="9">
                            <span class="text-h4">{{ reservation.spaceId?.name }}</span>
                        </v-col>
                    </v-row>

                    <v-row class="my-n3" cols="12">
                        <v-col cols="1" class="d-flex align-center">
                            <v-icon
                                icon="mdi-text"
                            />
                        </v-col>
                        <v-col>
                            <span class="text-h6">{{ reservation.spaceId?.description }}</span>
                        </v-col>
                    </v-row>

                    <v-row class="my-n3">
                        <v-col cols="1" class="d-flex align-center">
                            <v-icon
                                icon="mdi-calendar-outline"
                                size="small"
                            />
                        </v-col>
                        <v-col><span class="text-h6"> {{this.formatDate(new Date(reservation.startTime))}}</span></v-col>
                    </v-row>

                    <v-row class="my-n3 d-flex justify-center align-center" cols="12">
                        <v-col>
                            <v-row>
                                <v-col cols="2" class="d-flex align-center">
                                    <v-icon
                                        icon="mdi-clock-outline"
                                        size="small"
                                    />
                                </v-col>
                                <v-col><span class="pt-2 text-h6">{{parseHoursAndMinutes(reservation.startTime)}}h - {{parseHoursAndMinutes(reservation.endTime)}}h</span></v-col>
                            </v-row>
                        </v-col>
                        <v-col>
                            <v-row>
                                <v-col cols="2" class="d-flex align-center">
                                    <v-icon
                                        icon="mdi-table-chair"
                                        size="small"
                                    />
                                </v-col>
                                <v-col>
                                    <span class="text-h6" v-if="reservation.seatsReserved == 1">{{reservation.seatsReserved}} asiento reservado</span>
                                    <span class="text-h6" v-else>{{reservation.seatsReserved}} asientos reservados</span>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-row>

                    <v-row class="my-n3" cols="12">
                        <v-col cols="1" class="d-flex align-center">
                            <v-icon
                                icon="mdi-repeat"
                                size="small"
                            />
                        </v-col>
                        <v-col>
                            <span class="pt-2 text-h6"> {{this.parseRepetition(reservation.repetition)}}</span>
                        </v-col>
                    </v-row>
                </v-col>
            </v-card-text>

            <v-card-actions class="d-flex justify-end ga-3 mt-n3 mb-3 mr-5">
                <TonalButton
                    color="grey"
                    text="Volver"
                    @click="routerBack" 
                />
            </v-card-actions>
        </v-card>

    </v-container>
</template>

<script>
import { useUserStore } from '@/store/userStore';
import { useReservationStore } from '@/store/reservationStore';
import TonalButton from '@/components/TonalButton.vue'

export default {
    data() {
        return {
            userStore: null,
            reservationStore: null,

            reservation: null,
            space: null,
            deleteModal: false,

            openingTime: null,
            closingTime: null,
        };
    },
    components: {
        TonalButton,
    },
    mounted() {
        this.userStore = useUserStore();
        this.reservationStore = useReservationStore();

        this.reservation = this.reservationStore.getReservation;

        if (!this.reservation) {
            this.$router.push('/reservations'); // Redirigir al componente padre
        }

    },
    methods: {
        routerBack() {
            this.$router.push('/reservations');
        },
        parseHoursAndMinutes(date) {            
            const dateObj = new Date(date);
            const hours = String(dateObj.getUTCHours()).padStart(2, '0'); 
            const mins = String(dateObj.getUTCMinutes()).padStart(2, '0');
            return `${hours}:${mins}`;
        },
        parseRepetition(repetition) {
            if (repetition === 'no_repeat') {
                return 'Sin repetición';
            } else if (repetition === 'daily') {
                return 'Se repite todos los días';
            } else if (repetition === 'workdays') {
                return 'Se repite los días laborales';
            } else if (repetition === 'weekly') {
                return 'Se repite todas las semans este día';
            }
        },
        formatDate(date) {
            return new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date);
        },
        deleteSpace() {
            spaceService.deleteSpace(this.space._id)
            .then(res => {
                console.log(res.data);
                this.deleteModal = false;
                this.spaceStore.clearSelectedSpace();
                this.routerBack();
            })
            .catch(error => {
                console.log(error);
            });
        }
    },
};
</script>