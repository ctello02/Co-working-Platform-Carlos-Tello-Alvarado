import axiosInstance from '@/plugins/axiosConfig'; // Importamos la configuración de Axios con interceptores

const API_URL = '/materials';

export const materialService = {
  getMaterials() {
    return axiosInstance.get(`${API_URL}/getMaterials`);
  },

  createMaterial(formData) {
    return axiosInstance.post(`${API_URL}/createMaterial`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  updateMaterial(formData) {
    return axiosInstance.put(`${API_URL}/updateMaterial`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  deleteMaterial(id) {
    return axiosInstance.delete(`${API_URL}/deleteMaterial/${id}`);
  },

  bulkDeleteMaterial(id) {
    return axiosInstance.delete(`${API_URL}/bulkDeleteMaterial/${id}`);
  },
};
