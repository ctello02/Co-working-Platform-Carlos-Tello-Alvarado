import { defineStore } from 'pinia';

export const useReservationStore = defineStore({
  id: 'reservation',
  state: () => ({
    reservation: null,
    hoursReservedBySpace: {},
    calendarDate: null,
  }),
  getters: {
    getReservation: (state) => state.reservation,
    getHoursReservedBySpace: (state) => (spaceId) =>
      state.hoursReservedBySpace[spaceId],
    getCalendarDate: (state) => state.calendarDate,
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
    clearStore() {
      this.reservation = null;
      this.hoursReservedBySpace = {};
      this.calendarDate = null;
    },
  },
});
