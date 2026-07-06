import { useState } from 'react';
import AprobacionEventos from './AprobacionEventos';
import CrearConstancia from './CrearConstancia';
import AprobacionProfesores from './AprobacionProfesores';
import CrudAdmin from './CrudAdmin';
import { MODULOS_ADMIN, CONFIG_CONSTANCIAS } from './adminModulos';
import FichaEventoEtapa1 from '../components/FichaEventoEtapa1';
import FichaEventoEtapa2 from '../components/FichaEventoEtapa2';
import FichaEventoEtapa3 from '../components/FichaEventoEtapa3';
import './CentroControl.css';

/* ============================================================
   DATOS POR DEFECTO (replican la imagen del Centro de Control)
   Todo es parametrizable por props para que el panel sea modular.
   ============================================================ */
const METRICAS_DEFAULT = {
  profesores: 5,
  fichas: 12,
  constancias: 89,
};

// Eventos indexados por día del mes. tipo: 'concluido' | 'pendiente'
const EVENTOS_DEFAULT = {
  6: [{ titulo: 'Entrega Constancias', tipo: 'concluido' }],
  8: [
    { titulo: 'Congreso Nutrición', tipo: 'pendiente' },
    { titulo: 'Jornada Vacunación', tipo: 'concluido' },
  ],
  11: [{ titulo: 'Campaña Sexual', tipo: 'pendiente' }],
  12: [{ titulo: 'Día de las Madres', tipo: 'concluido' }],
  16: [{ titulo: 'Triatlón UPB', tipo: 'concluido' }],
};

const ACCESOS_DEFAULT = [
  'Validar Profesores Pendientes',
  'Validar Fichas de Eventos',
  'Descargar Reportes de Cierre',
];

const ACTIVIDAD_DEFAULT = [
  { tipo: 'aprobado', texto: 'Mtro. Fabián Johanan aprobó el registro del nuevo profesor de TI.', tiempo: 'Hace 5m' },
  { tipo: 'subida', texto: 'Ing. Erick Rosas subió la ficha de Conmemoración del Día de las Madres.', tiempo: 'Hace 1h' },
  { tipo: 'descarga', texto: 'Se descargó la lista de enlaces Excel desde el rol Coordinador.', tiempo: 'Hace 3h' },
];

// Estructura del menú lateral administrativo
const NAV_ADMIN = [
  { clave: 'inicio', etiqueta: 'Inicio' },
  { clave: 'aprobacion-eventos', etiqueta: 'Aprobación de Eventos' },
  { clave: 'crear-ficha', etiqueta: 'Creación de Ficha de Evento' },
  { clave: 'informe-evento', etiqueta: 'Descargar Informe de Evento' },
  { clave: 'crear-constancia', etiqueta: 'Crear Constancia' },
  { clave: 'mis-constancias', etiqueta: 'Mis Constancias' },
  {
    clave: 'administracion',
    etiqueta: 'Administración',
    hijos: [
      { clave: 'ciclos', etiqueta: 'Ciclos' },
      { clave: 'carreras', etiqueta: 'Carreras' },
      { clave: 'asignaturas', etiqueta: 'Asignaturas' },
      { clave: 'usuarios', etiqueta: 'Usuarios' },
      { clave: 'cuatrimestres', etiqueta: 'Cuatrimestres' },
    ],
  },
  { clave: 'aprobacion-profesores', etiqueta: 'Aprobación de Profesores' },
];

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

// Iconos por tipo de actividad reciente
const ICONO_ACTIVIDAD = {
  aprobado: { simbolo: '✔', clase: 'dot-green' },
  subida: { simbolo: '↑', clase: 'dot-blue' },
  descarga: { simbolo: '⬇', clase: 'dot-dark' },
};

/* Construye la matriz de celdas del calendario (semana inicia en Lunes) */
const construirCeldas = (anio, mes) => {
  const primerDia = new Date(anio, mes, 1);
  // getDay(): 0=Domingo..6=Sábado. Lo convertimos a Lunes=0.
  const offset = (primerDia.getDay() + 6) % 7;
  const diasEnMes = new Date(anio, mes + 1, 0).getDate();
  const diasMesPrevio = new Date(anio, mes, 0).getDate();

  const celdas = [];

  // Días "apagados" del mes anterior para rellenar el inicio
  for (let i = offset; i > 0; i -= 1) {
    celdas.push({ dia: diasMesPrevio - i + 1, muted: true });
  }
  // Días reales del mes actual
  for (let d = 1; d <= diasEnMes; d += 1) {
    celdas.push({ dia: d, muted: false });
  }
  // Días "apagados" del mes siguiente para cerrar la última semana
  let siguiente = 1;
  while (celdas.length % 7 !== 0) {
    celdas.push({ dia: siguiente, muted: true });
    siguiente += 1;
  }
  return celdas;
};

const CentroControl = ({
  usuario = { nombre: 'Mtr. Fabián Johanan' },
  metricas = METRICAS_DEFAULT,
  eventos = EVENTOS_DEFAULT,
  accesos = ACCESOS_DEFAULT,
  actividad = ACTIVIDAD_DEFAULT,
  mesInicial = 4, // Mayo (0-indexado)
  anioInicial = 2026,
  alNavegar = () => {},
  alAccesoDirecto = () => {},
  alCerrarSesion = () => {},
}) => {
  const [vistaActiva, setVistaActiva] = useState('inicio');
  const [mes, setMes] = useState(mesInicial);
  const [anio, setAnio] = useState(anioInicial);
  // Flujo de la Ficha de Evento (3 etapas) reutilizado del portal docente
  const [etapaFicha, setEtapaFicha] = useState(1);
  const [nombreActividad, setNombreActividad] = useState('');

  const celdas = construirCeldas(anio, mes);

  const cambiarMes = (delta) => {
    let nuevoMes = mes + delta;
    let nuevoAnio = anio;
    if (nuevoMes < 0) {
      nuevoMes = 11;
      nuevoAnio -= 1;
    } else if (nuevoMes > 11) {
      nuevoMes = 0;
      nuevoAnio += 1;
    }
    setMes(nuevoMes);
    setAnio(nuevoAnio);
  };

  const seleccionarVista = (clave) => {
    // Al entrar a "Creación de Ficha de Evento" siempre iniciamos en la Etapa 1
    if (clave === 'crear-ficha') setEtapaFicha(1);
    setVistaActiva(clave);
    alNavegar(clave);
  };

  const iniciales = usuario.nombre
    .split(' ')
    .map((parte) => parte[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="cc-layout">
      {/* ================= SIDEBAR ADMINISTRATIVO ================= */}
      <aside className="cc-sidebar">
        <div className="cc-brand">SRAA</div>

        <nav className="cc-nav">
          {NAV_ADMIN.map((item) =>
            item.hijos ? (
              <div key={item.clave} className="cc-nav-group">
                <span className="cc-nav-group-title">{item.etiqueta}</span>
                {item.hijos.map((hijo) => (
                  <button
                    key={hijo.clave}
                    type="button"
                    className={`cc-nav-item cc-nav-child ${vistaActiva === hijo.clave ? 'active' : ''}`}
                    onClick={() => seleccionarVista(hijo.clave)}
                  >
                    {hijo.etiqueta}
                  </button>
                ))}
              </div>
            ) : (
              <button
                key={item.clave}
                type="button"
                className={`cc-nav-item ${vistaActiva === item.clave ? 'active' : ''}`}
                onClick={() => seleccionarVista(item.clave)}
              >
                {item.etiqueta}
              </button>
            )
          )}
        </nav>
      </aside>

      {/* ================= ZONA PRINCIPAL ================= */}
      <div className="cc-main">
        {/* HEADER */}
        <header className="cc-header">
          <div className="cc-header-institution">
            <span className="cc-header-logo">🎓</span>
            <span className="cc-header-univ">UNIVERSIDAD POLITÉCNICA DE BACALAR</span>
          </div>
          <div className="cc-header-actions">
            <div className="cc-user-badge">
              <span className="cc-user-initials">{iniciales}</span>
              <span className="cc-user-name">{usuario.nombre}</span>
              <span className="cc-user-arrow">▾</span>
            </div>
            <button type="button" className="cc-logout-btn" onClick={alCerrarSesion}>
              Cerrar sesión
            </button>
          </div>
        </header>

        <div className="cc-content">
          {vistaActiva === 'inicio' && (
          <>
          {/* TÍTULO */}
          <div className="cc-title-block">
            <h1>Centro de Control</h1>
            <p>Monitoreo general de actividades, registros docentes y constancias del periodo actual.</p>
          </div>

          {/* MÉTRICAS (TOP CARDS) */}
          <div className="cc-metrics-row">
            <div className="cc-metric-card">
              <span className="cc-metric-icon icon-blue">👥</span>
              <div className="cc-metric-info">
                <strong>{metricas.profesores}</strong>
                <span>PROFESORES POR VALIDAR</span>
              </div>
            </div>
            <div className="cc-metric-card">
              <span className="cc-metric-icon icon-orange">🕓</span>
              <div className="cc-metric-info">
                <strong>{metricas.fichas}</strong>
                <span>FICHAS POR VALIDAR</span>
              </div>
            </div>
            <div className="cc-metric-card">
              <span className="cc-metric-icon icon-green">🏅</span>
              <div className="cc-metric-info">
                <strong>{metricas.constancias}</strong>
                <span>CONSTANCIAS EMITIDAS</span>
              </div>
            </div>
          </div>

          {/* REJILLA: CALENDARIO + PANEL DERECHO */}
          <div className="cc-grid">
            {/* CALENDARIO OPERATIVO */}
            <section className="cc-calendar-card">
              <div className="cc-calendar-header">
                <button type="button" className="cc-cal-nav" onClick={() => cambiarMes(-1)}>
                  ‹
                </button>
                <span className="cc-cal-month">
                  {MESES[mes].toUpperCase()} {anio}
                </span>
                <button type="button" className="cc-cal-nav" onClick={() => cambiarMes(1)}>
                  ›
                </button>
              </div>

              <div className="cc-calendar-weekdays">
                {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((dia, i) => (
                  <span key={i}>{dia}</span>
                ))}
              </div>

              <div className="cc-calendar-grid">
                {celdas.map((celda, index) => {
                  const eventosDia = !celda.muted ? eventos[celda.dia] || [] : [];
                  return (
                    <div key={index} className={`cc-cell ${celda.muted ? 'muted' : ''}`}>
                      <span className="cc-cell-num">{celda.dia}</span>
                      {eventosDia.map((evento, i) => (
                        <span key={i} className={`cc-event-tag tag-${evento.tipo}`}>
                          {evento.titulo}
                        </span>
                      ))}
                    </div>
                  );
                })}
              </div>

              <div className="cc-calendar-legend">
                <span className="cc-leg">
                  <span className="cc-dot dot-green" /> Concluido y Sincronizado
                </span>
                <span className="cc-leg">
                  <span className="cc-dot dot-dark" /> Pendiente por Aprobación
                </span>
              </div>
            </section>

            {/* PANEL DERECHO */}
            <aside className="cc-side-panel">
              {/* ACCESOS DIRECTOS */}
              <div className="cc-panel-card">
                <span className="cc-panel-title">⚡ Accesos Directos Operativos</span>
                <div className="cc-access-list">
                  {accesos.map((acceso, i) => (
                    <button
                      key={i}
                      type="button"
                      className="cc-access-item"
                      onClick={() => alAccesoDirecto(acceso)}
                    >
                      <span>{acceso}</span>
                      <span className="cc-access-arrow">›</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* ACTIVIDAD RECIENTE */}
              <div className="cc-panel-card">
                <span className="cc-panel-title">🕘 Actividad Reciente del Portal</span>
                <div className="cc-activity-list">
                  {actividad.map((item, i) => {
                    const icono = ICONO_ACTIVIDAD[item.tipo] || ICONO_ACTIVIDAD.subida;
                    return (
                      <div key={i} className="cc-activity-item">
                        <span className={`cc-activity-dot ${icono.clase}`}>{icono.simbolo}</span>
                        <p className="cc-activity-text">{item.texto}</p>
                        <span className="cc-activity-time">{item.tiempo}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </aside>
          </div>
          </>
          )}

          {vistaActiva === 'aprobacion-eventos' && (
            <AprobacionEventos
              alRevisar={(id) => console.log('Revisar evento', id)}
              alValidar={(id) => console.log('Validar evento', id)}
              alEditar={(id) => console.log('Editar evento', id)}
              alRechazar={(id) => console.log('Rechazar evento', id)}
              alDescargarFicha={(id) => console.log('Descargar ficha', id)}
            />
          )}

          {vistaActiva === 'crear-ficha' && (
            <>
              {etapaFicha === 1 && (
                <FichaEventoEtapa1
                  nombreActividad={nombreActividad}
                  setNombreActividad={setNombreActividad}
                  alAvanzar={() => setEtapaFicha(2)}
                  alCancelar={() => seleccionarVista('inicio')}
                />
              )}
              {etapaFicha === 2 && (
                <FichaEventoEtapa2
                  nombreActividad={nombreActividad}
                  setNombreActividad={setNombreActividad}
                  alAvanzar={() => setEtapaFicha(3)}
                  alRetroceder={() => setEtapaFicha(1)}
                />
              )}
              {etapaFicha === 3 && (
                <FichaEventoEtapa3
                  alFinalizar={() => {
                    setEtapaFicha(1);
                    seleccionarVista('inicio');
                  }}
                  alRetroceder={() => setEtapaFicha(2)}
                />
              )}
            </>
          )}

          {vistaActiva === 'crear-constancia' && (
            <CrearConstancia
              alGenerar={(payload) => console.log('Constancia enviada:', payload)}
              alVisualizar={(payload) => console.log('Vista previa:', payload)}
            />
          )}

          {MODULOS_ADMIN[vistaActiva] && (
            <CrudAdmin key={vistaActiva} config={MODULOS_ADMIN[vistaActiva]} />
          )}

          {vistaActiva === 'aprobacion-profesores' && <AprobacionProfesores />}

          {vistaActiva === 'mis-constancias' && (
            <CrudAdmin key="mis-constancias" config={CONFIG_CONSTANCIAS} />
          )}

          {!['inicio', 'aprobacion-eventos', 'crear-ficha', 'crear-constancia', 'aprobacion-profesores', 'mis-constancias'].includes(vistaActiva) &&
            !MODULOS_ADMIN[vistaActiva] && (
            <div className="cc-placeholder">
              <span className="cc-placeholder-icon">🚧</span>
              <h2>Sección en construcción</h2>
              <p>Este módulo estará disponible próximamente.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CentroControl;
