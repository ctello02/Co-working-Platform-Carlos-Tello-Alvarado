// src/composables/useTime.js

export function useTime() {
  /** Genera una variable con todas las duraciones
   * posibles que se permite buscar en un espacio
   */
  const timeFrames = [
    { label: '15 mins', value: 15 },
    { label: '30 mins', value: 30 },
    { label: '1 hora', value: 60 },
    { label: '2 horas', value: 120 },
    { label: '3 horas', value: 180 },
  ];

  /**
   * Función para normalizar y verificar si ocurre un evento en una fecha
   */
  function occursOn(pr, date) {
    const s = new Date(pr.startTime);

    if (date < s) return false;

    switch (pr.periodicity) {
      case 'daily':
        return true;
      case 'weekly':
        return date.getDay() === s.getDay();
      case 'monthly':
        return date.getDate() === s.getDate();
      default:
        return false;
    }
  }

  /**
   * Genera un array con todos los horarios en formato "HH:MM"
   * en intervalos de 15 minutos para un día completo.
   */
  const generateAllTimes = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const formattedTime = `${String(hour).padStart(2, '0')}:${String(
          minute
        ).padStart(2, '0')}`;
        times.push(formattedTime);
      }
    }
    return times;
  };

  /**
   * Convierte una hora en formato "HH:MM" a minutos totales.
   */
  const makeMinutes = (time) => {
    const [hour, minutes] = time.split(':').map(Number);
    return hour * 60 + minutes;
  };

  /**
   * Convierte un total de minutos a un string en formato "HH:MM".
   */
  const makeHoursAndMinutes = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  };

  /**
   * Devuelve los minutos totales de una fecha de tipo ISO.
   */
  function makeMinutesFromIsoLocal(isoString) {
    // isoString === "2025-04-27T09:00:00.000Z"
    const timePart = isoString.split('T')[1]; // "09:00:00.000Z"
    const [hh, mm] = timePart.split(':'); // ["09","00","00.000Z"]
    return Number(hh) * 60 + Number(mm);
  }

  /**
   * Obtiene la hora y los minutos de una fecha (usando UTC) en formato "HH:MM".
   */
  const getHoursAndMinsFromDate = (dateString) => {
    const date = parseDateTo_YYYYMMDD_HHMM(dateString);

    const [datePart, hourPart] = date.split(' ');

    // Se envía con el formato "HH:mm"
    return hourPart;
  };

  /**
   * Parsea una fecha y la formatea a un string legible en español.
   * Ejemplo: "jueves, 30 de enero de 2025"
   */
  const parseToStringDate = (date) => {
    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(date));
  };

  /**
   * Convierte una fecha en formato de string en español (ejemplo: "jueves, 30 de enero")
   * al formato "YYYY-MM-DD". Se utiliza el año actual.
   */
  const parseToYYYYMMDD = (dateStr) => {
    // Mapeo de meses en español a números
    const months = {
      enero: '01',
      febrero: '02',
      marzo: '03',
      abril: '04',
      mayo: '05',
      junio: '06',
      julio: '07',
      agosto: '08',
      septiembre: '09',
      octubre: '10',
      noviembre: '11',
      diciembre: '12',
    };

    // Se asume que el formato es "día, número de mes de año"
    const parts = dateStr.split(',')[1].trim().split(' ');
    const day = parts[0].padStart(2, '0');
    const month = months[parts[2].toLowerCase()];
    const year = parts[parts.length - 1];

    return `${year}-${month}-${day}`;
  };

  /**
   * Convierte una fecha en formato de string para el calendario de ScheduleX
   * al formato "YYYY-MM-DD HH:mm". Se utiliza el año actual.
   */
  function parseDateTo_YYYYMMDD_HHMM(dateString) {
    // Partir la fecha manualmente
    const [datePart, timePart] = dateString.split('T');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes] = timePart.split(':').map(Number);

    // Crear la fecha en horario local (ignora offset UTC)
    const date = new Date(year, month - 1, day, hours, minutes);

    // Formatear
    const y = date.getFullYear();
    const M = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');

    // Se envía con el formato "YYYY-MM-DD HH:mm"
    return `${y}-${M}-${d} ${h}:${m}`;
  }

  /**
   * Convierte una fecha en formato de string para mostrarse en la vista preliminar de las reservas
   * al formato "DD/MM/YYYY".
   */
  const twoDigitsDate = (date) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };

  /**
   * Comprueba si el evento o la fecha pasada es anterior al día actual
   * y devuelve true (si es una fecha pasada) o false (si es un evento futuro).
   */
  function calcPastEvents(calendarEvent) {
    const today = new Date();
    let selectedDate;

    selectedDate = new Date(calendarEvent.end || calendarEvent);

    if (selectedDate < today) {
      return true;
    }
    return false;
  }

  /**
   * Comprueba si el evento o la fecha pasada es igual al día actual
   * y devuelve true si lo es o false en caso contrario.
   */
  function isToday(date) {
    const today = new Date();
    date = new Date(date);

    if (
      date.getDate() == today.getDate() &&
      date.getMonth() == today.getMonth() &&
      date.getFullYear() == today.getFullYear()
    )
      return true;
    else {
      return false;
    }
  }

  /**
   * Comprueba si estamos dentro de las 24 horas anteriores al inicio del evento que pasamos por parámetro
   * y devuelve true si es < 24 horas o devuelve false en caso contrario.
   */
  function isWithinNext24Hours(calendarEvent) {
    const now = new Date();
    // extraemos el inicio del evento
    const start = new Date(calendarEvent.start || calendarEvent);
    const diffMs = start - now;
    const oneDayMs = 24 * 60 * 60 * 1000;
    return diffMs > 0 && diffMs <= oneDayMs;
  }

  /**
   * Comprueba si la fecha pasada es igual o posterior al día actual
   * y devuelve true si es < al día actual o devuelve false en caso contrario.
   */
  function calcPastDates(date) {
    const today = new Date();

    if (
      date.getDate() == today.getDate() &&
      date.getMonth() == today.getMonth() &&
      date.getFullYear() == today.getFullYear()
    )
      return false;
    else if (date < today) {
      return true;
    }
    return false;
  }

  return {
    timeFrames,
    occursOn,
    generateAllTimes,
    makeMinutes,
    makeHoursAndMinutes,
    makeMinutesFromIsoLocal,
    getHoursAndMinsFromDate,
    parseToStringDate,
    parseToYYYYMMDD,
    parseDateTo_YYYYMMDD_HHMM,
    twoDigitsDate,
    calcPastEvents,
    isToday,
    isWithinNext24Hours,
    calcPastDates,
  };
}
