import axiosInstance from '@/plugins/axiosConfig'; // Importamos la configuración de Axios con interceptores

const API_URL = '/auth';

export const authService = {
  signUp(formData) {
    return axiosInstance.post(`${API_URL}/signUp`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  login(email, password) {
    return axiosInstance.post(`${API_URL}/login`, { email, password });
  },

  getUser() {
    return axiosInstance.get(`${API_URL}/user`);
  },

  forgotPassword(email) {
    return axiosInstance.post(`${API_URL}/forgotPassword`, email);
  },

  resetPassword(password, token) {
    return axiosInstance.post(`${API_URL}/resetPassword`, { password, token });
  },

  changePassword(oldPassword, newPassword, id) {
    return axiosInstance.post(`${API_URL}/changePassword/${id}`, {
      oldPassword,
      newPassword,
    });
  },
};
