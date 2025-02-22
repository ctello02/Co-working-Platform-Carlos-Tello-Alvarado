import { defineStore } from "pinia";

export const useReservationStore = defineStore({
    id: "reservation",
    state: () => ({
        reservation: null,
        hoursReservedBySpace: {},
    }),
    getters: {
        getReservation: (state) => state.reservation,
        getHoursReservedBySpace: (state) => (spaceId) => state.hoursReservedBySpace[spaceId],
    },
    actions: {
        setReservation(newReservation) {
            this.reservation = newReservation;
        },
        setHoursReservedBySpace(spaceId, hours) {
            this.hoursReservedBySpace[spaceId] = hours;
        },
        clearReservation() {
            this.reservation = null;
        }
    }
});