import { useState } from 'react';
import './ListadoFichas.css';

/*
 * Datos de ejemplo. Si no se recibe la prop `datosFichas`, el componente
 * renderiza estos registros para poder visualizarse de forma aislada.
 * En producción el padre debe pasar el arreglo real desde la BD.
 *
 * Estructura de cada ficha:
 * {
 *   id: number,
 *   nombre: string,
 *   carrera: string,
 *   cuatrimestre: string,
 *   etapa1: 'validado' | 'pendiente',
 *   etapa2: {                       // Estructura del Orden del Día
 *     estado: 'incompleto' | 'en-validacion' | 'finalizado' | 'pendiente',
 *     porcentaje?: number,          // solo para 'incompleto'
 *     faltantes?: string[]          // solo para 'incompleto'
 *   },
 *   etapa3: { ... },                // Cierre y Evidencias (misma estructura que etapa2)
 *   fecha: string,                  // '16/06/2026'
 *   hora: string                    // '09:00 - 14:00'
 * }
 */
const FICHAS_EJEMPLO = [
  {
    id: 1,
    nombre: 'Muestra Tecnológica de Innovación Digital 2026',
    carrera: 'Ingeniería en IT e Innovación Digital',
    cuatrimestre: '2026-2',
    etapa1: 'validado',
    etapa2: { estado: 'incompleto', porcentaje: 40, faltantes: ['Descripción', 'Logros', 'Fotos'] },
    etapa3: { estado: 'pendiente' },
    fecha: '16/06/2026',
    hora: '09:00 - 14:00',
  },
  {
    id: 2,
    nombre: 'Brigada Universitaria de Evaluación Nutricional Comunitaria',
    carrera: 'Licenciatura en Nutrición',
    cuatrimestre: '2026-2',
    etapa1: 'validado',
    etapa2: { estado: 'incompleto', porcentaje: 25, faltantes: ['Testigos Fotográficos'] },
    etapa3: { estado: 'pendiente' },
    fecha: '18/06/2026',
    hora: '08:00 - 15:00',
  },
  {
    id: 3,
    nombre: 'Exposición de Modelado 3D y Cortometrajes ARTMOSFERA',
    carrera: 'Ingeniería en Animación y Efectos Visuales',
    cuatrimestre: '2026-1',
    etapa1: 'validado',
    etapa2: { estado: 'finalizado' },
    etapa3: { estado: 'en-validacion' },
    fecha: '24/06/2026',
    hora: '10:00 - 18:00',
  },
  {
    id: 4,
    nombre: 'Foro de Gestión y Desarrollo Turístico Sustentable Pueblo Mágico',
    carrera: 'Licenciatura en Gestión y Desarrollo Turístico',
    cuatrimestre: '2025-3',
    etapa1: 'validado',
    etapa2: { estado: 'finalizado' },
    etapa3: { estado: 'finalizado' },
    fecha: '12/11/2025',
    hora: '09:00 - 16:00',
  },
];

/* -------- Indicador de estado para la Etapa 1 -------- */
const EstadoEtapa1 = ({ estado }) => {
  if (estado === 'validado') {
    return <span className="badge-estado badge-validado">✔ Validado</span>;
  }
  return <span className="badge-estado badge-pendiente">◔ Pendiente</span>;
};

/* -------- Indicador de estado reutilizable (Etapas 2 y 3) -------- */
const EstadoEtapa = ({ etapa }) => {
  if (etapa.estado === 'finalizado') {
    return <span className="badge-estado badge-finalizado">✔ Finalizado</span>;
  }

  if (etapa.estado === 'en-validacion') {
    return <span className="badge-estado badge-en-validacion">⏱ En Validación</span>;
  }

  if (etapa.estado === 'pendiente') {
    return <span className="badge-estado badge-pendiente">◔ Pendiente</span>;
  }

  // Incompleto: encabezado + lista de faltantes + barra de progreso
  return (
    <div className="etapa-incompleto">
      <span className="badge-estado badge-incompleto">⚠ Incompleto</span>

      {etapa.faltantes?.length > 0 && (
        <ul className="lista-faltantes">
          {etapa.faltantes.map((item) => (
            <li key={item}>
              <span className="faltante-x">✕</span> {item}
            </li>
          ))}
        </ul>
      )}

      <div className="barra-progreso">
        <div
          className="barra-progreso-relleno"
          style={{ width: `${etapa.porcentaje ?? 0}%` }}
        />
      </div>
      <span className="progreso-texto">{etapa.porcentaje ?? 0}% Completado</span>
    </div>
  );
};

/* -------- Botón de acción secundario según el avance de la ficha -------- */
const AccionSecundaria = ({ ficha, alSeleccionarFicha }) => {
  const estados = [ficha.etapa2.estado, ficha.etapa3.estado];

  // Si alguna etapa aún está incompleta o pendiente, se permite EDITAR.
  if (estados.some((e) => e === 'incompleto' || e === 'pendiente')) {
    return (
      <button
        type="button"
        className="btn-accion btn-editar"
        onClick={() => alSeleccionarFicha(ficha.id, 'editar')}
      >
        ✎ Editar
      </button>
    );
  }

  // Descarga habilitada solo cuando la última etapa está finalizada.
  const habilitado = ficha.etapa3.estado === 'finalizado';
  return (
    <button
      type="button"
      className={`btn-accion btn-descargar ${habilitado ? '' : 'btn-deshabilitado'}`}
      disabled={!habilitado}
    >
      ⬇ Descargar
    </button>
  );
};

const ListadoFichas = ({ datosFichas = FICHAS_EJEMPLO, alSeleccionarFicha = () => {} }) => {
  const [periodo, setPeriodo] = useState('todos');
  const [busqueda, setBusqueda] = useState('');

  // Filtrado por periodo (cuatrimestre) y por texto de búsqueda.
  const fichasFiltradas = datosFichas.filter((ficha) => {
    const coincidePeriodo = periodo === 'todos' || ficha.cuatrimestre === periodo;
    const texto = busqueda.trim().toLowerCase();
    const coincideBusqueda =
      texto === '' ||
      ficha.nombre.toLowerCase().includes(texto) ||
      ficha.carrera.toLowerCase().includes(texto);
    return coincidePeriodo && coincideBusqueda;
  });

  // Periodos únicos para el selector, derivados de los datos recibidos.
  const periodos = [...new Set(datosFichas.map((f) => f.cuatrimestre))].sort().reverse();

  return (
    <div className="listado-fichas-workspace">
      {/* ENCABEZADO */}
      <div className="listado-title-section">
        <h2>LISTADO DE EVENTOS</h2>
        <p>Seguimiento y control de llenado de formatos académicos institucionales</p>
      </div>

      {/* BARRA DE FILTROS */}
      <div className="listado-toolbar">
        <div className="toolbar-filtro">
          <label htmlFor="filtro-cuatrimestre">📅 Cuatrimestre Activo:</label>
          <select
            id="filtro-cuatrimestre"
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
          >
            <option value="todos">Ver todos los períodos</option>
            {periodos.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div className="toolbar-busqueda">
          <span className="icono-busqueda">🔍</span>
          <input
            type="text"
            placeholder="Buscar actividad o carrera..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {/* TABLA */}
      <div className="listado-tabla-card">
        <table className="tabla-fichas">
          <thead>
            <tr>
              <th className="col-num">N°</th>
              <th className="col-actividad">Actividad Registrada</th>
              <th>Etapa 1: Ficha Técnica</th>
              <th className="col-etapa2">Etapa 2: Orden del Día</th>
              <th className="col-etapa3">Etapa 3: Cierre y Evidencias</th>
              <th>Fecha del Evento</th>
              <th className="col-accion">Acción</th>
            </tr>
          </thead>
          <tbody>
            {fichasFiltradas.length === 0 ? (
              <tr>
                <td colSpan={7} className="fila-vacia">
                  No se encontraron fichas para el filtro seleccionado.
                </td>
              </tr>
            ) : (
              fichasFiltradas.map((ficha, indice) => (
                <tr key={ficha.id}>
                  <td className="col-num">{indice + 1}</td>

                  <td className="col-actividad">
                    <strong className="actividad-nombre">{ficha.nombre}</strong>
                    <span className="actividad-meta">
                      {ficha.carrera} | Cuatrimestre: {ficha.cuatrimestre}
                    </span>
                  </td>

                  <td>
                    <EstadoEtapa1 estado={ficha.etapa1} />
                  </td>

                  <td className="col-etapa2">
                    <EstadoEtapa etapa={ficha.etapa2} />
                  </td>

                  <td className="col-etapa3">
                    <EstadoEtapa etapa={ficha.etapa3} />
                  </td>

                  <td>
                    <div className="celda-fecha">
                      <span>📅 {ficha.fecha}</span>
                      <span className="fecha-hora">🕘 {ficha.hora}</span>
                    </div>
                  </td>

                  <td className="col-accion">
                    <div className="grupo-acciones">
                      <button
                        type="button"
                        className="btn-accion btn-ver"
                        onClick={() => alSeleccionarFicha(ficha.id, 'ver')}
                      >
                        👁 Ver
                      </button>
                      <AccionSecundaria
                        ficha={ficha}
                        alSeleccionarFicha={alSeleccionarFicha}
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ListadoFichas;
