import { useState } from 'react';
import './AprobacionEventos.css';

/*
 * Datos de ejemplo (replican la imagen). En producción se reciben por la prop
 * `datosEventos` desde el backend.
 *
 * Estructura de cada evento:
 * {
 *   id: number,
 *   evento: string,
 *   carrera: string,
 *   extension: string | null,   // dato clave secundario (Ext. / área)
 *   periodo: string,            // cuatrimestre, para el filtro
 *   docente: { nombre, rol },   // rol: 'profesor' | 'coordinador'
 *   etapa1: 'validado' | 'pendiente',
 *   etapa2: 'validado' | 'pendiente',
 *   fecha: string,              // '08/05/2026'
 *   hora: string                // '09:00 - 16:00 Hrs'
 * }
 */
const EVENTOS_DEFAULT = [
  {
    id: 1,
    evento: 'Congreso Iberoamericano de Salud y Nutrición Cancún 2026',
    carrera: 'Licenciatura en Nutrición',
    extension: 'Ext. 104',
    periodo: '2026-1',
    docente: { nombre: 'Lic. Elena Zapata', rol: 'profesor' },
    etapa1: 'validado',
    etapa2: 'pendiente',
    fecha: '08/05/2026',
    hora: '09:00 - 16:00 Hrs',
  },
  {
    id: 2,
    evento: 'Entrega de constancias fortalece la formación turística en la UPB',
    carrera: 'Licenciatura en Gestión y Desarrollo Turístico',
    extension: 'Ext. 108',
    periodo: '2026-1',
    docente: { nombre: 'Mtro. Fabián Johanan', rol: 'coordinador' },
    etapa1: 'validado',
    etapa2: 'pendiente',
    fecha: '06/05/2026',
    hora: '11:00 - 13:00 Hrs',
  },
  {
    id: 3,
    evento: 'Jornada de vacunación en la UPB',
    carrera: 'Licenciatura en Nutrición',
    extension: 'Bienestar Institucional',
    periodo: '2026-1',
    docente: { nombre: 'Mtro. Johanan', rol: 'profesor' },
    etapa1: 'validado',
    etapa2: 'pendiente',
    fecha: '08/05/2026',
    hora: '08:00 - 14:00 Hrs',
  },
  {
    id: 4,
    evento: 'Campaña de salud sexual en la UPB',
    carrera: 'Ingeniería en IT e Innovación Digital',
    extension: null,
    periodo: '2026-2',
    docente: { nombre: 'Lic. Oscar Enrique', rol: 'profesor' },
    etapa1: 'validado',
    etapa2: 'pendiente',
    fecha: '11/05/2026',
    hora: '10:00 - 15:00 Hrs',
  },
  {
    id: 5,
    evento: 'Conmemora UPB el Día de las Madres',
    carrera: 'Tronco Común',
    extension: 'Cultura Universitaria',
    periodo: '2026-2',
    docente: { nombre: 'Ing. Erick Rosas', rol: 'profesor' },
    etapa1: 'validado',
    etapa2: 'validado',
    fecha: '12/05/2026',
    hora: '12:00 - 15:00 Hrs',
  },
];

// Estatus global del evento: validado solo si ambas etapas lo están.
const estatusEvento = (ev) =>
  ev.etapa1 === 'validado' && ev.etapa2 === 'validado' ? 'validado' : 'pendiente';

// Iniciales del docente, ignorando el título (Lic., Mtro., Ing.).
const getIniciales = (nombre) => {
  const partes = nombre.split(' ').filter((p) => !p.endsWith('.'));
  return partes.slice(0, 2).map((p) => p[0]).join('').toUpperCase();
};

/* -------- Chip de estado reutilizable (Validado / Pendiente) -------- */
const EstadoChip = ({ estado }) => {
  if (estado === 'validado') {
    return <span className="ap-chip ap-chip-validado">✔ Validado</span>;
  }
  return <span className="ap-chip ap-chip-pendiente">⧗ Pendiente</span>;
};

/* -------- Chip del rol del docente (color según rol) -------- */
const RolChip = ({ rol }) => (
  <span className={`ap-rol-chip ap-rol-${rol}`}>{rol.toUpperCase()}</span>
);

const AprobacionEventos = ({
  datosEventos = EVENTOS_DEFAULT,
  alRevisar = () => {},
  alValidar = () => {},
  alEditar = () => {},
  alRechazar = () => {},
  alDescargarFicha = () => {},
}) => {
  const [periodo, setPeriodo] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [estatus, setEstatus] = useState('todos'); // todos | pendiente | validado
  const [menu, setMenu] = useState(null); // { id, x, y } del dropdown abierto

  // Periodos únicos para el selector.
  const periodos = [...new Set(datosEventos.map((e) => e.periodo))].sort().reverse();

  // Conteos por estatus para las pestañas.
  const totalPendientes = datosEventos.filter((e) => estatusEvento(e) === 'pendiente').length;
  const totalValidados = datosEventos.filter((e) => estatusEvento(e) === 'validado').length;

  // Filtrado por periodo, texto y estatus.
  const eventosFiltrados = datosEventos.filter((ev) => {
    const coincidePeriodo = periodo === 'todos' || ev.periodo === periodo;
    const texto = busqueda.trim().toLowerCase();
    const coincideBusqueda =
      texto === '' ||
      ev.evento.toLowerCase().includes(texto) ||
      ev.docente.nombre.toLowerCase().includes(texto);
    const coincideEstatus = estatus === 'todos' || estatusEvento(ev) === estatus;
    return coincidePeriodo && coincideBusqueda && coincideEstatus;
  });

  const abrirMenu = (e, id) => {
    const r = e.currentTarget.getBoundingClientRect();
    setMenu({ id, x: r.right, y: r.bottom + 6 });
  };
  const cerrarMenu = () => setMenu(null);

  const ejecutar = (accion, id) => {
    accion(id);
    cerrarMenu();
  };

  const pestañas = [
    { clave: 'todos', etiqueta: 'Todos', total: datosEventos.length },
    { clave: 'pendiente', etiqueta: 'Pendientes', total: totalPendientes },
    { clave: 'validado', etiqueta: 'Validados', total: totalValidados },
  ];

  return (
    <div className="ap-workspace">
      {/* ENCABEZADO */}
      <div className="ap-title-section">
        <h1>Aprobación de eventos</h1>
      </div>

      {/* BARRA DE FILTROS */}
      <div className="ap-toolbar">
        <div className="ap-filtro">
          <label htmlFor="ap-periodo">▼ Ver Periodo:</label>
          <select
            id="ap-periodo"
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
          >
            <option value="todos">Todos los cuatrimestres</option>
            {periodos.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div className="ap-busqueda">
          <span className="ap-busqueda-icono">🔍</span>
          <input
            type="text"
            placeholder="Buscar por actividad o docente..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {/* PESTAÑAS DE ESTATUS */}
      <div className="ap-tabs" role="tablist">
        {pestañas.map((tab) => (
          <button
            key={tab.clave}
            type="button"
            role="tab"
            className={`ap-tab ${estatus === tab.clave ? 'active' : ''}`}
            onClick={() => setEstatus(tab.clave)}
          >
            {tab.etiqueta}
            <span className="ap-tab-count">{tab.total}</span>
          </button>
        ))}
      </div>

      {/* TABLA */}
      <div className="ap-tabla-card">
        <table className="ap-tabla">
          <thead>
            <tr>
              <th className="ap-col-num">N°</th>
              <th className="ap-col-evento">Evento Académico Registrado</th>
              <th>Docente Organizador</th>
              <th>Etapa 1: Ficha Técnica</th>
              <th>Etapa 2: Evidencias Técnicas</th>
              <th>Fecha / Hora</th>
              <th className="ap-col-accion">Acción</th>
            </tr>
          </thead>
          <tbody>
            {eventosFiltrados.length === 0 ? (
              <tr>
                <td colSpan={7} className="ap-fila-vacia">
                  No se encontraron eventos para el filtro seleccionado.
                </td>
              </tr>
            ) : (
              eventosFiltrados.map((ev, indice) => (
                <tr key={ev.id}>
                  <td className="ap-col-num">{indice + 1}</td>

                  <td className="ap-col-evento">
                    <div className="ap-evento-cell">
                      <strong className="ap-evento-nombre">{ev.evento}</strong>
                      <span className="ap-tag ap-tag-carrera">🎓 {ev.carrera}</span>
                      {ev.extension && (
                        <span className="ap-tag ap-tag-ext">📍 {ev.extension}</span>
                      )}
                    </div>
                  </td>

                  <td>
                    <div className="ap-docente">
                      <span className={`ap-avatar ap-avatar-${ev.docente.rol}`}>
                        {getIniciales(ev.docente.nombre)}
                      </span>
                      <div className="ap-docente-info">
                        <strong>{ev.docente.nombre}</strong>
                        <RolChip rol={ev.docente.rol} />
                      </div>
                    </div>
                  </td>

                  <td>
                    <EstadoChip estado={ev.etapa1} />
                  </td>

                  <td>
                    <EstadoChip estado={ev.etapa2} />
                  </td>

                  <td>
                    <div className="ap-fecha">
                      <span className="ap-fecha-dia">📅 {ev.fecha}</span>
                      <span className="ap-hora">🕒 {ev.hora}</span>
                    </div>
                  </td>

                  <td className="ap-col-accion">
                    <div className="ap-acciones">
                      <button
                        type="button"
                        className="ap-icon-btn ap-icon-validar"
                        title="Validar evento"
                        onClick={() => alValidar(ev.id)}
                      >
                        ✓
                      </button>
                      <button
                        type="button"
                        className="ap-icon-btn ap-icon-rechazar"
                        title="Rechazar evento"
                        onClick={() => alRechazar(ev.id)}
                      >
                        ✕
                      </button>
                      <button
                        type="button"
                        className={`ap-icon-btn ap-icon-mas ${menu?.id === ev.id ? 'active' : ''}`}
                        title="Más acciones"
                        onClick={(e) => abrirMenu(e, ev.id)}
                      >
                        ⋮
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* DROPDOWN DE ACCIONES (posición fija para no recortarse en la tabla) */}
      {menu && (
        <>
          <div className="ap-menu-backdrop" onClick={cerrarMenu} />
          <div className="ap-menu" style={{ top: menu.y, left: menu.x - 220 }}>
            <button type="button" onClick={() => ejecutar(alRevisar, menu.id)}>
              👁 Revisar
            </button>
            <button type="button" onClick={() => ejecutar(alEditar, menu.id)}>
              ✎ Editar
            </button>
            <div className="ap-menu-sep" />
            <button type="button" onClick={() => ejecutar(alDescargarFicha, menu.id)}>
              📄 Descargar Ficha de Evento
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default AprobacionEventos;
