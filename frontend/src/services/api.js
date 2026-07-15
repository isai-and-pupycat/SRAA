import axios from 'axios';

// URL del backend:
//  - En producción (nube) se define VITE_API_URL al compilar (ej. https://tu-backend.up.railway.app/api).
//  - En local, si no está definida, usa el servidor local de Node.
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Middleware automático: Si hay un token guardado en el navegador, lo mete en las cabeceras de cada petición
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;