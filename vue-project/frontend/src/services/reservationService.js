import axiosInstance from '@/plugins/axiosConfig'; // Importamos la configuración de Axios con interceptores

const API_URL = '/reservations';
const PAYPAL_URL = '/paypal';

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

  getUserReservations(id) {
    return axiosInstance.get(`${API_URL}/getUserReservations/${id}`);
  },

  getPeriodicReservations() {
    return axiosInstance.get(`${API_URL}/getPeriodicReservations`);
  },

  getTodayReservations() {
    return axiosInstance.get(`${API_URL}/getTodayReservations`);
  },

  getReservationsByDate(date) {
    return axiosInstance.get(`${API_URL}/getReservationsByDate/${date}`);
  },

  getUserByReservationId(id) {
    return axiosInstance.get(`${API_URL}/getUserByReservationId/${id}`);
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

  createOrder(reservationId, total) {
    return axiosInstance.post(`${PAYPAL_URL}/createOrder/`, {
      total,
      reservationId,
    });
  },

  captureOrder(orderID, reservationId) {
    return axiosInstance.post(`${PAYPAL_URL}/captureOrder/`, {
      orderID,
      reservationId,
    });
  },

  markAsPaid(reservationId) {
    return axiosInstance.put(`${API_URL}/markAsPaid/${reservationId}`);
  },
};
