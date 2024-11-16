<template>
    <v-container class="container">
        <v-card class="mx-auto px-2" max-width="600">
            <v-card-title class="my-3">
                <span class="text-h4">Nueva Reserva</span>
            </v-card-title>
            <v-card-text>
                <v-col>
                    <v-row>
                        <v-select
                            v-model="selectedSpace"
                            :items="spaces"
                            item-title="name"
                            item-value="_id"
                            label="Espacio"
                            variant="outlined"
                            prepend-icon="mdi-office-building"
                            :rules="[v => !!v || 'Selecciona un espacio']"
                            required
                            class="my-1"
                        />
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
                                <v-date-picker class="ml-10" v-model="date"></v-date-picker>
                            </v-menu>
                        </v-col>
                        <v-col cols="5">
                            <v-menu
                            location="bottom"
                            transition="slide-y-transition"
                            >
                                <template #activator="{ props }">
                                    <v-text-field
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
                    </v-row>

                    <v-row style="margin-top: 3px;">
                        <v-col cols="3">
                            <v-menu
                            location="bottom"
                            transition="slide-y-transition"
                            >
                                <template #activator="{ props }">
                                    <v-text-field
                                        v-model="startTime"
                                        label="Inicio"
                                        prepend-icon="mdi-clock-outline"
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
                        <v-col cols="3"> 
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

                </v-col>
            </v-card-text>
            <v-card-actions class="mt-n2 mb-3 mr-2 d-flex justify-end ga-3">
                <TonalButton 
                    color="grey" 
                    text="Volver" 
                />
                <TonalButton
                    text="Crear"
                    color="blue"
                />
            </v-card-actions>
        </v-card>
    </v-container>
</template>

<script>
import { spaceService } from '@/services/spaceService';
import TonalButton from '@/components/TonalButton.vue';

export default {
    components: {
        TonalButton
    },
    data() {
        return {
            date: new Date(),
            formattedDate: this.formatDate(new Date()),
            selectedSpace: null,
            seatsReserved: 1,
            spaces: [],
            startTime: null,
            endTime: null,
            availableTimes: [],
            repetitionTime: null,
            availableRepetitionTimes: ['No', 'Diariamente', 'Semanalmente', 'Mensualmente', 'Dias laborales'], // Opciones de repetición
        };
    },
    mounted() {
        this.fetchSpaces();
        this.generateAvailableTimes();
    },
    computed: {
        filteredClosingTimes() {
            if (!this.startTime) return this.availableTimes;
                const openingIndex = this.availableTimes.indexOf(this.startTime);
                return this.availableTimes.slice(openingIndex + 1);
        },
    },
    watch: {
        selectedSpace(newValue) {
            this.clearFields();
            this.generateAvailableTimes();
        },
        date(newValue) {
            this.formattedDate = this.formatDate(newValue);
        },
        startTime(newVal) {
            if (newVal && this.endTime && newVal >= this.endTime) {
                this.endTime = null;
            }
        },
    },
    methods: {
        fetchSpaces() {
            spaceService.getSpaces()
                .then(res => {
                    this.spaces = res.data.spaces;
                })
                .catch(error => {
                    console.error(error);
                });
        },
        generateAvailableTimes() {
            // Reinicia la lista de tiempos disponibles
            this.availableTimes = [];

            if (!this.selectedSpace || !this.selectedSpace.opening || !this.selectedSpace.closing) {
                
                this.availableTimes = ['1','2','3'];
            }

            // Convierte el tiempo de apertura y cierre a horas y minutos
            const [openingHour, openingMinute] = this.selectedSpace.opening.split(':').map(Number);
            const [closingHour, closingMinute] = this.selectedSpace.closing.split(':').map(Number);

            // Calcula el tiempo inicial y final en minutos
            const openingInMinutes = openingHour * 60 + openingMinute;
            const closingInMinutes = closingHour * 60 + closingMinute;

            // Genera los tiempos disponibles dentro del rango
            for (let time = openingInMinutes; time < closingInMinutes; time += 15) {
                const hours = Math.floor(time / 60).toString().padStart(2, '0');
                const minutes = (time % 60).toString().padStart(2, '0');
                this.availableTimes.push(`${hours}:${minutes}`);
            }
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
        clearFields() {
            this.startTime = null;
            this.endTime = null;
            this.repetitionTime = null;
        }
    }
};
</script>
