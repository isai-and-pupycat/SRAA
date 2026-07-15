/*
 * Mapeo entre el rol que usa el frontend (texto en minúsculas) y el
 * nombre del rol en la tabla `roles` (relacional, con FK desde usuarios).
 *   Frontend        Tabla roles
 *   coordinador  ↔  Coordinador
 *   docente      ↔  Profesor
 *   administrador↔  Administrador
 */
const DB_A_FRONT = {
  Coordinador: 'coordinador',
  Profesor: 'docente',
  Administrador: 'administrador',
};

const FRONT_A_DB = {
  coordinador: 'Coordinador',
  docente: 'Profesor',
  administrador: 'Administrador',
};

// Nombre de rol de la BD → rol del frontend.
const aFront = (nombreDb) => DB_A_FRONT[nombreDb] || (nombreDb ? String(nombreDb).toLowerCase() : 'docente');

// Rol del frontend → nombre de rol en la BD (por defecto Profesor).
const aDb = (rolFront) => FRONT_A_DB[String(rolFront || '').toLowerCase()] || 'Profesor';

module.exports = { aFront, aDb };
