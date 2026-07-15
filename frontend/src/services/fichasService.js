import API from './api';

/*
 * Servicio de Fichas (eventos / actividades académicas).
 * Habla con el backend Express en http://localhost:5000/api/fichas.
 * El docente crea las fichas y el coordinador las valida/rechaza;
 * ambos flujos leen y escriben en la misma base de datos PostgreSQL.
 */

// Obtener todas las fichas guardadas en la base de datos.
export const obtenerFichas = async () => {
  const { data } = await API.get('/fichas');
  return data;
};

// Crear una ficha nueva. `payload` lleva folio, nombre, carrera,
// cuatrimestre, docente, fecha, hora, tecnica y programa.
export const crearFicha = async (payload) => {
  const { data } = await API.post('/fichas', payload);
  return data; // la ficha creada (con id y creado_en de la BD)
};

// Validar una ficha (marca la Etapa 1 como 'validado').
export const validarFichaApi = async (id) => {
  const { data } = await API.patch(`/fichas/${id}/validar`);
  return data;
};

// Actualizar una ficha (edición de la Ficha Técnica por el coordinador).
export const actualizarFichaApi = async (id, payload) => {
  const { data } = await API.put(`/fichas/${id}`, payload);
  return data;
};

// Guardar el Informe de Actividades (Etapa 3). `datos` lleva
// descripcion, logro, responsables, beneficiarios, lugar y fotos.
export const guardarInformeApi = async (id, datos) => {
  const { data } = await API.put(`/fichas/${id}/informe`, datos);
  return data; // la ficha actualizada con etapa3 finalizada
};

// Eliminar / rechazar una ficha.
export const eliminarFichaApi = async (id) => {
  const { data } = await API.delete(`/fichas/${id}`);
  return data;
};
