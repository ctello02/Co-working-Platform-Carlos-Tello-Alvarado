import axiosInstance from '@/plugins/axiosConfig'; // Importamos la configuración de Axios con interceptores

const API_URL = '/stats';

export const statService = {
  getRangeCharts(params) {
    return axiosInstance.get(`${API_URL}/rangeCharts`, params);
  },

  getOneShotCharts(params) {
    return axiosInstance.get(`${API_URL}/oneShotCharts`, params);
  },
};
