// src/composables/useTime.js

export function useTime() {
  /** Genera una variable con todas las duraciones
   * posibles que se permite buscar en un espacio
   */
  const timeFrames = [
    { label: "15 mins", value: 15 },
    { label: "30 mins", value: 30 },
    { label: "1 hora", value: 60 },
    { label: "2 horas", value: 120 },
    { label: "3 horas", value: 180 },
  ];

  /**
   * Genera un array con todos los horarios en formato "HH:MM"
   * en intervalos de 15 minutos para un día completo.
   */
  const generateAllTimes = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const formattedTime = `${String(hour).padStart(2, "0")}:${String(
          minute
        ).padStart(2, "0")}`;
        times.push(formattedTime);
      }
    }
    return times;
  };

  /**
   * Convierte una hora en formato "HH:MM" a minutos totales.
   */
  const makeMinutes = (time) => {
    const [hour, minutes] = time.split(":").map(Number);
    return hour * 60 + minutes;
  };

  /**
   * Convierte un total de minutos a un string en formato "HH:MM".
   */
  const makeHoursAndMinutes = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
  };

  /**
   * Obtiene la hora y los minutos de una fecha (usando UTC) en formato "HH:MM".
   */
  const getHoursAndMinsFromDate = (date) => {
    const dateObj = new Date(date);
    const hours = String(dateObj.getUTCHours()).padStart(2, "0");
    const mins = String(dateObj.getUTCMinutes()).padStart(2, "0");
    return `${hours}:${mins}`;
  };

  /**
   * Parsea una fecha y la formatea a un string legible en español.
   * Ejemplo: "jueves, 30 de enero de 2025"
   */
  const parseToStringDate = (date) => {
    return new Intl.DateTimeFormat("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  /**
   * Convierte una fecha en formato de string en español (ejemplo: "jueves, 30 de enero")
   * al formato "YYYY-MM-DD". Se utiliza el año actual.
   */
  const parseToYYYYMMDD = (dateStr) => {
    // Mapeo de meses en español a números
    const months = {
      enero: "01",
      febrero: "02",
      marzo: "03",
      abril: "04",
      mayo: "05",
      junio: "06",
      julio: "07",
      agosto: "08",
      septiembre: "09",
      octubre: "10",
      noviembre: "11",
      diciembre: "12",
    };

    // Se asume que el formato es "weekday, day de month"
    const parts = dateStr.split(",")[1].trim().split(" ");
    const day = parts[0].padStart(2, "0");
    const month = months[parts[2].toLowerCase()];
    const year = new Date().getFullYear();

    return `${year}-${month}-${day}`;
  };

  const twoDigitsDate = (date) => {
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  return {
    timeFrames,
    generateAllTimes,
    makeMinutes,
    makeHoursAndMinutes,
    getHoursAndMinsFromDate,
    parseToStringDate,
    parseToYYYYMMDD,
    twoDigitsDate,
  };
}
