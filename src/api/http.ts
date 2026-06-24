import axios from 'axios';
import router from '../router';

export const http = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000',
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('jwt');
      router.push('/login');
    }
    return Promise.reject(error);
  }
);
