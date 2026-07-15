import API from './api';

/*
 * Servicio de Constancias / Reconocimientos.
 * El coordinador las emite en "Crear Constancia" y cada docente las ve en
 * "Mis Constancias". Todo se guarda en el backend (tabla `constancias`).
 */

// Listar constancias. Filtros opcionales: { destinatario_id } o { destinatario }.
export const obtenerConstancias = async (filtros = {}) => {
  const { data } = await API.get('/constancias', { params: filtros });
  return data;
};

// Crear una constancia (una por docente destinatario).
export const crearConstancia = async (datos) => {
  const { data } = await API.post('/constancias', datos);
  return data;
};

export const actualizarConstancia = async (id, datos) => {
  const { data } = await API.put(`/constancias/${id}`, datos);
  return data;
};

export const eliminarConstancia = async (id) => {
  const { data } = await API.delete(`/constancias/${id}`);
  return data;
};

/*
 * Adaptador para el componente genérico CrudAdmin (Mis Constancias del
 * coordinador): expone obtener/crear/actualizar/eliminar como espera.
 */
export const SERVICIO_CONSTANCIAS = {
  obtener: () => obtenerConstancias(),
  crear: (d) => crearConstancia(d),
  actualizar: (id, d) => actualizarConstancia(id, d),
  eliminar: (id) => eliminarConstancia(id),
};
