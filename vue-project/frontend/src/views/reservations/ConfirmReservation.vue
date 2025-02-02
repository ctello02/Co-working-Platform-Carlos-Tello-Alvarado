<template>
<v-container fluid class="container">
    <v-col>
        <v-row>
            <span class="text-h4">Confirmar reserva</span>
        </v-row>
        <v-row v-if="this.reservation.length === 0" class="mt-8">
            <span class="text-h5">No se encuentran datos</span>
        </v-row>
        <v-row v-else>
            <v-col>
                <v-card class="mx-auto px-2 text-center" width="100%" max-width="600">
                    <v-card-text>
                        <v-col>
                            <v-row>
                                <v-col>
                                    <span class="text-h5">Detalles de la reserva:</span>
                                </v-col>
                            </v-row>
                            <v-divider class="mt-1"/>
                            <v-row class="d-flex align-center justify-center mt-6" cols="12">
                                    <span class="text-h4">{{ this.space.name }}</span>
                                    <v-btn
                                    icon="mdi-information-outline"
                                    variant="text"
                                    density="compact"
                                    :ripple="false"
                                    @click="this.showSpaceInfo = !this.showSpaceInfo"
                                    />
                            </v-row>
                            <v-row>
                                <v-col>
                                    <v-row>
                                        <v-col style="color: grey" class="text-center"><span class="text-h6">Fecha: </span></v-col>
                                    </v-row>
                                    <v-row>
                                        <v-col class="text-center mt-n7"><span class="text-h4 font-weight-medium">{{this.formatDate(new Date(this.reservation.startTime))}}</span></v-col>
                                    </v-row>
                                </v-col>
                            </v-row>
                            <v-divider class="mt-6"/>
                            <v-row class="d-flex align-center my-2">
                                <v-col cols="1">
                                    <v-icon
                                        size="small"
                                        icon="mdi-weather-sunny"
                                    ></v-icon>
                                </v-col>
                                <v-col class="ml-n4 mr-7">
                                    <span class="text-h6">Hora de inicio: {{parseHoursAndMinutes(this.reservation.startTime)}}</span>
                                </v-col>
                                <v-col cols="1">
                                    <v-icon
                                        size="small"
                                        icon="mdi-weather-night"
                                    ></v-icon>
                                </v-col>
                                <v-col class="ml-n7 mr-7">
                                    <span class="text-h6">Hora de fin: {{parseHoursAndMinutes(this.reservation.endTime)}}</span>
                                </v-col>
                            </v-row>
                            <v-divider/>
                            <v-row>
                                <v-col cols="6" class="mt-6">
                                    <v-text-field
                                        v-model.number="reservationSeats"
                                        label="Número de asientos"
                                        prepend-icon="mdi-table-chair"
                                        type="number"
                                        variant="outlined"
                                        density="compact"
                                        required
                                        @input="reservationSeats = Math.max(1, this.space.seats)"
                                    />
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-card-text>
                    <v-card-actions>
                        <v-row class="d-flex justify-center align-center mb-2 ga-3">
                            <TonalButton
                                color="grey"
                                text="Volver"
                                @click="routerBack"
                            />
                        </v-row>
                    </v-card-actions>
                </v-card>
            </v-col>
            <v-col v-if="space && this.showSpaceInfo">
                <v-card class="mx-auto" max-width="600" >
                    <v-img
                        :src="space?.image"
                        color="surface-variant"
                        height="300px"
                        cover
                    />
                    <v-card-text v-if="space && this.openingTime && this.closingTime">
                        <v-col>
                            <v-row class="mt-n5 mb-n3" cols="12">
                                <v-col cols="9">
                                    <span class="text-h4">{{ space?.name }}</span>
                                </v-col>
                            </v-row>
                            <v-row class="my-n3" cols="12">
                                <v-col cols="1" class="d-flex align-center">
                                    <v-icon
                                        icon="mdi-text"
                                    />
                                </v-col>
                                <v-col>
                                    <span class="text-h6">{{ space?.description }}</span>
                                </v-col>
                            </v-row>
                            <v-row class="my-n3" cols="12">
                                <v-col cols="1" class="d-flex align-center">
                                    <v-icon
                                        icon="mdi-table-chair"
                                        size="small"
                                    />
                                </v-col>
                                <v-col>
                                    <span class="text-h6">{{space?.seats}} asientos</span>
                                </v-col>
                            </v-row>
                            <v-row class="mt-n1">
                                <v-col>
                                    <v-row class="d-flex align-center my-n2">
                                        <v-col cols="2">
                                            <v-icon
                                                size="small"
                                                icon="mdi-weather-sunny"
                                            ></v-icon>
                                        </v-col>
                                        <v-col><span class="pt-2 text-h6">Abre a las {{this.openingTime}}</span></v-col>
                                    </v-row>
                                </v-col>
                                <v-col>
                                    <v-row class="d-flex align-center my-n2">
                                        <v-col cols="2">
                                            <v-icon
                                                size="small"
                                                icon="mdi-weather-night"
                                            ></v-icon>
                                        </v-col>
                                        <v-col><span class="pt-2 text-h6">Cierra a las {{this.closingTime}}</span></v-col>
                                    </v-row>
                                </v-col>
                            </v-row>
                            <v-row class="mt-n3 mb-n5 d-flex justify-center align-center" cols="12">
                                <v-col>
                                    <v-row>
                                        <v-col cols="2" class="d-flex align-center">
                                            <v-icon
                                                icon="mdi-timer-outline"
                                                size="small"
                                            />
                                        </v-col>
                                        <v-col>
                                            <span class="pt-2 text-h6" v-if="space.duration < 60">Reservas de {{space.duration}} minutos</span>
                                            <span class="pt-2 text-h6" v-if="space.duration == 60">Reservas de {{space.duration / 60}} hora</span>
                                            <span class="pt-2 text-h6" v-if="space.duration > 60">Reservas de {{space.duration / 60}} horas</span>
                                        </v-col>
                                    </v-row>
                                </v-col>
                                <v-col>
                                    <v-row>
                                        <v-col cols="2" class="d-flex align-center">
                                            <v-icon
                                                icon="mdi-repeat"
                                                size="small"
                                            />
                                        </v-col>
                                        <v-col>
                                            <span class="pt-2 text-h6"> {{space?.repetition ? 'Permite repetición' : 'No permite repetición'}}</span>
                                        </v-col>
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
import { useReservationStore } from '@/store/reservationStore';
import { useSpaceStore } from '@/store/spaceStore';
import TonalButton from '@/components/TonalButton.vue'

export default{
    components: {
        TonalButton
    },
    data() {
        return {
            reservationStore: null,
            spaceStore: null,
            reservation: [],
            space: null,
            showSpaceInfo: false,

            openingTime: null,
            closingTime: null,
            reservationSeats: 1,
        }
    },
    mounted() {
        this.reservationStore = useReservationStore();
        this.spaceStore = useSpaceStore();
        this.space = this.spaceStore.getSelectedSpace;
        this.reservation = this.reservationStore.getReservation;

        if (!this.space && !this.reservation) {
            this.$router.push('/createReservation'); // Redirigir al componente padre
        }

        this.openingTime = this.makeHoursAndMinutes(this.space?.opening);
        this.closingTime = this.makeHoursAndMinutes(this.space?.closing);
        this.reservationSeats = this.reservation?.seatsReserved;        
                
    },
    methods: {
        createReservation() {
            
        },
        makeHoursAndMinutes(minutes) {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;

            // Formatea con ceros a la izquierda
            const formattedHours = String(hours).padStart(2, '0');
            const formattedMinutes = String(mins).padStart(2, '0');

            return `${formattedHours}:${formattedMinutes}`;
        },
        routerBack() {
            this.$router.go(-1);
        },
        parseDate(date) {
            const dateObj = new Date(date);
            const formattedDate = dateObj.toLocaleDateString('es-ES');
            return formattedDate;
        },
        formatDate(date) {
            return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
        },
        parseHoursAndMinutes(date) {            
            const dateObj = new Date(date);
            const hours = String(dateObj.getUTCHours()).padStart(2, '0'); 
            const mins = String(dateObj.getUTCMinutes()).padStart(2, '0');
            return `${hours}:${mins}`;
        }

    }
}
</script>