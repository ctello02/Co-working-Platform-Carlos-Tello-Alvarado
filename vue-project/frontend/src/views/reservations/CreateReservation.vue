<template>
    <v-container fluid>
        <v-col>
            <v-row>
                <span class="text-h4">Nueva reserva</span>
            </v-row>
            <v-row>
                <v-card class="pa-2 mt-4 mb-n3" width="100%">
                    <v-card-text class="d-flex justify-space-between mb-n5 flex-wrap">
                        <v-col cols="3" lg="3" md="4" sm="12">
                            <v-row>
                                <span class="text-h6">Seleccione una fecha</span>
                            </v-row>
                            <v-row>
                                <v-col>
                                    <v-menu
                                        :close-on-content-click="false"
                                        location="bottom"
                                        transition="slide-y-transition"
                                    >
                                        <template v-slot:activator="{ props }">
                                        <v-text-field
                                            density="compact"
                                            prepend-icon="mdi-calendar-month-outline"
                                            v-bind="props"
                                            variant="outlined"
                                            class="ml-n3"
                                        >{{ formattedDate }}</v-text-field>
                                        </template>
                                        <v-date-picker class="ml-10"
                                        :disabled-dates="disabledDates"
                                        is-required
                                        v-model="date"
                                        ></v-date-picker>
                                    </v-menu>
                                </v-col>
                            </v-row>
                        </v-col>
                        <v-col cols="3" lg="3" md="5" sm="6">
                            <v-row>
                                <span class="text-h6">¿Hora de inicio?</span>
                            </v-row>
                            <v-row>
                                <v-col>
                                    <v-select
                                        v-model="startTime"
                                        :items="allTimes"
                                        label="Inicio"
                                        prepend-icon="mdi-weather-sunny"
                                        variant="outlined"
                                        density="compact"
                                        class="ml-n3"
                                        clearable
                                    />
                                </v-col>
                            </v-row>
                        </v-col>
                        <v-col cols="3" lg="3" md="5" sm="6">
                            <v-row>
                                <span class="text-h6">¿Duración?</span>
                            </v-row>
                            <v-row>
                                <v-col>
                                    <v-select
                                        v-model="duration"
                                        :items="timeFrames"
                                        item-title="label"
                                        item-value="value"
                                        label="Duración"
                                        prepend-icon="mdi-timer-sand"
                                        variant="outlined"
                                        density="compact"
                                        class="ml-n3"
                                        clearable
                                        />
                                </v-col>
                            </v-row>
                        </v-col>
                        <v-col cols="3" lg="3" md="5" sm="12">
                            <v-row>
                                <span class="text-h6">¿Número de asientos?</span>
                            </v-row>
                            <v-row>
                                <v-col>
                                    <v-text-field 
                                        v-model.number="reservationSeats" 
                                        label="Número de asientos"
                                        prepend-icon="mdi-table-chair" 
                                        type="number"
                                        variant="outlined"
                                        density="compact"
                                        required
                                        @input="reservationSeats = Math.max(1, reservationSeats)"
                                    />
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-card-text>
                </v-card>
            </v-row>
            <v-row>
                <v-col v-if="!filteredSpaces.length" class="d-flex justify-center align-center mt-5">
                    <span class="text-h4">No hay espacios disponibles para esos filtros de búsqueda</span>
                </v-col>
                <v-col v-else>
                    <v-container fluid>
                        <v-row>
                            <v-col v-for="space in filteredSpaces" :key="space._id" cols="6" lg="4" md="6" sm="12">
                                <v-card>
                                    <v-img
                                        :src="space?.imageUrl"
                                        color="surface-variant"
                                        height="200px"
                                        cover
                                    ></v-img>
                                    <v-card-title class="text-h5">{{space?.name}}</v-card-title>
                                    <v-card-text>
                                        <v-row class="d-flex align-center">
                                            <v-col>
                                                <v-row class="d-flex align-center">
                                                    <v-col cols="1">
                                                        <v-icon
                                                            size="small"
                                                            icon="mdi-weather-sunny"
                                                        ></v-icon>
                                                    </v-col>
                                                    <v-col><span class="text-h6">Abre: {{space?.opening}}</span></v-col>
                                                </v-row>
                                            </v-col>
                                            <v-col>
                                                <v-row class="d-flex align-center"> 
                                                    <v-col cols="1">
                                                        <v-icon
                                                            size="small"
                                                            icon="mdi-weather-night"
                                                        ></v-icon>
                                                    </v-col>
                                                    <v-col><span class="text-h6">Cierra: {{space?.closing}}</span></v-col>
                                                </v-row>
                                            </v-col>
                                        </v-row>
                                        <v-row>
                                            <v-col>
                                                <v-row>
                                                    <v-col cols="1" class="d-flex align-center">
                                                        <v-icon
                                                            icon="mdi-timer-sand"
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
                                            <v-col cols="12" >
                                                <v-row>
                                                    <v-col cols="1" class="d-flex align-center">
                                                        <v-icon
                                                            icon="mdi-table-chair"
                                                            size="small"
                                                        />
                                                    </v-col>
                                                    <v-col>
                                                        <span class="text-h6">Máx. {{space?.seats}} asientos</span>
                                                    </v-col>
                                                </v-row>
                                            </v-col>
                                        </v-row>
                                        <v-row>
                                            <v-col>
                                                <v-select
                                                    v-model="reservationStartTime"
                                                    :items="calcStartTimeOfSpace(space)"
                                                    label="Inicio"
                                                    prepend-icon="mdi-clock-outline"
                                                    variant="outlined"
                                                    density="compact"
                                                />
                                            </v-col>
                                            <v-col>
                                                <v-select
                                                    v-model="duration"
                                                    :items="this.timeFrames"
                                                    item-title="label"
                                                    item-value="value"
                                                    label="Duración"
                                                    prepend-icon="mdi-timer-sand"
                                                    variant="outlined"
                                                    density="compact"
                                                    />
                                            </v-col>
                                        </v-row>
                                    </v-card-text>
                                    <v-card-actions class="mt-n6 mx-2 mb-2">
                                        <TonalButton
                                            block
                                            class=""
                                            color="blue"
                                            text="Reservar"
                                            @click="createReservation"
                                        />
                                    </v-card-actions>
                                </v-card>
                            </v-col>
                        </v-row>
                    </v-container>
                </v-col>
            </v-row>
        </v-col>
    </v-container>
</template>

<script>
import { spaceService } from '@/services/spaceService';
import { reservationService } from '@/services/reservationService';
import { useReservationStore } from '@/store/reservationStore';
import { useToast } from 'vue-toastification';
import TonalButton from '@/components/TonalButton.vue';

export default {
    components: {
        TonalButton
    },
    data() {
        return {
            /*** Stores ***/
            reservationStore: null,

            /*** Spaces variables ***/
            spaces: [],
            filteredSpaces: [],
            selectedSpace: null,
            spaceRerservationTime: null,
            spaceSeats: null,
            reservationSeats: 1,

            /*** Reservation variables ***/
            reservationStartTime: null,
            
            /*** Dates variables ***/
            date: new Date(),
            formattedDate: this.formatDate(new Date()),
            disabledDates: [
                {
                    repeat: {
                        weekdays: [1],
                    },
                },
            ],
            
            /*** Time variables ***/
            startTime: null,
            allTimes: [],
            availableTimesInSpace: [],
            duration: null,
            durationOfSpace: null,
            timeFrames: [
                { label: '15 mins', value: 15 },
                { label: '20 mins', value: 20 },
                { label: '30 mins', value: 30 },
                { label: '1 hora', value: 60 },
                { label: '1.5 horas', value: 90 },
                { label: '2 horas', value: 120 },
                { label: '3 horas', value: 180 },
                { label: '4 horas', value: 240 },
                { label: '5 horas', value: 300 },
            ],
            startTimeOfSpace: [],
        
            /*** Rules ***/
            spaceSeatsRules: [
                v => !!v || 'El campo es obligatorio',
                v => v <= this.selectedSpace.seats || 'El campo debe ser menor que el número de asientos disponibles',
            ]
        };
    },
    unmounted() {
        this.reservationStore.clearSelectedReservedSpace();
    },
    mounted() {
        this.startTimeOfSpace = this.allTimes;
        this.durationOfSpace = this.timeFrames;

        this.generateAllTimes();

        this.getSpaces();
        this.reservationStore = useReservationStore();

        if (this.reservationStore.getSelectedReservedSpace) {
            this.selectedSpace = this.reservationStore.getSelectedReservedSpace;
        }

    },
    computed: {

    },
    watch: {
        date(newVal) {
             this.formattedDate = this.formatDate(newVal);            
        },
        startTime(newVal) {
            this.filterSpaces();
        },
        duration(newVal) {
            this.filterSpaces();
        },
        reservationSeats(newVal) {
            this.filterSpaces();
        },
    },
    methods: {
        getSpaces() {
            spaceService.getSpaces()
                .then(res => {
                    this.spaces = res.data.spaces;
                    this.filteredSpaces = res.data.spaces;
                })
                .catch(error => {
                    console.error(error);
                });
        },
        filterSpaces(){
            this.filteredSpaces = this.spaces.filter(space => {
                const matchesStartTime = this.startTime == null || (space.opening <= this.startTime && space.closing > this.startTime);
                const matchesDuration = this.duration == null || space.duration <= this.duration;
                const matchesSeats = this.reservationSeats == null || space.seats >= this.reservationSeats;

                // Retorna true solo si cumple todas las condiciones
                return matchesStartTime && matchesDuration && matchesSeats;
            });
        },
        generateAllTimes() {
            for (let hour = 0; hour < 24; hour++) {
                for (let minute = 0; minute < 60; minute += 15) {
                    const formattedTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
                    this.allTimes.push(formattedTime);
                }
            }
        },
        formatDateToYYYYMMDD(date) {
            if (!(date instanceof Date)) {
                throw new Error('El argumento debe ser una instancia de Date');
            }
            
            const year = date.getFullYear(); // Obtiene el año
            const month = String(date.getMonth() + 1).padStart(2, '0'); // Mes (0-11) -> Agrega 1 y rellena con 0 si es necesario
            const day = String(date.getDate()).padStart(2, '0'); // Día -> Rellena con 0 si es necesario

            return `${year}-${month}-${day}`;
        },
        calcStartTimeOfSpace(space) {
            const hours = [];            

            // Descomposición de las horas y minutos de apertura y cierre
            const [openingHour, openingMinute] = space.opening.split(':').map(Number);
            const [closingHour, closingMinute] = space.closing.split(':').map(Number);

            // Convertir horas y minutos a minutos totales
            const openingInMinutes = openingHour * 60 + openingMinute;
            const closingInMinutes = closingHour * 60 + closingMinute;

            // Bucle para calcular los intervalos según la duración
            for (let time = openingInMinutes; time < closingInMinutes; time += space.duration) {
                const hoursPart = Math.floor(time / 60).toString().padStart(2, '0');
                const minutesPart = (time % 60).toString().padStart(2, '0');
                hours.push(`${hoursPart}:${minutesPart}`);
            }

            return hours;
        },

        calcDurationOfSpace() {

        },
        async submit() {
            const toast = useToast();
            if (this.camposVacios()) {
                toast.error('Formulario inválido');
                return;
            }

            const formData = new FormData();
            formData.append('space', this.selectedSpace._id);
            const finalDate = this.formatDateToYYYYMMDD(this.date);
            formData.append('date', finalDate);
            formData.append('startTime', this.startTime);
            formData.append('seatsReserved', this.spaceSeats);
            formData.append('repetition', 'none');

            try {
                const res = await reservationService.createReservation(formData);
                console.log(res.data);
                
                toast.success('Espacio creado con éxito');
            } catch (error) {
                console.error(error);
            }
        },
        camposVacios() {
            return !this.selectedSpace || !this.formattedDate || !this.startTime || !this.spaceSeats;
        },
        formatDate(date) {
            return new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).format(date);
        },
        routerBack() {
            this.$router.go(-1);
        },
        clearFields() {
            this.startTime = null;
            this.spaceSeats = null; 
        }
    }
};
</script>

<style scoped>

</style>