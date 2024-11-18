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
                    <CreateReservationCard 
                        :tooltipText="spaceReservationTooltip" 
                        title="Reserva de espacio" 
                        :imageSrc="spaceReservationImage" 
                        :action="toSpaceReservation" 
                        classStyle='mr-4 mt-2'
                    />
                </v-col>
                <v-col>
                    <CreateReservationCard 
                        :tooltipText="scheduleReservationTooltip" 
                        title="Reserva por horario" 
                        :imageSrc="scheduleReservationImage" 
                        :action="toScheduleReservation" 
                        classStyle="mt-2" 
                    />
                </v-col>
                <v-col>
                    <CreateReservationCard 
                        :tooltipText="timeReservationTooltip" 
                        title="Reserva de horas" 
                        :imageSrc="timeReservationImage" 
                        :action="toTimeReservation" 
                        classStyle="mt-2" 
                    />
                </v-col>
            </v-row>
        </v-col>
    </v-container>
</template>

<script>
import CreateReservationCard from '@/components/CreateReservationCard.vue';

export default {
    data() {
        return {
            spaceReservationTooltip: 'Podrá seleccionar el espacio que quiera y visualizar las horas disponibles',
            scheduleReservationTooltip: 'Se mostrará una tabla con los espacios disponibles para la duración de la reserva seleccionada',
            timeReservationTooltip: 'Selecciona una hora de inicio y una hora de fin para visualizar los espacios disponibles a esas horas',
            
            spaceReservationImage: '/images/spaceReservation.png',
            scheduleReservationImage: '/images/scheduleReservation.png',
            timeReservationImage: '/images/timeReservation.png',
        };
    },
    components: {
        CreateReservationCard
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
