import axios from 'axios';
import { useUserStore } from '@/store/userStore';

// Crear una instancia de axios
const axiosInstance = axios.create({
    baseURL: 'http://localhost:3000/api' // URL base del backend
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
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            console.log("Token ha expirado. Redirigiendo al login...");
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
