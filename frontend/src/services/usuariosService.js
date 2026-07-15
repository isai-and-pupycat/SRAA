import API from './api';

/*
 * Servicio de Usuarios (cuentas del sistema). Los profesores son usuarios
 * con rol 'docente'. Comparte la tabla `usuarios` con el login real.
 */

// Listar usuarios. Opcional: filtrar por rol ('docente', 'coordinador', ...).
export const obtenerUsuarios = async (rol) => {
  const { data } = await API.get('/usuarios', { params: rol ? { rol } : {} });
  return data;
};

export const crearUsuario = async (datos) => {
  const { data } = await API.post('/usuarios', datos);
  return data;
};

export const actualizarUsuario = async (id, datos) => {
  const { data } = await API.put(`/usuarios/${id}`, datos);
  return data;
};

export const cambiarEstatusUsuario = async (id, estatus) => {
  const { data } = await API.patch(`/usuarios/${id}/estatus`, { estatus });
  return data;
};

export const eliminarUsuario = async (id) => {
  const { data } = await API.delete(`/usuarios/${id}`);
  return data;
};
