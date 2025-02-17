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
                                            :readonly="true"
                                        >{{ formattedDate }}</v-text-field>
                                        </template>
                                        <v-date-picker class="ml-10"
                                            :disabled-dates="disabledDates"
                                            :min-date='new Date()'
                                            is-required
                                            v-model="date"
                                        />
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
                                        :items="generateAllTimes()"
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
            <div v-if="isLoading" class="loader-overlay">
                <v-progress-circular  indeterminate color="primary" size="50"></v-progress-circular>
            </div>
            <v-row class="mx-n7">
                <v-col v-if="!filteredSpaces.length && !isLoading" class="d-flex justify-center align-center mt-5">
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
                                                    :items="availableTimes[space._id]"
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
import { reservationService } from '@/services/reservationService';
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
            reservationsByDate: [],
            
            /*** Dates variables ***/
            date: new Date(),
            formattedDate: this.parseToStringDate(new Date()),
            disabledDates: [
                { repeat: { weekdays: [1], }, },
            ],
            
            /*** Time variables ***/
            startTime: null,
            durationSearched: null,
            timeFrames: [
                { label: '15 mins', value: 15 },
                { label: '20 mins', value: 20 },
                { label: '30 mins', value: 30 },
                { label: '1 hora', value: 60 },
                { label: '2 horas', value: 120 },
                { label: '3 horas', value: 180 },
            ],    
            availableTimes: {}, // Cache de horarios disponibles  
            isLoading: false,      
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
        async date(newVal) {            
            this.formattedDate = this.parseToStringDate(newVal);
            this.reservationsByDate = null;
            this.filterSpaces(); 
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
                    this.filterSpaces();
                })
                .catch(error => {
                    console.error(error);
                });
        },
        async getReservationsByDate(date) {
            const parsedDate = this.parseToYYYYMMDD(date);
            try{
                const response = await reservationService.getReservationsByDate(parsedDate);
                this.reservationsByDate = response.data.reservations;    
            }catch(error){
                console.error(error);
            }
        },
        updateAvailableTimes() {
            const today = new Date();
            const hour = today.getHours();
            const min = today.getMinutes();
            const todayInMinutes = hour * 60 + min;

            const dateSelected = new Date(this.date);
            dateSelected.setHours(0, 0, 0, 0);            

            this.availableTimes = this.spaces.reduce((acc, space) => {
                const temp = this.calcStartTimeOfSpace(space);      // Guardamos los horarios del espacio
                if (dateSelected > today) acc[space._id] = temp;    // Si la fecha seleccionada es mayor a la actual, devuelve todos los horarios del espacio
                else{
                    acc[space._id] = temp.filter(spaceTime => {                 // Si la fecha seleccionada es hoy, hay que devolver las horas posteriores a la hora actual, 
                        if (this.makeMinutes(spaceTime) > todayInMinutes) {     // para evitar que se seleccione horas pasadas
                            return true;
                        } 
                        return false;
                    });
                }

                return acc;
            }, {});
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
        async filterSpaces() {
            this.isLoading = true;
            if (!this.reservationsByDate || this.reservationsByDate.length === 0) {
                await this.getReservationsByDate(this.formattedDate); // Asegurar que tenga datos
            }

            this.updateAvailableTimes();

            this.filteredSpaces = this.spaces.filter(space => {
                const isAvailable = this.availableTimes[space._id] || []; // Accedemos a los horarios pre-cargados

                if (isAvailable.length === 0) {
                    return false; // Excluye espacios sin horarios disponibles
                }

                const matchesStartTime = this.startTime == null || 
                    (this.makeHoursAndMinutes(space.opening) <= this.startTime && 
                    this.makeHoursAndMinutes(space.closing) > this.startTime);

                const matchesDuration = this.durationSearched == null || space.duration <= this.durationSearched;
                const matchesSeats = this.reservationSeats == null || space.seats >= this.reservationSeats;

                return matchesStartTime && matchesDuration && matchesSeats;
            });
            this.isLoading = false;
        },
        calcStartTimeOfSpace(space) {
            return this.calcFrameTimesOfSpace(space._id, space.opening, space.closing, 15, space.duration, true);
        },
        calcEndTimeOfSpace(space) { 
            if (this.reservationTimes[space._id] != null && this.reservationTimes[space._id].reservationStartTime != undefined) {
                const start = this.makeMinutes(this.reservationTimes[space._id].reservationStartTime);
                return this.calcFrameTimesOfSpace(space._id, start + space.duration, space.closing, space.duration, space.duration, false);
            }
        },
        calcFrameTimesOfSpace(spaceId, startingTime, endingTime, interval, duration, needsVerification) {
            const hours = [];
            const hoursReserved = [];

            if (this.reservationsByDate.length > 0 ) {
                this.reservationsByDate.map(reservation => {
                    if (reservation.spaceId === spaceId) {
                        hoursReserved.push({
                            start: this.getHoursAndMinsFromDate(reservation.startTime),
                            end: this.getHoursAndMinsFromDate(reservation.endTime)
                        });
                    }
                });
            }

            // Bucle para calcular los intervalos según la duración
            for (let time = startingTime; time <= endingTime; time += interval) {
                if (needsVerification && time + duration > endingTime) break;

                const hoursPart = Math.floor(time / 60).toString().padStart(2, '0');
                const minutesPart = (time % 60).toString().padStart(2, '0');
                const currentTime = `${hoursPart}:${minutesPart}`;

                // Verificar si la hora está en un intervalo reservado
                let isReserved = false;
                let isEnd = false;
                for (const reservation of hoursReserved) {
                    const startMinutes = parseInt(reservation.start.split(":")[0]) * 60 + parseInt(reservation.start.split(":")[1]);
                    const endMinutes = parseInt(reservation.end.split(":")[0]) * 60 + parseInt(reservation.end.split(":")[1]);

                    if (time === startMinutes && needsVerification == false) {     //Si needsVerification es false, entonces está calculando las horas del final
                        isEnd = true;                                              // y por lo tanto, si encuentra una hora que coincide con el inicio de otra reserva, no debe agregar más horas
                        break; // No es necesario seguir buscando
                    }

                    if(time + duration > startMinutes && time + duration < endMinutes){
                        // Si time + duration está dentro del intervalo reservado, no agregar a la lista
                        // serán las horas previas a una reserva que coincida con el inicio de otra reserva
                        isReserved = true
                        break;
                    }

                    if (time >= startMinutes && time < endMinutes) {
                        isReserved = true;
                        break; // No es necesario seguir buscando
                    }
                }

                if (isReserved) {
                    continue; // Saltar esta iteración si está dentro de un intervalo reservado
                }
                // Si no está en un rango reservado, agregar a la lista
                hours.push(currentTime);
                if (isEnd) {                  
                    break; 
                }
            }
            return hours;
        },
        disablePastDates(date) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const selectedDate = new Date(date);
            selectedDate.setHours(0, 0, 0, 0);

            return selectedDate < today; // Desactiva fechas pasadas
        },
        generateAllTimes() {
            const times = [];
            for (let hour = 0; hour < 24; hour++) {
                for (let minute = 0; minute < 60; minute += 15) {
                    const formattedTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
                    times.push(formattedTime);
                }
            }
            return times;
        },
        makeMinutes(time) {
            const [hour, minutes] = time.split(':').map(Number);
            return hour * 60 + minutes;
        },
        makeHoursAndMinutes(minutes) {
            const hours = Math.floor(minutes / 60);
            const mins = minutes % 60;

            // Formatea con ceros a la izquierda
            const formattedHours = String(hours).padStart(2, '0');
            const formattedMinutes = String(mins).padStart(2, '0');

            return `${formattedHours}:${formattedMinutes}`;
        },
        getHoursAndMinsFromDate(date) {            
            const dateObj = new Date(date);
            const hours = String(dateObj.getUTCHours()).padStart(2, '0'); 
            const mins = String(dateObj.getUTCMinutes()).padStart(2, '0');
            return `${hours}:${mins}`;
        },
        parseToStringDate(date) {
            return new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(date);
        },
        parseToYYYYMMDD(date) {            
            // Mapear nombres de meses en español a números
            const months = {
                "enero": "01", 
                "febrero": "02", 
                "marzo": "03", 
                "abril": "04",
                "mayo": "05", 
                "junio": "06", 
                "julio": "07", 
                "agosto": "08",
                "septiembre": "09", 
                "octubre": "10", 
                "noviembre": "11", 
                "diciembre": "12"
            };
            
            // Extraer la información de la fecha
            const parts = date.split(",")[1].trim().split(" "); // ["30", "de", "enero"]
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
            const selectedDate = this.parseToYYYYMMDD(this.formattedDate);

            // Obtener la hora de inicio y fin en formato HH:MM directamente
            const startTimeString = this.reservationTimes[space._id].reservationStartTime; // Ejemplo: "09:30"
            const endTimeString = this.reservationTimes[space._id].reservationEndTime; // Ejemplo: "11:00"

            // Crear objetos Date combinando la fecha seleccionada con la hora de inicio y fin
            const startTime = new Date(`${selectedDate}T${startTimeString}:00Z`);
            const endTime = new Date(`${selectedDate}T${endTimeString}:00Z`);

            const reservation = {
                spaceId: space._id,
                userId: this.userStore.getId,
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                seatsReserved: this.reservationSeats,
                repetition: "none",
            }
            
            this.reservationStore.setReservation(reservation);
            this.spaceStore.setSelectedSpace(space);

            this.$router.push("/confirmReservation");
        },
    }
};
</script>

<style scoped>
.loader-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999; 
}
</style>