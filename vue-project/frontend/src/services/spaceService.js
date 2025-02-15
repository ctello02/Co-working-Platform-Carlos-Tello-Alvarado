import axiosInstance from '@/plugins/axiosConfig'; // Importamos la configuración de Axios con interceptores

const API_URL = '/spaces';

export const spaceService = {

    getSpaces() {
        return axiosInstance.get(`${API_URL}/getSpaces`);
    },

    createSpace(formData) {
        return axiosInstance.post(`${API_URL}/createSpace`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
    },

    updateSpace(formData) {
        return axiosInstance.put(`${API_URL}/updateSpace`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    deleteSpace(id) {
        return axiosInstance.delete(`${API_URL}/deleteSpace/${id}`);
    },

};