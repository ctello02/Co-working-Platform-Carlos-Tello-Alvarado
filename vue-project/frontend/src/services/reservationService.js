import axiosInstance from '@/plugins/axiosConfig'; // Importamos la configuración de Axios con interceptores

const API_URL = '/reservations';

export const reservationService = {

    getReservations() {
        return axiosInstance.get(`${API_URL}/getReservations`);
    },

    createReservation(formData) {
        return axiosInstance.post(`${API_URL}/createReservation`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    // updateReservation(formData) {
    //     return axiosInstance.put(`${API_URL}/updateReservation`, formData);
    // },

    // deleteReservation(id) {
    //     return axiosInstance.delete(`${API_URL}/deleteReservation/${id}`);
    // },

};

