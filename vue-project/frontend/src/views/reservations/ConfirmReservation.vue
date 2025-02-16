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
                                        <v-col class="text-center mt-n7"><span class="text-h4">{{this.formatDate(new Date(this.reservation.startTime))}}</span></v-col>
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
                            <v-row class="mt-5 mb-n8">
                                <v-col cols="5">
                                    <v-text-field
                                        v-model.number="reservationSeats"
                                        label="Número de asientos"
                                        prepend-icon="mdi-table-chair"
                                        type="number"
                                        variant="outlined"
                                        density="compact"
                                        required
                                        @input="reservationSeats = Math.max(1, reservationSeats)"
                                        :rules="[rules.max]"
                                    />
                                </v-col>
                                <v-col v-if="this.space.repetition">
                                    <v-select
                                        v-model="repetition"
                                        :items="repetitionOptions"
                                        item-title="label"
                                        item-value="value"
                                        label="Repetición"
                                        prepend-icon="mdi-repeat"
                                        variant="outlined"
                                        density="compact"
                                    />
                                </v-col>
                                <v-col v-else>
                                    <v-row>
                                        <v-col cols="1" class="d-flex align-center">
                                            <v-icon
                                                size="small"
                                                icon="mdi-repeat-off"
                                            ></v-icon>
                                        </v-col>
                                        <v-col>
                                            <span class="text-h6">Repetición no disponible</span>
                                        </v-col>
                                    </v-row>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-card-text>
                    <v-card-actions>
                        <v-row class="mt-n3 mb-3 mr-2 d-flex justify-end ga-3">
                            <TonalButton
                                color="grey"
                                text="Volver"
                                @click="routerBack"
                            />
                            <TonalButton
                                color="blue"
                                text="Reservar"
                                @click="confirmReservation"
                            />
                        </v-row>
                    </v-card-actions>
                </v-card>
            </v-col>
            <v-col v-if="space && this.showSpaceInfo">
                <SpaceCard
                    :space="this.space"
                    :adminActions="false"
                    :cardActions="false"
                />
            </v-col>
        </v-row>
    </v-col>
</v-container>

</template>

<script>
import { useReservationStore } from '@/store/reservationStore';
import { useSpaceStore } from '@/store/spaceStore';
import { reservationService } from '@/services/reservationService';
import TonalButton from '@/components/TonalButton.vue'
import { useToast } from 'vue-toastification';
import SpaceCard from '@/components/SpaceCard.vue';

export default{
    components: {
        TonalButton,
        SpaceCard
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
            repetition: 'no_repeat', 
            repetitionOptions: [
                { label: 'No repetir', value: 'no_repeat' },
                { label: 'Cada día', value: 'daily' },
                { label: 'Todos los días laborales (de lunes a viernes)', value: 'workdays' },
                { label: 'Cada semana este día', value: 'weekly' },
            ],

            rules: {
                max: value => value <= this.space.seats || 'Se ha superado el número máximo de asientos',
            }
        }
    },
    watch: {
        reservationSeats(newValue) {
            if(newValue > this.space.seats) {
                this.reservationSeats = this.reservationSeats-1;
            }
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
        async confirmReservation() {
            const formData = new FormData();
            const toast = useToast();

            formData.append('spaceId', this.reservation.spaceId);
            formData.append('userId', this.reservation.userId);
            formData.append('startTime', this.reservation.startTime);
            formData.append('endTime', this.reservation.endTime);
            formData.append('seatsReserved', this.reservationSeats);
            formData.append('repetition', this.repetition);

            try {
                const res = await reservationService.createReservation(formData);
                console.log(res.data);
                toast.success('Reserva creada con éxito');
                this.$router.push('/reservations');
            } catch (error) {
                console.error(error);
            }
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