import { defineStore } from "pinia";

export const useReservationStore = defineStore({
    id: "reservation",
    state: () => ({
        reservation: null,
    }),
    getters: {
        getReservation() {
            return this.reservation;
        }
    },
    actions: {
        setReservation(newReservation) {
            this.reservation = newReservation;
        },
        clearReservation() {
            this.reservation = null;
        }
    }
});
