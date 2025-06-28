import axiosInstance from '@/plugins/axiosConfig'; // Importamos la configuración de Axios con interceptores

const API_URL = '/reservations';

export const reservationService = {
  createReservation(formData) {
    return axiosInstance.post(`${API_URL}/createReservation`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  createPeriodicReservation(formData) {
    return axiosInstance.post(
      `${API_URL}/createPeriodicReservation`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  },

  getPeriodicReservations() {
    return axiosInstance.get(`${API_URL}/getPeriodicReservations`);
  },

  getUserReservations(id) {
    return axiosInstance.get(`${API_URL}/getUserReservations/${id}`);
  },

  getReservationsByDate(date) {
    return axiosInstance.get(`${API_URL}/getReservationsByDate/${date}`);
  },

  updateReservation(reservation) {
    return axiosInstance.put(`${API_URL}/updateReservation`, reservation);
  },

  updatePeriodicReservation(periodicReservation) {
    return axiosInstance.put(
      `${API_URL}/updatePeriodicReservation`,
      periodicReservation
    );
  },

  deleteReservation(id) {
    return axiosInstance.delete(`${API_URL}/deleteReservation/${id}`);
  },

  deletePeriodicReservation(id) {
    return axiosInstance.delete(`${API_URL}/deletePeriodicReservation/${id}`);
  },
};
