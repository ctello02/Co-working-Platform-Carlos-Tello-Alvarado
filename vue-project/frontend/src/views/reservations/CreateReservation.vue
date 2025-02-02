<template>
    <v-container fluid>
        <v-col>
            <v-row>
                <span class="text-h4">Nueva reserva</span>
            </v-row>
            <v-row>
                <v-card class="pa-2 mt-4 mb-n3" width="100%">
                    <v-card-text class="d-flex justify-space-between mb-n5 flex-wrap">
                        <v-col xl="3" lg="3" md="4" sm="12" xs="12">
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
                        <v-col xl="3" lg="3" md="5" sm="12" xs="12">
                            <v-row>
                                <span class="text-h6">¿Hora de inicio?</span>
                            </v-row>
                            <v-row>
                                <v-col>
                                    <v-select
                                        v-model="startTime"
                                        :items="allTimes"
                                        label="Inicio"
                                        prepend-icon="mdi-timer-sand"
                                        variant="outlined"
                                        density="compact"
                                        class="ml-n3"
                                        clearable
                                    />
                                </v-col>
                            </v-row>
                        </v-col>
                        <v-col xl="3" lg="3" md="5" sm="12" xs="12">
                            <v-row>
                                <span class="text-h6">¿Duración?</span>
                            </v-row>
                            <v-row>
                                <v-col>
                                    <v-select
                                        v-model="durationSearched"
                                        :items="timeFrames"
                                        item-title="label"
                                        item-value="value"
                                        label="Duración"
                                        prepend-icon="mdi-timer-outline"
                                        variant="outlined"
                                        density="compact"
                                        class="ml-n3"
                                        clearable
                                    />
                                </v-col>
                            </v-row>
                        </v-col>
                        <v-col xl="3" lg="3" md="5" sm="12" xs="12">
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
            <v-row class="mx-n7">
                <v-col v-if="!filteredSpaces.length" class="d-flex justify-center align-center mt-5">
                    <span class="text-h4">No hay espacios disponibles para esos filtros de búsqueda</span>
                </v-col>
                <v-col v-else class="px-0">
                    <v-container fluid>
                        <v-row>
                            <v-col v-for="space in filteredSpaces" :key="space._id" xl="3" lg="4" md="6" sm="12" xs="12">
                                <v-card>
                                    <v-img
                                        :src="space?.image"
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
                                                    <v-col><span class="text-h6">Abre: {{this.makeHoursAndMinutes(space?.opening)}}</span></v-col>
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
                                                    <v-col><span class="text-h6">Cierra: {{this.makeHoursAndMinutes(space?.closing)}}</span></v-col>
                                                </v-row>
                                            </v-col>
                                        </v-row>
                                        <v-row>
                                            <v-col>
                                                <v-row>
                                                    <v-col cols="1" class="d-flex align-center">
                                                        <v-icon
                                                            icon="mdi-timer-outline"
                                                            size="small"
                                                        />
                                                    </v-col>
                                                    <v-col>
                                                        <span class="pt-2 text-h6" v-if="space.duration < 60">Tiempos de: {{space.duration}} minutos</span>
                                                        <span class="pt-2 text-h6" v-if="space.duration == 60">Tiempos de: {{space.duration / 60}} hora</span>
                                                        <span class="pt-2 text-h6" v-if="space.duration > 60">Tiempos de: {{space.duration / 60}} horas</span>
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
                                                    :model-value="reservationTimes[space._id]?.reservationStartTime || null"
                                                    @update:model-value="val => updateReservation(space._id, 'reservationStartTime', val)"
                                                    :items="calcStartTimeOfSpace(space)"
                                                    label="Inicio"
                                                    prepend-icon="mdi-timer-sand"
                                                    variant="outlined"
                                                    density="compact"
                                                    clearable
                                                />
                                            </v-col>
                                            <v-col>
                                                <v-select
                                                    :model-value="reservationTimes[space._id]?.reservationEndTime || null"
                                                    @update:model-value="val => updateReservation(space._id, 'reservationEndTime', val)"
                                                    :items="calcEndTimeOfSpace(space)"
                                                    item-title="label"
                                                    item-value="value"
                                                    label="Final"
                                                    prepend-icon="mdi-timer-sand-complete"
                                                    variant="outlined"
                                                    density="compact"
                                                    clearable
                                                    :disabled="!reservationTimes[space._id]?.reservationStartTime"
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
                                            :disabled="!reservationTimes[space._id]?.reservationStartTime || !reservationTimes[space._id]?.reservationEndTime"
                                            @click="createReservation(space)"
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
import { useUserStore } from '@/store/userStore';
import { useSpaceStore } from '@/store/spaceStore';
import { useReservationStore } from '@/store/reservationStore';
import TonalButton from '@/components/TonalButton.vue';

export default {
    components: {
        TonalButton
    },
    data() {
        return {
            /*** Store variables ***/
            userStore: null,
            spaceStore: null,
            reservationStore: null,

            /*** Spaces variables ***/
            spaces: [],
            filteredSpaces: [],
            
            /*** Reservation variables ***/
            reservationTimes: {},
            reservationSeats: 1,
            
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
            durationSearched: null,
            timeFrames: [
                { label: '15 mins', value: 15 },
                { label: '20 mins', value: 20 },
                { label: '30 mins', value: 30 },
                { label: '1 hora', value: 60 },
                { label: '2 horas', value: 120 },
                { label: '3 horas', value: 180 },
            ],
        };
    },
    mounted() {
        this.userStore = useUserStore();
        this.spaceStore = useSpaceStore();
        this.reservationStore = useReservationStore();
        this.generateAllTimes();
        this.getSpaces();        
    },
    watch: {
        date(newVal) {
             this.formattedDate = this.formatDate(newVal);  
        },
        startTime(newVal) {
            this.filterSpaces();
            this.reservationTimes = {};
        },
        durationSearched(newVal) {
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
        updateReservation(spaceId, key, value) {
            if (!this.reservationTimes[spaceId]) {
                this.reservationTimes[spaceId] = { reservationStartTime: null, reservationEndTime: null };
            }
            this.reservationTimes[spaceId][key] = value;

            if (key === 'reservationStartTime') {              
                this.reservationTimes[spaceId].reservationEndTime = null;
            }
        },
        filterSpaces(){
            this.filteredSpaces = this.spaces.filter(space => {
                const matchesStartTime = this.startTime == null || (this.makeHoursAndMinutes(space.opening) <= this.startTime && this.makeHoursAndMinutes(space.closing) > this.startTime);
                const matchesDuration = this.durationSearched == null || space.duration <= this.durationSearched;
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
        calcStartTimeOfSpace(space) {
            return this.calcFrameTimesOfSpace(space.opening, space.closing, 0, 15, space.duration, true);
        },
        calcEndTimeOfSpace(space) { 
            if (this.reservationTimes[space._id] != null && this.reservationTimes[space._id].reservationStartTime != undefined) {
                const start = this.decomposeHoursAndMinutes(this.reservationTimes[space._id].reservationStartTime);
                return this.calcFrameTimesOfSpace(start, space.closing, space.duration, space.duration, space.duration, false);
            }
            return this.calcFrameTimesOfSpace(space.opening, space.closing, space.duration, space.duration, space.duration, false);
        },
        calcFrameTimesOfSpace(startingTime, endingTime, temp, interval, duration, needsVerification) {
            const hours = [];

            // Bucle para calcular los intervalos según la duración
            for (let time = startingTime + temp; time <= endingTime; time += interval) {
                if(needsVerification && time + duration > endingTime) break;
                
                const hoursPart = Math.floor(time / 60).toString().padStart(2, '0');
                const minutesPart = (time % 60).toString().padStart(2, '0');
                hours.push(`${hoursPart}:${minutesPart}`);
            }

            return hours;
        },
        decomposeHoursAndMinutes(time) {
            const [hour, minute] = time.split(':').map(Number);
            const hourInMinutes = hour * 60 + minute;
            return hourInMinutes;
        },
        makeHoursAndMinutes(minutes) {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;

            // Formatea con ceros a la izquierda
            const formattedHours = String(hours).padStart(2, '0');
            const formattedMinutes = String(mins).padStart(2, '0');

            return `${formattedHours}:${formattedMinutes}`;
        },
        formatDate(date) {
            return new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date);
        },
        parseDate(spanishDate) {
            // Mapear nombres de meses en español a números
            const months = {
                "enero": "01", "febrero": "02", "marzo": "03", "abril": "04",
                "mayo": "05", "junio": "06", "julio": "07", "agosto": "08",
                "septiembre": "09", "octubre": "10", "noviembre": "11", "diciembre": "12"
            };

            // Extraer la información de la fecha
            const parts = spanishDate.split(",")[1].trim().split(" "); // ["30", "de", "enero"]
            const day = parts[0].padStart(2, "0"); // Asegurar formato 2 dígitos
            const month = months[parts[2]]; // Obtener el número del mes
            const year = new Date().getFullYear(); // Año actual (2025 en este caso)

            return `${year}-${month}-${day}`;
        },
        routerBack() {
            this.$router.go(-1);
        },
        async createReservation(space){
            // Convertimos la fecha seleccionada a un formato válido (YYYY-MM-DD)
            const selectedDate = this.parseDate(this.formattedDate);

            // Obtener la hora de inicio y fin en formato HH:MM directamente
            const startTimeString = this.reservationTimes[space._id].reservationStartTime; // Ejemplo: "09:30"
            const endTimeString = this.reservationTimes[space._id].reservationEndTime; // Ejemplo: "11:00"

            // Crear objetos Date combinando la fecha seleccionada con la hora de inicio y fin
            const startTime = new Date(`${selectedDate}T${startTimeString}:00Z`);
            const endTime = new Date(`${selectedDate}T${endTimeString}:00Z`);

            console.log("Fecha de inicio.toIsoString():", startTime.toISOString());
            console.log("Fecha de fin.toISOString():", endTime.toISOString());

            const reservation = {
                spaceId: space._id,
                userId: this.userStore.getId,
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                seatsReserved: this.reservationSeats,
                repetition: "none",
            }
            console.log("reservation creada: "+reservation);
            
            this.reservationStore.setReservation(reservation);
            this.spaceStore.setSelectedSpace(space);

            this.$router.push("/confirmReservation");

            // const formData = new FormData();
            // formData.append('spaceId', space._id);
            // formData.append('userId', this.userStore.getId);
            // formData.append('startTime', startTime.toISOString());
            // formData.append('endTime', endTime.toISOString());
            // formData.append('seatsReserved', this.reservationSeats);
            // formData.append('repetition', 'none');

            // try {
            //     const res = await reservationService.createReservation(formData);
            //     console.log(res.data);
            // } catch (error) {
            //     console.error(error);
            // }

        },
    }
};
</script>

<style scoped>

</style>