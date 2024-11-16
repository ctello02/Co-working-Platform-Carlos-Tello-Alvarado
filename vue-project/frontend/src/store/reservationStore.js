import { defineStore } from "pinia";

export const useReservationStore = defineStore({
    id: "reservation",
    state: () => ({
        _id: localStorage.getItem("reservation_id") || null,
        selectedReservation: null, // Estado para el espacio seleccionado
        selectedReservedSpace: null,
    }),
    getters: {
        getId() {
            return this._id;
        },
        getSelectedReservation() {
            return this.selectedReservation;
        },
        getSelectedReservedSpace() {
            return this.selectedReservedSpace;
        },
    },
    actions: {
        setId(id) {
            this._id = id;
            localStorage.setItem('reservation_id', id); // Sincronizar con localStorage
        },
        setSelectedReservation(reservation) {
            this.selectedReservation = reservation;
        },
        setSelectedReservedSpace(space) {
            this.selectedReservedSpace = space;
        },
        clearSelectedReservation() {
            this.selectedReservation = null;
        },
        clearSelectedReservedSpace() {
            this.selectedReservedSpace = null;
        },
        clearReservation() {
            this.selectedReservation = null;
            this.selectedReservedSpace = null;
            localStorage.clear();
        },
    },
});
