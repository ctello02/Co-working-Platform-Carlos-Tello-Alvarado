<template>
    <v-container class="container">
        <v-row>
            <v-col :cols="selectedSpaceInfoModal ? 6 : 12">
                <v-card class="mx-auto px-2" max-width="900">
                    <v-card-title class="my-3">
                        <span class="text-h4">Nueva Reserva</span>
                    </v-card-title>
                    <!-- <v-card-text>
                        <v-col>
                            <v-row>
                                <v-col>
                                    <v-select
                                        v-model="selectedSpaceVSelect"
                                        :items="spaces"
                                        item-title="name"
                                        item-value="_id"
                                        label="Espacio"
                                        variant="outlined"
                                        density="compact"
                                        prepend-icon="mdi-table-chair"
                                        :append-icon="appendIcon"
                                        @click:append="seeSpace"
                                        :rules="[v => !!v || 'Selecciona un espacio']"
                                        required
                                    />
                                </v-col>
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
                                        <v-date-picker class="ml-10" v-model="date"></v-date-picker>
                                    </v-menu>
                                </v-col>
                                <v-col cols="2">
                                    <v-menu
                                    location="top"
                                    transition="slide-y-transition"
                                    >
                                        <template #activator="{ props }">
                                            <v-text-field
                                                v-model="startTime"
                                                label="Inicio"
                                                prepend-icon="mdi-clock-outline"
                                                :disabled="!selectedSpace"
                                                variant="outlined"
                                                density="compact"
                                                class="ml-n3 mr-n3"
                                                v-bind="props"
                                            ></v-text-field>
                                        </template>
                                        <v-list style="max-height: 300px; overflow-y: auto;">
                                            <v-list-item
                                                v-for="(time, index) in availableTimes"
                                                :key="index"
                                                @click="selectOpeningTime(time)"
                                            >
                                                <v-list-item-title>{{ time }}</v-list-item-title>
                                            </v-list-item>
                                        </v-list>
                                    </v-menu>
                                </v-col>
                                <v-col cols="2">
                                    <v-menu
                                    location="bottom"
                                    transition="slide-y-transition"
                                    >
                                        <template #activator="{ props }">
                                            <v-text-field
                                                v-model="endTime"
                                                label="Fin"
                                                :disabled="!startTime"
                                                variant="outlined"
                                                density="compact"
                                                class="mr-3"
                                                v-bind="props"
                                            ></v-text-field>
                                        </template>
                                        <v-list style="max-height: 300px;">
                                            <v-list-item
                                                v-for="(time, index) in filteredClosingTimes"
                                                :key="index"
                                                @click="selectClosingTime(time)"
                                            >
                                                <v-list-item-title>{{ time }}</v-list-item-title>
                                            </v-list-item>
                                        </v-list>
                                    </v-menu>
                                </v-col>
                            </v-row>
                            <v-row v-if="selectedSpace">
                                <v-col>
                                    <v-row>
                                        <v-col v-if="selectedSpace.repetition" cols="5">
                                            <v-menu
                                                location="bottom"
                                                transition="slide-y-transition"
                                            >
                                                <template #activator="{ props }">
                                                    <v-text-field
                                                        class="mr-n3"
                                                        v-model="repetitionTime"
                                                        label="Repetición"
                                                        prepend-icon="mdi-repeat"
                                                        variant="outlined"
                                                        density="compact"
                                                        v-bind="props"
                                                    ></v-text-field>
                                                </template>
                                                <v-list style="max-height: 300px; overflow-y: auto;">
                                                    <v-list-item
                                                        v-for="(time, index) in availableRepetitionTimes"
                                                        :key="index"
                                                        @click="selectRepetitionTime(time)"
                                                    >
                                                        <v-list-item-title>{{ time }}</v-list-item-title>
                                                    </v-list-item>
                                                </v-list>
                                            </v-menu>
                                        </v-col>
                                        <v-col v-else cols="5">
                                            <v-tooltip text="No permite repetición" >
                                                <template v-slot:activator="{ props }">
                                                    <v-icon
                                                        class="mt-2"
                                                        color="#848484"
                                                        v-bind="props"
                                                        density="compact"
                                                        icon="mdi-repeat-off"
                                                    />
                                                </template>
                                            </v-tooltip>
                                        </v-col>
                                        <v-col>
                                            <v-text-field 
                                                v-model.number="spaceSeats" 
                                                label="Número de asientos"
                                                prepend-icon="mdi-table-chair" 
                                                type="number"
                                                variant="outlined"
                                                density="compact"
                                                required
                                                :rules="spaceSeatsRules"
                                                @input="spaceSeats = Math.max(0, spaceSeats)"
                                                class="mr-n3"
                                            />
                                        </v-col>
                                    </v-row>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-card-text> -->
                    <v-card-text>
                        <v-col>
                            <v-row class="d-flex align-center justify-space-between">
                                <v-col cols="4">
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
                                <v-col cols="3">
                                    <v-row>
                                        <span class="text-h6">¿Hora de inicio?</span>
                                    </v-row>
                                    <v-row>
                                        <v-col>
                                            <v-select
                                                v-model="startTime"
                                                :items="availableTimes"
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
                                <v-col cols="4">
                                    <v-row>
                                        <span class="text-h6">¿Duración?</span>
                                    </v-row>
                                    <v-row>
                                        <v-col>
                                            <v-select
                                                v-model="selectedTimeFrame"
                                                :items="timeFrames"
                                                item-title="label"
                                                item-value="value"
                                                label="Duración"
                                                prepend-icon="mdi-clock-outline"
                                                variant="outlined"
                                                density="compact"
                                                class="ml-n3"
                                                clearable
                                                />
                                        </v-col>
                                    </v-row>
                                </v-col>
                            </v-row>
                        </v-col>
                        <hr style="border: 1px solid #EBEBEB;">
                        <v-row class="mt-5">
                            <v-col v-for="space in spaces" :key="space._id">
                                <v-card max-width="600">
                                    <v-img
                                        :src="space?.imageUrl"
                                        color="surface-variant"
                                        height="200px"
                                        cover 
                                    ></v-img>
                                    <v-card-title class="text-h5">{{ space.name }}</v-card-title>
                                </v-card>
                            </v-col>
                        </v-row>
                    </v-card-text>
                    <v-card-actions class="mt-n2 mb-3 mr-2 d-flex justify-end ga-3">
                        <TonalButton
                            color="grey"
                            text="Volver"
                            @click="routerBack"
                        />
                        <TonalButton
                            text="Crear"
                            color="blue"
                            @click="submit"
                            :disabled="camposVacios()"
                        />
                    </v-card-actions>
                </v-card>
            </v-col>
            <!-- <v-col :cols="selectedSpaceInfoModal ? 6 : 12">
                <v-card v-if="selectedSpace && selectedSpaceInfoModal" class="mx-auto">
                    <v-img
                        :src="selectedSpace?.imageUrl"
                        color="surface-variant"
                        height="300px"
                        cover  
                    />                            
                    <v-card-text>
                        <v-col>
                            <v-row class="mt-n5 mb-n3" cols="12">
                                <v-col cols="9">
                                    <span class="text-h4">{{ selectedSpace?.name }}</span>
                                </v-col>
                            </v-row>

                            <v-row class="my-n3" cols="12">
                                <v-col cols="1" class="d-flex align-center">
                                    <v-icon
                                        icon="mdi-text"
                                    />
                                </v-col>
                                <v-col>
                                    <span class="text-h6">{{ selectedSpace?.description }}</span>
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
                                    <span class="text-h6">{{selectedSpace?.seats}} asientos</span>
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
                                        <v-col><span class="pt-2 text-h6">Abre a las {{selectedSpace?.opening}}</span></v-col>
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
                                        <v-col><span class="pt-2 text-h6">Cierra a las {{selectedSpace?.closing}}</span></v-col>
                                    </v-row>
                                </v-col>
                            </v-row>

                            <v-row class="mt-n3 mb-n5 d-flex justify-center align-center" cols="12">
                                <v-col>
                                    <v-row>
                                        <v-col cols="2" class="d-flex align-center">
                                            <v-icon
                                                icon="mdi-clock-outline"
                                                size="small"
                                            />
                                        </v-col>
                                        <v-col>
                                            <span class="pt-2 text-h6">Reservas de {{spaceRerservationTime}}</span>
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
                                            <span class="pt-2 text-h6"> {{selectedSpace?.repetition ? 'Permite repetición' : 'No permite repetición'}}</span>
                                        </v-col>
                                    </v-row>
                                </v-col>
                            </v-row>
                        </v-col>
                    </v-card-text>

                    <v-card-actions class="d-flex justify-end ga-3 mt-n3 mb-3 mr-5">
                        <TonalButton
                            color="grey"
                            text="Cerrar"
                            @click="selectedSpaceInfoModal = false"
                        />
                    </v-card-actions>
                </v-card>
            </v-col> -->
        </v-row>
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
            selectedSpace: null,
            spaceRerservationTime: null,
            spaceSeats: null,
            
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

            /*** Selected space info variable ***/
            selectedSpaceInfoModal: false,
            selectedSpaceVSelect: null,
            
            /*** Time variables ***/
            startTime: null,
            endTime: null,
            availableTimes: [],
            repetitionTime: null,
            selectedTimeFrame: null,
            availableRepetitionTimes: ['No', 'Diariamente', 'Semanalmente', 'Mensualmente', 'Dias laborales'], // Opciones de repetición
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
        this.generateStartingTime();

        this.getSpaces();
        this.reservationStore = useReservationStore();

        if (this.reservationStore.getSelectedReservedSpace) {
            this.selectedSpace = this.reservationStore.getSelectedReservedSpace;
            this.selectedSpaceVSelect = this.selectedSpace._id;  
        }
    },
    computed: {
        // filteredClosingTimes() {
        //     if (!this.startTime) return [];
            
        //     const startIndex = this.availableTimes.indexOf(this.startTime);
        //     // Incluye la hora de cierre en la lista de tiempos finales
        //     const closingTime = this.selectedSpace.closing;
        //     return [...this.availableTimes.slice(startIndex + 1), closingTime];
        // },
        appendIcon() {
            if (!this.selectedSpace) {  // Sin icono cuando no hay espacio seleccionado
                return ''; 
            }
            return this.selectedSpaceInfoModal ? 'mdi-information-off-outline' : 'mdi-information-outline';
        },
    },
    watch: {
        selectedSpaceVSelect(newValue) {

            if (this.spaces.length === 0) {
                this.getSpaces();
            }

            if (this.spaces.length > 0) {
                this.selectedSpace = this.spaces.find(space => space._id === newValue);
            }

            this.clearFields();
            this.calcReservationTime();
            this.generateAvailableTimes();
        },
        date(newValue) {
            this.formattedDate = this.formatDate(newValue);            
        },
        // startTime(newVal) {
        //     if (newVal && this.endTime && newVal >= this.endTime) {
        //         this.endTime = null;
        //     }
        // },
    },
    methods: {
        getSpaces() {
            spaceService.getSpaces()
                .then(res => {
                    this.spaces = res.data.spaces;                    
                })
                .catch(error => {
                    console.error(error);
                });
        },
        calcReservationTime() {
            if (this.selectedSpace?.time) {
                const timeInMinutes = parseFloat(this.selectedSpace.time);

                if (timeInMinutes >= 60) {
                    const timeInHours = timeInMinutes / 60;
                    this.spaceRerservationTime = timeInHours === 1 ? '1 hora' : `${timeInHours} horas`;
                } else {
                    this.spaceRerservationTime = `${timeInMinutes} minutos`;
                }
            }
        },
        // generateAvailableTimes() {
        //     this.availableTimes = [];
        //     const toast = useToast();

        //     if (!this.selectedSpace || !this.selectedSpace.opening || !this.selectedSpace.closing) {
        //         toast.error('Selecciona un espacio para generar los tiempos disponibles');
        //         return;
        //     }

        //     // Convierte el tiempo de apertura y cierre a horas y minutos
        //     const [openingHour, openingMinute] = this.selectedSpace.opening.split(':').map(Number);
        //     const [closingHour, closingMinute] = this.selectedSpace.closing.split(':').map(Number);

        //     // Calcula el tiempo inicial y final en minutos
        //     const openingInMinutes = openingHour * 60 + openingMinute;
        //     const closingInMinutes = closingHour * 60 + closingMinute;

        //     // Obtén el intervalo de tiempo del espacio seleccionado
        //     const timeInterval = this.selectedSpace.time;

        //     // Genera los tiempos disponibles dentro del rango
        //     for (let time = openingInMinutes; time < closingInMinutes; time += timeInterval) {
        //         const hours = Math.floor(time / 60).toString().padStart(2, '0');
        //         const minutes = (time % 60).toString().padStart(2, '0');
        //         this.availableTimes.push(`${hours}:${minutes}`);
        //     }
        // },
        generateStartingTime() {
            for (let hour = 0; hour < 24; hour++) {
                for (let minute = 0; minute < 60; minute += 15) {
                    const formattedTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
                    this.availableTimes.push(formattedTime);
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
            formData.append('endTime', this.endTime);
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
            return !this.selectedSpace || !this.formattedDate || !this.startTime || !this.endTime || !this.spaceSeats;
        },
        seeSpace() {
            this.selectedSpaceInfoModal = !this.selectedSpaceInfoModal;
        },
        formatDate(date) {
            return new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).format(date);
        },
        selectRepetitionTime(time) {
            this.repetitionTime = time; 
        },
        selectOpeningTime(time) {
            this.startTime = time; 
        },
        selectClosingTime(time) {
            this.endTime = time; 
        },
        routerBack() {
            this.$router.go(-1);
        },
        clearFields() {
            this.startTime = null;
            this.endTime = null;
            this.repetitionTime = null;
            this.spaceSeats = null; 
        }
    }
};
</script>
