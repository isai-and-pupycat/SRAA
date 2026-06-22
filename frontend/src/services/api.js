import axios from 'axios';

// Crear una instancia de axios apuntando a tu servidor local de Node
const API = axios.create({
  baseURL: 'http://localhost:5000/api', // La URL de tu backend
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