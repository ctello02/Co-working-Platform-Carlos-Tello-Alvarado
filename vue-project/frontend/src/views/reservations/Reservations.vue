<template>
    <v-container fluid class="container">
        <v-col>
            <v-row>
                <span class="text-h4">Reservas del usuario</span>
                <v-spacer></v-spacer>
                <div class="d-flex align-center">
                    <TonalButton
                        color="blue"
                        text="Crear reserva"
                        class="mr-3"
                        @click="openCreateReservation"
                    />
                    <v-btn
                        variant="text"
                        :ripple="false"
                        :icon="list ? 'mdi-view-grid-outline' : 'mdi-format-list-bulleted'"
                        @click="list = !list"
                    />
                </div>
            </v-row>
            <v-row v-if="this.reservations.length === 0" class="mt-8">
                <span class="text-h5">No se encuentran datos</span>
            </v-row>
            <v-row v-else>
                <v-col
                    v-for="reservation in reservations"
                    :key="reservation._id"
                >
                        <v-card @click="infoEvent(reservation)" class="text-center" max-width="400">
                            <v-card-title>
                                <span class="text-h5">Reserva de {{reservation.spaceId}}</span>
                                <v-divider class="mt-1"/>
                            </v-card-title>
                            <v-card-text>
                                <v-col>
                                    <v-row>
                                        <v-col>
                                            <v-row>
                                                <v-col style="color: grey"><span class="text-h6">Fecha: </span></v-col>
                                            </v-row>
                                            <v-row>
                                                <v-col class="mt-n7"><span class="text-h6"> {{this.formatDate(new Date(reservation.startTime))}}</span></v-col>
                                            </v-row>
                                        </v-col>
                                        <v-col>
                                            <v-row>
                                                <v-col style="color: grey"><span class="text-h6">Horas: </span></v-col>
                                            </v-row>
                                            <v-row>
                                                <v-col class="mt-n7"><span class="text-h6">{{parseHoursAndMinutes(reservation.startTime)}}h - {{parseHoursAndMinutes(reservation.endTime)}}h</span></v-col>
                                            </v-row>
                                        </v-col>
                                    </v-row>
                                </v-col>
                            </v-card-text>
                        </v-card>
                </v-col>
            </v-row>
        </v-col>
    </v-container>
</template>

<script>
import TonalButton from '@/components/TonalButton.vue';
import { reservationService } from '@/services/reservationService';

export default {
    components: {
        TonalButton
    },
    data() {
        return {
            reservations: [],

            list: false,
        }
    },
    mounted() {
        this.getReservations();
    },
    methods: {
        getReservations() {             //Cambiar metodo por getUserReservations
            try{
                reservationService.getReservations()
                .then(res => {
                    this.reservations = res.data.reservations;
                })
                .catch(error => {
                    console.error(error);
                });
            } catch (error) {
                console.error(error);
            }
        },
        infoEvent(reservation) {
            console.log(reservation);
        },
        formatDate(date) {
            return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
        },
        parseHoursAndMinutes(date) {            
            const dateObj = new Date(date);
            const hours = String(dateObj.getUTCHours()).padStart(2, '0'); 
            const mins = String(dateObj.getUTCMinutes()).padStart(2, '0');
            return `${hours}:${mins}`;
        },
        openCreateReservation() {
            this.$router.push('/createReservation');
        },
    }
}
</script>