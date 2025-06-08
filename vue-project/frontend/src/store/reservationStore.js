import { defineStore } from 'pinia';

export const useReservationStore = defineStore({
  id: 'reservation',
  state: () => ({
    reservation: null,
    hoursReservedBySpace: {},
    calendarDate: null,
    window: null,
  }),
  getters: {
    getReservation: (state) => state.reservation,
    getHoursReservedBySpace: (state) => (spaceId) =>
      state.hoursReservedBySpace[spaceId],
    getCalendarDate: (state) => state.calendarDate,
    getWindow: (state) => state.window,
  },
  actions: {
    setReservation(newReservation) {
      this.reservation = newReservation;
    },
    setHoursReservedBySpace(spaceId, hours) {
      this.hoursReservedBySpace[spaceId] = hours;
    },
    setCalendarDate(calendarDate) {
      this.calendarDate = calendarDate;
    },
    setWindow(window) {
      this.window = window;
    },
    clearCalendarDate() {
      this.calendarDate = null;
    },
    clearStore() {
      this.reservation = null;
      this.hoursReservedBySpace = {};
      this.calendarDate = null;
      // No ponemos window en null, porque se pierden los parámetros de la ventana Reservations
    },
  },
});
