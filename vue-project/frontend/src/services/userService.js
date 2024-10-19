import axiosInstance from '@/plugins/axiosConfig'; // Importamos la configuración de Axios con interceptores

const API_URL = '/users';

export const userService = {

    getUsers() {
        return axiosInstance.get(`${API_URL}/getUsers`, { requiresToken: true });
    },

    updateUser(user) {
        return axiosInstance.put(`${API_URL}/updateUser`, user, { requiresToken: true });
    },

    deleteUser(id) {
        return axiosInstance.delete(`${API_URL}/deleteUser/${id}`, { requiresToken: true });
    },

};