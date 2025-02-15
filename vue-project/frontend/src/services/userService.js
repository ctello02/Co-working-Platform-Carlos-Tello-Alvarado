import axiosInstance from '@/plugins/axiosConfig'; // Importamos la configuración de Axios con interceptores

const API_URL = '/users';

export const userService = {

    getUsers() {
        return axiosInstance.get(`${API_URL}/getUsers`);
    },

    updateUser(user) {
        return axiosInstance.put(`${API_URL}/updateUser`, user);
    },

    deleteUser(id) {
        return axiosInstance.delete(`${API_URL}/deleteUser/${id}`);
    },

};