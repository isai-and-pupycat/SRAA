import API from './api';

/*
 * Servicio de Catálogos (módulos de Administración): Ciclos, Carreras,
 * Asignaturas, Cuatrimestres, Usuarios. Todos comparten los mismos
 * endpoints genéricos, distinguidos por `tipo`.
 */

export const obtenerCatalogo = async (tipo) => {
  const { data } = await API.get(`/catalogos/${tipo}`);
  return data;
};

export const crearItem = async (tipo, datos) => {
  const { data } = await API.post(`/catalogos/${tipo}`, datos);
  return data;
};

export const actualizarItem = async (tipo, id, datos) => {
  const { data } = await API.put(`/catalogos/${tipo}/${id}`, datos);
  return data;
};

export const eliminarItem = async (tipo, id) => {
  const { data } = await API.delete(`/catalogos/${tipo}/${id}`);
  return data;
};
