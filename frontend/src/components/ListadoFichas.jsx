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
// Vacío: el listado se llena conforme se crean fichas (o desde el backend).
const FICHAS_EJEMPLO = [];

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

  if (etapa.estado === 'validado') {
    return <span className="badge-estado badge-validado">✔ Validado</span>;
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
const AccionSecundaria = ({ ficha, alSeleccionarFicha, alDescargarInforme }) => {
  // 1) Informe ya finalizado → se puede DESCARGAR el Informe de Actividades.
  if (ficha.etapa3.estado === 'finalizado') {
    return (
      <button
        type="button"
        className="btn-accion btn-descargar"
        onClick={() => alDescargarInforme(ficha)}
      >
        ⬇ Descargar Informe
      </button>
    );
  }

  // 2) El coordinador ya validó (Etapa 1) → el docente completa el Informe (Etapa 3).
  if (ficha.etapa1 === 'validado') {
    return (
      <button
        type="button"
        className="btn-accion btn-editar"
        onClick={() => alSeleccionarFicha(ficha.id, 'editar')}
      >
        ✎ Completar Informe
      </button>
    );
  }

  // 3) Aún sin validar por el coordinador → en espera.
  return (
    <button type="button" className="btn-accion btn-descargar btn-deshabilitado" disabled>
      ⧗ En validación
    </button>
  );
};

const ListadoFichas = ({
  datosFichas = FICHAS_EJEMPLO,
  alSeleccionarFicha = () => {},
  alEliminarFicha = () => {},
  alDescargarInforme = () => {},
}) => {
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
                        alDescargarInforme={alDescargarInforme}
                      />
                      <button
                        type="button"
                        className="btn-accion btn-eliminar"
                        onClick={() => alEliminarFicha(ficha.id)}
                      >
                        🗑 Eliminar
                      </button>
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
