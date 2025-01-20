import axiosInstance from '@/plugins/axiosConfig'; // Importamos la configuración de Axios con interceptores

const API_URL = '/auth';

export const authService = {

    signUp(name, email, password, phone, address, isCompany, cif) {
        return axiosInstance.post(`${API_URL}/signup`, { name, email, password, phone, address, isCompany, cif });
    },

    login(email, password) {
        return axiosInstance.post(`${API_URL}/login`, { email, password });
    },

    getUser() {
        return axiosInstance.get(`${API_URL}/user`);
    },

    forgotPassword(email) {
        return axiosInstance.post(`${API_URL}/forgotPassword`, { email });
    },

    resetPassword(password, token) {
        return axiosInstance.post(`${API_URL}/resetPassword`, { password, token });
    },

    changePassword(oldPassword, newPassword, id) {
        return axiosInstance.post(`${API_URL}/changePassword/${id}`, { oldPassword, newPassword });
    },

};