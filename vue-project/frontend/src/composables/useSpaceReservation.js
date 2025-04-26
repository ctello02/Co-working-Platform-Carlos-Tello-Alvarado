import { reactive } from 'vue';
import { useReservationStore } from '@/store/reservationStore';
import { useUserStore } from '@/store/userStore';
import { useTime } from '@/composables/useTime';

/**
 * Composable for space reservation logic:
 * - Tracks reservation times and seats
 * - Calculates available start and end times
 * - Updates reservations and checks availability
 *
 * @param {Ref<Array>} reservationsByDate - reservations for the selected date
 * @param {Ref<Array>} periodicReservations - periodic reservations
 * @param {Ref<Date>} date - selected date
 */
export function useSpaceReservation(
  reservationsByDate,
  periodicReservations,
  date
) {
  const reservationStore = useReservationStore();
  const userStore = useUserStore();
  const { makeMinutes, makeHoursAndMinutes, getHoursAndMinsFromDate } =
    useTime();

  const reservationTimes = reactive({});
  const availableTimes = reactive({});

  /**
   * Update available start times for each space, accounting for "today"
   * @param {Array} spaces
   */
  function updateAvailableTimes(spaces) {
    const today = new Date();
    const nowMinutes = today.getHours() * 60 + today.getMinutes();
    const selDate = new Date(date.value);
    selDate.setHours(0, 0, 0, 0);

    spaces.forEach((space) => {
      const slots = calcStartTimeOfSpace(space);
      if (selDate > today) {
        availableTimes[space._id] = slots;
      } else {
        // Si es el día actual, filtramos y quitamos los intervalos de tiempo que ya han pasado
        availableTimes[space._id] = slots.filter(
          (time) => makeMinutes(time) >= nowMinutes
        );
      }
    });
  }

  /** Calculate all possible reservation start times */
  function calcStartTimeOfSpace(space) {
    return calcFrameTimesOfSpace(
      space,
      space.opening,
      space.closing,
      15,
      space.duration,
      true
    );
  }

  /** Calculate possible end times once a start is selected */
  function calcEndTimeOfSpace(space) {
    const state = reservationTimes[space._id];
    if (state && state.reservationStartTime) {
      const startMin = makeMinutes(state.reservationStartTime);
      return calcFrameTimesOfSpace(
        space,
        startMin + space.duration,
        space.closing,
        space.duration,
        space.duration,
        false
      );
    }
    return [];
  }

  /**
   * Core: slice the day's window into frames, exclude reserved intervals
   */
  function calcFrameTimesOfSpace(
    space,
    start,
    end,
    interval,
    duration,
    needsVerification
  ) {
    let hoursReserved = [];

    // Periodic reservations
    if (periodicReservations.value.length) {
      const periodicEvents = checkPeriodicReservations(space);
      reservationsByDate.value.concat(periodicEvents);
    }

    // One-off reservations
    if (reservationsByDate.value.length) {
      const events = reservationsByDate.value
        .filter((r) => r.spaceId === space._id)
        .flatMap((r) => {
          const s = getHoursAndMinsFromDate(r.startTime);
          const e = getHoursAndMinsFromDate(r.endTime);
          const seats = r.seatsReserved;
          return [
            { time: makeMinutes(s), change: seats, userId: r.userId },
            { time: makeMinutes(e), change: -seats, userId: r.userId },
          ];
        });
      events.sort((a, b) => a.time - b.time);

      let currentSeats = 0;
      let currentTime = events[0] ? events[0].time : start;
      for (const ev of events) {
        if (ev.time !== currentTime) {
          if (currentSeats > 0) {
            hoursReserved.push({
              startMinutes: currentTime,
              endMinutes: ev.time,
              seatsReserved: currentSeats,
            });
          }
          currentTime = ev.time;
        }
        currentSeats += ev.change;
      }

      if (hoursReserved.length)
        reservationStore.setHoursReservedBySpace(space._id, hoursReserved);
    }

    const slots = [];
    for (let t = start; t <= end; t += interval) {
      if (needsVerification && t + duration > end) break;
      const label = makeHoursAndMinutes(t);
      if (hoursReserved.length) {
        const { reserved, isEnd } = isTimeReserved(
          t,
          duration,
          hoursReserved,
          space,
          needsVerification
        );
        if (reserved) continue;
        if (isEnd) {
          slots.push(label);
          break;
        }
      }
      slots.push(label);
    }
    return slots;
  }

  // Helpers for reservations analysis
  function checkPeriodicReservations(space) {
    const sel = new Date(date.value);
    sel.setHours(0, 0, 0, 0);
    const list = periodicReservations.value
      .filter((pr) => pr.spaceId === space._id)
      .filter((pr) => {
        const d = new Date(pr.startTime);
        d.setHours(0, 0, 0, 0);
        if (sel < d) return false;
        if (pr.periodicity === 'weekly') return d.getDay() === sel.getDay();
        if (pr.periodicity === 'monthly') return d.getDate() === sel.getDate();
        return false;
      });

    return list;
  }

  function isTimeReserved(
    time,
    duration,
    hoursReserved,
    space,
    needsVerification
  ) {
    const iv = binarySearchReservation(time, duration, hoursReserved);
    if (!iv) return { reserved: false, isEnd: false };
    // If end-of-slot but not a "block" condition
    if (
      !needsVerification &&
      ((time + duration > iv.startMinutes && iv.seatsReserved >= space.seats) ||
        (time >= iv.startMinutes && iv.seatsReserved >= space.seats))
    ) {
      return { reserved: false, isEnd: true };
    }
    if (
      time + duration >= iv.startMinutes &&
      time + duration < iv.endMinutes &&
      iv.seatsReserved >= space.seats
    ) {
      return { reserved: true, isEnd: false };
    }
    if (time >= iv.startMinutes && iv.seatsReserved >= space.seats) {
      return { reserved: true, isEnd: false };
    }
    return { reserved: false, isEnd: false };
  }

  function binarySearchReservation(time, duration, hoursReserved) {
    let low = 0;
    let high = hoursReserved.length - 1;
    let iv = hoursReserved[0];
    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      if (
        (time >= iv.startMinutes && time < iv.endMinutes) ||
        (time + duration > iv.startMinutes && time + duration < iv.endMinutes)
      ) {
        return iv;
      }
      if (time < iv.startMinutes) high = mid - 1;
      else low = mid + 1;
      iv = hoursReserved[mid];
    }
    return null;
  }

  /** Manage user updates to reservation start/end */
  function updateReservation(space, key, value) {
    if (!reservationTimes[space._id]) {
      reservationTimes[space._id] = {
        reservationStartTime: null,
        reservationEndTime: null,
        seatsLeft: null,
        reservationNotAllowed: false,
      };
    }
    reservationTimes[space._id][key] = value;
    if (key === 'reservationStartTime') {
      reservationTimes[space._id].reservationEndTime = null;
      reservationTimes[space._id].reservationNotAllowed = false;
    }
    if (key === 'reservationEndTime' && value != null) {
      calcSeatsAllowed(space);
      calcReservationAllowed(space);
    }
    if (value == null) {
      reservationTimes[space._id].seatsLeft = null;
      reservationTimes[space._id].reservationNotAllowed = false;
    }
  }

  /** Seats left based on existing reservations */
  function calcSeatsAllowed(space) {
    const reserved = reservationStore.getHoursReservedBySpace(space._id) || [];
    if (!reserved.length) {
      reservationTimes[space._id].seatsLeft = space.seats;
      return;
    }
    const start = makeMinutes(reservationTimes[space._id].reservationStartTime);
    const end = makeMinutes(reservationTimes[space._id].reservationEndTime);
    let maxRes = 0;
    reserved.forEach((r) => {
      if (
        (start < r.startMinutes && end <= r.startMinutes) ||
        (start >= r.endMinutes && end > r.endMinutes)
      )
        return;
      if (r.seatsReserved > maxRes) maxRes = r.seatsReserved;
    });
    reservationTimes[space._id].seatsLeft = space.seats - maxRes;
  }

  /** Check if user already has a conflicting reservation */
  function calcReservationAllowed(space) {
    const reserved = reservationStore.getHoursReservedBySpace(space._id);
    if (!reserved) {
      reservationTimes[space._id].reservationNotAllowed = false;
      return;
    }
    // collect user's events
    const oneOff = reservationsByDate.value.filter(
      (r) => r.spaceId === space._id && r.userId === userStore.getId
    );
    const periodic = periodicReservations.value.filter((r) => {
      if (r.spaceId !== space._id || r.userId !== userStore.getId) return false;
      const d = new Date(r.startTime);
      const sel = new Date(date.value);
      sel.setHours(0, 0, 0, 0);
      d.setHours(0, 0, 0, 0);
      if (sel < d) return false;
      if (r.periodicity === 'weekly') return d.getDay() === sel.getDay();
      if (r.periodicity === 'monthly') return d.getDate() === sel.getDate();
      return r.periodicity === 'daily';
    });
    const events = [...oneOff, ...periodic];
    if (!events.length) {
      reservationTimes[space._id].reservationNotAllowed = false;
      return;
    }
    const start = makeMinutes(reservationTimes[space._id].reservationStartTime);
    const end = makeMinutes(reservationTimes[space._id].reservationEndTime);
    for (const ev of events) {
      const evStart = makeMinutes(getHoursAndMinsFromDate(ev.startTime));
      const evEnd = makeMinutes(getHoursAndMinsFromDate(ev.endTime));
      if (
        !(
          (start < evStart && end <= evStart) ||
          (start >= evEnd && end > evEnd)
        )
      ) {
        reservationTimes[space._id].reservationNotAllowed = true;
        reservationTimes[space._id].seatsLeft = null;
        return;
      }
    }
    reservationTimes[space._id].reservationNotAllowed = false;
  }

  return {
    reservationTimes,
    availableTimes,
    updateAvailableTimes,
    calcStartTimeOfSpace,
    calcEndTimeOfSpace,
    updateReservation,
    calcSeatsAllowed,
    calcReservationAllowed,
  };
}
