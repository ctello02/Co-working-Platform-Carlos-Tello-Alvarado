import { defineStore } from 'pinia';

export const useReservationStore = defineStore({
  id: 'reservation',
  state: () => ({
    reservation: null,
    calendarDate: null,
    windowParams: null,
  }),
  getters: {
    getReservation: (state) => state.reservation,
    getCalendarDate: (state) => state.calendarDate,
    getWindowParams: (state) => state.windowParams,
  },
  actions: {
    setReservation(newReservation) {
      this.reservation = newReservation;
    },
    setCalendarDate(calendarDate) {
      this.calendarDate = calendarDate;
    },
    setWindowParams(window) {
      this.windowParams = window;
    },
    clearCalendarDate() {
      this.calendarDate = null;
    },
    clearStore() {
      this.reservation = null;
      this.calendarDate = null;
      // No ponemos windowParams en null, porque se pierden los parámetros de la ventana Reservations
    },
  },
});
