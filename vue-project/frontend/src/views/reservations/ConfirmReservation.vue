<template>
    <v-container fluid>
  <v-row>
    <h1>Reservation created successfully!</h1>
  </v-row>

  <v-row v-if="!this.reservation">
    <v-col>
        <v-row>
            <span class="text-h4">{{this.reservation.spaceId}}</span>
        </v-row>
        <v-row>
            <span class="text-h5">{{this.reservation.userId}}</span>
        </v-row>
        <v-row>
            <span class="text-h5">{{this.reservation.startTime}}</span>
        </v-row>
        <v-row>
            <span class="text-h5">{{this.reservation.endTime}}</span>
        </v-row>
    </v-col>
  </v-row>
</v-container>

</template>

<script>
import { useReservationStore } from '@/store/reservationStore';

export default{
    data() {
        return {
            reservationStore: null,
            reservation: [],
        }
    },
    mounted() {
        this.reservationStore = useReservationStore();
        this.reservation = this.reservationStore.getReservation;

        console.log(this.reservation);
        
    },
}
</script>