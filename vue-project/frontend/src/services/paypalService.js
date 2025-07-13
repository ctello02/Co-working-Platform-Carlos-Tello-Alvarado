import axiosInstance from '@/plugins/axiosConfig'; // Importamos la configuración de Axios con interceptores

const API_URL = '/paypal';

export const paypalService = {
  createOrder(reservationId, total) {
    return axiosInstance.post(`${API_URL}/createOrder/`, {
      total,
      reservationId,
    });
  },

  captureOrder(orderID, reservationId) {
    return axiosInstance.post(`${API_URL}/captureOrder/`, {
      orderID,
      reservationId,
    });
  },

  refundPayment(reservationId) {
    return axiosInstance.post(`${API_URL}/refundPayment/${reservationId}`);
  },
};
