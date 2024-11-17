<template>
    <v-container class="container">
        <v-col>
            <v-row>
                <span class="text-h4">Nueva reserva</span>
            </v-row>
            <v-row class="mt-8">
                <span class="text-h5">Seleccione cómo quiere reservar</span>
            </v-row>
            <v-row class="mt-8">
                <v-col>
                    <v-tooltip 
                    :text="spaceReservationTooltip" 
                    location="bottom"
                    max-width="300"
                    open-delay="250"
                    >
                        <template v-slot:activator="{ props }">
                            <v-card 
                                v-bind="props"
                                @click="toSpaceReservation"
                            >
                                <v-card-title>
                                    <span>Reserva de espacio</span>
                                </v-card-title>
                                <v-img
                                    src=""
                                    color="surface-variant"
                                    height="250px"
                                    cover  
                                />
                            </v-card>
                        </template>
                    </v-tooltip>
                </v-col>
                <v-col>
                    <v-tooltip
                    :text="scheduleReservationTooltip"
                    location="bottom"
                    max-width="300"
                    open-delay="250"
                    >
                        <template v-slot:activator="{ props }">
                            <v-card 
                                v-bind="props"
                                @click="toScheduleReservation"
                            >
                                <v-card-title>
                                    <span>Reserva por horario</span>
                                </v-card-title>
                                <v-img
                                    src=""
                                    color="surface-variant"
                                    height="250px"
                                    cover  
                                />
                            </v-card>
                        </template>
                    </v-tooltip>
                </v-col>
                <v-col>
                    <v-tooltip
                        :text="timeReservationTooltip"
                        location="bottom"
                        max-width="300"
                        open-delay="250"
                    >
                        <template v-slot:activator="{ props }">
                            <v-card 
                                v-bind="props"
                                @click="toTimeReservation"
                            >
                                <v-card-title>
                                    <span>Reserva de horas</span>
                                </v-card-title>
                                <v-img
                                    src=""
                                    color="surface-variant"
                                    height="250px"
                                    cover  
                                />
                            </v-card>
                        </template>
                    </v-tooltip>
                </v-col>
            </v-row>
        </v-col>
    </v-container>
</template>

<script>

export default {
    data() {
        return {
            spaceReservationTooltip: 'Podrá seleccionar el espacio que quiera y visualizar las horas disponibles',
            scheduleReservationTooltip: 'Se mostrará una tabla con los espacios disponibles para la duración de la reserva seleccionada',
            timeReservationTooltip: 'Selecciona una hora de inicio y una hora de fin para visualizar los espacios disponibles a esas horas',
            
            space: null,
        };
    },
    methods: {
        toSpaceReservation() {
            this.$router.push('/spaceReservation');
        },
        toScheduleReservation() {
            this.$router.push('/scheduleReservation');
        },
        toTimeReservation() {
            this.$router.push('/timeReservation');
        },
    }
};
</script>
