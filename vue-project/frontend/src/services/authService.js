import axiosInstance from '@/plugins/axiosConfig'; // Importamos la configuración de Axios con interceptores

const API_URL = '/auth';

export const authService = {

    signUp(name, email, password, phone, address, isCompany, cif) {
        return axiosInstance.post(`${API_URL}/signup`, { name, email, password, phone, address, isCompany, cif }, { requiresToken: false });
    },

    login(email, password) {
        return axiosInstance.post(`${API_URL}/login`, { email, password }, { requiresToken: false });
    },

    getUser() {
        return axiosInstance.get(`${API_URL}/user`, { requiresToken: true });
    },

    forgotPassword(email) {
        return axiosInstance.post(`${API_URL}/forgotPassword`, { email }, { requiresToken: false });
    },

    updatePassword(password, token) {
        return axiosInstance.post(`${API_URL}/updatePassword`, { password, token }, { requiresToken: false });
    },

};