import axiosInstance from '@/plugins/axiosConfig'; // Importamos la configuración de Axios con interceptores

const API_URL = '/spaces';

export const spaceService = {

    getSpaces() {
        return axiosInstance.get(`${API_URL}/getSpaces`, { requiresToken: true });
    },

    createSpace(formData) {
        return axiosInstance.post(`${API_URL}/createSpace`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            requiresToken: true
        });
    },

};