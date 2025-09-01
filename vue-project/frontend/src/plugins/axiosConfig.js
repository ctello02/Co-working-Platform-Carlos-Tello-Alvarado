import axios from 'axios';
import { useUserStore } from '@/store/userStore';

const BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/+$/, '');
const baseURL = `${BASE || ''}/api`; // => '/api' en dev; 'https://...' + '/api' en prod

// Crea una instancia de axios
const axiosInstance = axios.create({
  baseURL,
  timeout: 10000,
});

// Interceptor para las peticiones
axiosInstance.interceptors.request.use(
  (config) => {
    const token = useUserStore().getToken;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      config.headers['x-access-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para las respuestas
axiosInstance.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.log('Token inválido/expirado. Redirigiendo a login…');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
