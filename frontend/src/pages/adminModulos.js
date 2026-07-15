/*
 * Configuración de los 5 módulos del panel de ADMINISTRACIÓN.
 * Cada módulo simula una tabla de una base de datos relacional:
 *   - columnas: qué se muestra en la tabla (tipo 'estado'/'rol' → chip)
 *   - campos:   qué se edita en el modal (tipo, si es requerido, validación)
 *   - datos:    registros iniciales (como si vinieran del backend)
 *
 * Las relaciones (carrera, ciclo) se representan con selects cuyas opciones
 * en producción se cargarían desde su propia tabla.
 */
/*
 * "Constancias Emitidas" del coordinador: registro de todas las constancias
 * generadas. Se alimenta automáticamente desde "Crear Constancia" y también
 * permite dar de alta una manualmente. Misma mecánica de tabla + modal.
 */
export const CONFIG_CONSTANCIAS = {
  titulo: 'Constancias Emitidas',
  subtitulo: 'Registro de todas las constancias generadas para los docentes.',
  singular: 'Constancia',
  columnas: [
    { clave: 'titulo', etiqueta: 'Evento / Reconocimiento' },
    { clave: 'tipo', etiqueta: 'Tipo' },
    { clave: 'destinatario', etiqueta: 'Destinatario' },
    { clave: 'para_profesores', etiqueta: 'Profesores' },
    { clave: 'fecha', etiqueta: 'Fecha de Emisión' },
  ],
  campos: [
    { clave: 'titulo', etiqueta: 'Evento / Reconocimiento', tipo: 'text', requerido: true, placeholder: 'Ej. Hackatón Come Datos' },
    { clave: 'tipo', etiqueta: 'Tipo', tipo: 'select', requerido: true, opciones: ['Constancia', 'Reconocimiento', 'Diploma'] },
    { clave: 'destinatario', etiqueta: 'Docente destinatario', tipo: 'text', requerido: true, placeholder: 'Ej. Ing. Isai Rosas Canto' },
    { clave: 'para_profesores', etiqueta: '¿Es para profesores?', tipo: 'select', requerido: false, opciones: ['No', 'Sí'] },
    { clave: 'rol', etiqueta: 'Rol desempeñado', tipo: 'text', requerido: false, placeholder: 'Ej. Asesor de Equipo' },
    { clave: 'fecha', etiqueta: 'Fecha de emisión', tipo: 'date', requerido: true },
    { clave: 'descripcion', etiqueta: 'Descripción', tipo: 'text', requerido: false, placeholder: 'Detalle del reconocimiento' },
  ],
  datos: [],
};

export const MODULOS_ADMIN = {
  ciclos: {
    titulo: 'Ciclos Escolares',
    subtitulo: 'Gestiona los ciclos escolares del sistema.',
    singular: 'Ciclo',
    columnas: [
      { clave: 'nombre', etiqueta: 'Ciclo' },
      { clave: 'inicio', etiqueta: 'Inicio' },
      { clave: 'fin', etiqueta: 'Fin' },
      { clave: 'estado', etiqueta: 'Estado', tipo: 'estado' },
    ],
    campos: [
      { clave: 'nombre', etiqueta: 'Nombre del ciclo', tipo: 'text', requerido: true, placeholder: 'Ej. 2025-2026' },
      { clave: 'inicio', etiqueta: 'Fecha de inicio', tipo: 'date', requerido: true },
      { clave: 'fin', etiqueta: 'Fecha de fin', tipo: 'date', requerido: true },
      { clave: 'estado', etiqueta: 'Estado', tipo: 'select', opciones: ['Activo', 'Inactivo'], requerido: true },
    ],
    datos: [],
  },

  carreras: {
    titulo: 'Carreras',
    subtitulo: 'Administra los programas educativos de la universidad.',
    singular: 'Carrera',
    columnas: [
      { clave: 'nombre', etiqueta: 'Carrera' },
      { clave: 'clave', etiqueta: 'Clave' },
      { clave: 'coordinador', etiqueta: 'Coordinador' },
      { clave: 'estado', etiqueta: 'Estado', tipo: 'estado' },
    ],
    campos: [
      { clave: 'nombre', etiqueta: 'Nombre de la carrera', tipo: 'text', requerido: true, placeholder: 'Ej. Ingeniería en TI e Innovación Digital' },
      { clave: 'clave', etiqueta: 'Clave', tipo: 'text', requerido: true, placeholder: 'Ej. ITIID' },
      { clave: 'coordinador', etiqueta: 'Coordinador', tipo: 'text', requerido: true },
      { clave: 'estado', etiqueta: 'Estado', tipo: 'select', opciones: ['Activo', 'Inactivo'], requerido: true },
    ],
    datos: [],
  },

  asignaturas: {
    titulo: 'Asignaturas',
    subtitulo: 'Gestiona las asignaturas por carrera y cuatrimestre.',
    singular: 'Asignatura',
    columnas: [
      { clave: 'nombre', etiqueta: 'Asignatura' },
      { clave: 'clave', etiqueta: 'Clave' },
      { clave: 'carrera', etiqueta: 'Carrera' },
      { clave: 'cuatrimestre', etiqueta: 'Cuatrimestre' },
    ],
    campos: [
      { clave: 'nombre', etiqueta: 'Nombre de la asignatura', tipo: 'text', requerido: true, placeholder: 'Ej. Programación Web' },
      { clave: 'clave', etiqueta: 'Clave', tipo: 'text', requerido: true, placeholder: 'Ej. PW-601' },
      { clave: 'carrera', etiqueta: 'Carrera', tipo: 'select', opcionesDe: 'carreras', requerido: true },
      { clave: 'cuatrimestre', etiqueta: 'Cuatrimestre', tipo: 'number', requerido: true, placeholder: '1 a 10' },
    ],
    datos: [],
  },

  usuarios: {
    titulo: 'Usuarios',
    subtitulo: 'Administra las cuentas de acceso al sistema SRAA.',
    singular: 'Usuario',
    columnas: [
      { clave: 'nombre', etiqueta: 'Nombre' },
      { clave: 'correo', etiqueta: 'Correo' },
      { clave: 'rol', etiqueta: 'Rol', tipo: 'rol' },
      { clave: 'estatus', etiqueta: 'Estado', tipo: 'estado' },
    ],
    campos: [
      { clave: 'nombre', etiqueta: 'Nombre completo', tipo: 'text', requerido: true },
      { clave: 'correo', etiqueta: 'Correo institucional', tipo: 'email', requerido: true, placeholder: 'nombre.apellido@upb.edu.mx' },
      { clave: 'rol', etiqueta: 'Rol', tipo: 'select', opciones: ['docente', 'coordinador', 'administrador'], requerido: true },
      { clave: 'estatus', etiqueta: 'Estado', tipo: 'select', opciones: ['activo', 'pendiente', 'inactivo'], requerido: true },
      { clave: 'programa', etiqueta: 'Programa educativo', tipo: 'select', opcionesDe: 'carreras', requerido: false },
      { clave: 'contrasena', etiqueta: 'Contraseña', tipo: 'password', requerido: false, placeholder: 'Dejar en blanco para no cambiarla' },
    ],
    datos: [],
  },

  cuatrimestres: {
    titulo: 'Cuatrimestres',
    subtitulo: 'Define los periodos cuatrimestrales de cada ciclo.',
    singular: 'Cuatrimestre',
    columnas: [
      { clave: 'nombre', etiqueta: 'Cuatrimestre' },
      { clave: 'numero', etiqueta: 'Número' },
      { clave: 'ciclo', etiqueta: 'Ciclo' },
      { clave: 'estado', etiqueta: 'Estado', tipo: 'estado' },
    ],
    campos: [
      { clave: 'nombre', etiqueta: 'Nombre del periodo', tipo: 'text', requerido: true, placeholder: 'Ej. Mayo - Agosto 2026' },
      { clave: 'numero', etiqueta: 'Número', tipo: 'number', requerido: true, placeholder: '1, 2 o 3' },
      { clave: 'ciclo', etiqueta: 'Ciclo', tipo: 'select', opcionesDe: 'ciclos', requerido: true },
      { clave: 'estado', etiqueta: 'Estado', tipo: 'select', opciones: ['Activo', 'Inactivo'], requerido: true },
    ],
    datos: [],
  },
};
