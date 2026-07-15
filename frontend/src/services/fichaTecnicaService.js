import API from './api';

/*
 * Servicio del folio correlativo (UPB-CING-2026-1-001).
 * El número del ciclo lo toma el backend del cuatrimestre marcado como "Activo".
 */

// Vista previa del próximo folio (no lo gasta). Para mostrarlo en la Etapa 1.
export const obtenerSiguienteFolio = async () => {
  const { data } = await API.get('/fichas-tecnicas/siguiente');
  return data; // { anio, ciclo, correlativo, folio }
};

// Confirma/registra el folio (lo reserva de verdad) y devuelve el registro.
export const generarFolio = async (titulo, descripcion = '') => {
  const { data } = await API.post('/fichas-tecnicas', { titulo, descripcion });
  return data; // { id, folio, anio, ciclo, correlativo, ... }
};
