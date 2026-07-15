import API from './api';

/*
 * Configuración del sistema (clave/valor). Ej. las firmas institucionales
 * de los documentos (Vo.Bo. y Autoriza de la Ficha Técnica).
 */

export const obtenerConfig = async () => {
  const { data } = await API.get('/config');
  return data;
};

export const guardarConfig = async (cambios) => {
  const { data } = await API.put('/config', cambios);
  return data;
};
