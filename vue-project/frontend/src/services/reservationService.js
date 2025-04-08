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

  getReservations() {
    return axiosInstance.get(`${API_URL}/getReservations`);
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

  // updateReservation(formData) {
  //     return axiosInstance.put(`${API_URL}/updateReservation`, formData);
  // },

  // deleteReservation(id) {
  //     return axiosInstance.delete(`${API_URL}/deleteReservation/${id}`);
  // },
};
