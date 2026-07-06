import API from './api';

/*
 * Usuarios demo para poder probar los roles mientras el backend no está en línea.
 * Cuando el backend/BD esté activo, estos usuarios deben existir realmente en la
 * tabla `usuarios` y este bloque puede eliminarse.
 */
const USUARIOS_DEMO = [
  {
    correo: 'julio.cen@upb.edu.mx',
    contrasena: 'Coordinador2026',
    usuario: { correo: 'julio.cen@upb.edu.mx', nombre: 'Mtr. Julio Cen', rol: 'coordinador' },
  },
  {
    correo: 'isai.rosas@upb.edu.mx',
    contrasena: 'Docente2026',
    usuario: { correo: 'isai.rosas@upb.edu.mx', nombre: 'Ing. Isai Rosas Canto', rol: 'docente' },
  },
];

// Función para mandar el correo y la contraseña al backend
export const loginUser = async (credentials) => {
  // 1) Intento de acceso demo local (no requiere backend)
  const demo = USUARIOS_DEMO.find(
    (u) => u.correo === credentials.correo && u.contrasena === credentials.contrasena
  );
  if (demo) {
    const data = { message: 'Login exitoso', token: 'demo-token', usuario: demo.usuario };
    localStorage.setItem('token', data.token);
    return data;
  }

  // 2) Acceso real contra el backend
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