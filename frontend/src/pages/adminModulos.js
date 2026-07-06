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
 * "Mis Constancias" del coordinador: misma mecánica de tabla + modal que los
 * módulos de administración, pero para consultar y editar sus constancias.
 */
export const CONFIG_CONSTANCIAS = {
  titulo: 'Mis Constancias',
  subtitulo: 'Consulta y edita las constancias emitidas a tu nombre.',
  singular: 'Constancia',
  columnas: [
    { clave: 'titulo', etiqueta: 'Evento / Reconocimiento' },
    { clave: 'rol', etiqueta: 'Rol' },
    { clave: 'fecha', etiqueta: 'Fecha de Emisión' },
  ],
  campos: [
    { clave: 'titulo', etiqueta: 'Evento / Reconocimiento', tipo: 'text', requerido: true, placeholder: 'Ej. Hackatón Come Datos' },
    { clave: 'rol', etiqueta: 'Rol desempeñado', tipo: 'text', requerido: true, placeholder: 'Ej. Asesor de Equipo' },
    { clave: 'fecha', etiqueta: 'Fecha de emisión', tipo: 'date', requerido: true },
    { clave: 'descripcion', etiqueta: 'Descripción', tipo: 'text', requerido: false, placeholder: 'Detalle del reconocimiento' },
  ],
  datos: [
    { id: 1, titulo: 'Hackatón Come Datos', rol: 'Asesor de Equipo (Dataflow)', fecha: '2026-10-15', descripcion: 'Participación Hackatón Come Datos 2025' },
    { id: 2, titulo: 'Taller de mantenimiento', rol: 'Maestro', fecha: '2026-06-20', descripcion: 'Taller de mantenimiento de dispositivos' },
    { id: 3, titulo: 'Laboratorio de Redes Cisco', rol: 'Instructor Certificado', fecha: '2026-03-08', descripcion: 'Certificación en configuración de redes' },
  ],
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
    datos: [
      { id: 1, nombre: '2024-2025', inicio: '2024-09-01', fin: '2025-08-31', estado: 'Inactivo' },
      { id: 2, nombre: '2025-2026', inicio: '2025-09-01', fin: '2026-08-31', estado: 'Activo' },
    ],
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
    datos: [
      { id: 1, nombre: 'Ingeniería en TI e Innovación Digital', clave: 'ITIID', coordinador: 'Mtro. Fabián Johanan', estado: 'Activo' },
      { id: 2, nombre: 'Licenciatura en Nutrición', clave: 'LN', coordinador: 'Lic. Elena Zapata', estado: 'Activo' },
      { id: 3, nombre: 'Lic. en Gestión y Desarrollo Turístico', clave: 'LGDT', coordinador: 'Lic. Oscar Enrique', estado: 'Inactivo' },
    ],
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
      { clave: 'carrera', etiqueta: 'Carrera', tipo: 'select', opciones: ['ITIID', 'Nutrición', 'Turismo'], requerido: true },
      { clave: 'cuatrimestre', etiqueta: 'Cuatrimestre', tipo: 'number', requerido: true, placeholder: '1 a 10' },
    ],
    datos: [
      { id: 1, nombre: 'Programación Web', clave: 'PW-601', carrera: 'ITIID', cuatrimestre: 6 },
      { id: 2, nombre: 'Nutrición Comunitaria', clave: 'NC-402', carrera: 'Nutrición', cuatrimestre: 4 },
    ],
  },

  usuarios: {
    titulo: 'Usuarios',
    subtitulo: 'Administra las cuentas de acceso al sistema SRAA.',
    singular: 'Usuario',
    columnas: [
      { clave: 'nombre', etiqueta: 'Nombre' },
      { clave: 'correo', etiqueta: 'Correo' },
      { clave: 'rol', etiqueta: 'Rol', tipo: 'rol' },
      { clave: 'estado', etiqueta: 'Estado', tipo: 'estado' },
    ],
    campos: [
      { clave: 'nombre', etiqueta: 'Nombre completo', tipo: 'text', requerido: true },
      { clave: 'correo', etiqueta: 'Correo institucional', tipo: 'email', requerido: true, placeholder: 'nombre.apellido@upb.edu.mx' },
      { clave: 'rol', etiqueta: 'Rol', tipo: 'select', opciones: ['docente', 'coordinador', 'administrador'], requerido: true },
      { clave: 'estado', etiqueta: 'Estado', tipo: 'select', opciones: ['Activo', 'Inactivo'], requerido: true },
    ],
    datos: [
      { id: 1, nombre: 'Ing. Isai Rosas Canto', correo: 'isai.rosas@upb.edu.mx', rol: 'docente', estado: 'Activo' },
      { id: 2, nombre: 'Mtr. Julio Cen', correo: 'julio.cen@upb.edu.mx', rol: 'coordinador', estado: 'Activo' },
    ],
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
      { clave: 'ciclo', etiqueta: 'Ciclo', tipo: 'select', opciones: ['2024-2025', '2025-2026'], requerido: true },
      { clave: 'estado', etiqueta: 'Estado', tipo: 'select', opciones: ['Activo', 'Inactivo'], requerido: true },
    ],
    datos: [
      { id: 1, nombre: 'Enero - Abril 2026', numero: 1, ciclo: '2025-2026', estado: 'Inactivo' },
      { id: 2, nombre: 'Mayo - Agosto 2026', numero: 2, ciclo: '2025-2026', estado: 'Activo' },
    ],
  },
};
