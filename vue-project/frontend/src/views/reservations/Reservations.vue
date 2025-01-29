<template>
    <v-container fluid>
        <v-card class="pa-2 mt-4">
            <v-list v-if="reservations.length > 0">
              <v-list-item
                @click="infoEvent(reservation)"
                v-for="reservation in reservations"
                :key="reservation._id"
              >
                <v-list-item-content>
                  <v-list-item-title>
                    <p>Reserva de espacio</p>
                  </v-list-item-title>

                  <v-list-item-subtitle>
                    {{ reservation.start }} - {{ reservation.end }}
                  </v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>
            <span class="ml-4" v-else type="info">No hay reservas para mostrar</span>
            <v-card-actions class="d-flex justify-center">
                <TonalButton
                    color="blue"
                    text="Añadir reserva"
                    @click="this.$router.push('/createReservation')"
                />
            </v-card-actions>
        </v-card>
    </v-container>
</template>

<script>
import TonalButton from '@/components/TonalButton.vue';

export default {
    components: {
        TonalButton
    },
    data() {
        return {
            reservations: [],
        }
    },
    mounted() {
        this.getAllEvents();
    },
    methods: {
        getAllEvents() {
            this.reservations = [];
        },
        infoEvent(reservation) {
            console.log(reservation);
        }
    }
}
</script>