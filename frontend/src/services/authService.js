import API from './api';

// Función para mandar el correo y la contraseña al backend
export const loginUser = async (credentials) => {
  try {
    const response = await API.post('/auth/login', credentials);
    
    // Si el login es exitoso, guardamos el token JWT para mantener la sesión activa
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    
    return response.data;
  } catch (error) {
    // Si el backend responde con error (404, 400, etc.), lo mandamos al componente
    throw error.response ? error.response.data : { message: 'Error de conexión' };
  }
};

// Función para registrar un nuevo docente/usuario
export const registerUser = async (userData) => {
  try {
    const response = await API.post('/auth/registrar', userData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : { message: 'Error de conexión' };
  }
};