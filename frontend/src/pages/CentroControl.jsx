import { useState } from 'react';
import AprobacionEventos from './AprobacionEventos';
import CrearConstancia from './CrearConstancia';
import AprobacionProfesores from './AprobacionProfesores';
import CrudAdmin from './CrudAdmin';
import { MODULOS_ADMIN, CONFIG_CONSTANCIAS } from './adminModulos';
import { SERVICIO_CONSTANCIAS } from '../services/constanciasService';
import { generarConstanciaPDF } from '../utils/generarConstanciaPDF';
import { generarFichaPDF } from '../utils/generarFichaPDF';
import { generarInformePDF } from '../utils/generarInformePDF';
import {
  obtenerUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
} from '../services/usuariosService';
import FichaEventoEtapa1 from '../components/FichaEventoEtapa1';
import FichaEventoEtapa2 from '../components/FichaEventoEtapa2';
import FichaEventoEtapa3 from '../components/FichaEventoEtapa3';
import FichaTecnicaVista from '../components/FichaTecnicaVista';
import ConfigFirmas from './ConfigFirmas';
import './CentroControl.css';

/* ============================================================
   DATOS POR DEFECTO (replican la imagen del Centro de Control)
   Todo es parametrizable por props para que el panel sea modular.
   ============================================================ */
// Servicio real de Usuarios para el módulo de Administración (referencia estable).
const SERVICIO_USUARIOS = {
  obtener: () => obtenerUsuarios(),
  crear: (d) => crearUsuario(d),
  actualizar: (id, d) => actualizarUsuario(id, d),
  eliminar: (id) => eliminarUsuario(id),
};

const METRICAS_DEFAULT = {
  profesores: 0,
  fichas: 0,
  constancias: 0,
};

// Eventos del calendario (vacío: se llena desde el backend). tipo: 'concluido' | 'pendiente'
const EVENTOS_DEFAULT = {};

const ACCESOS_DEFAULT = [
  'Validar Profesores Pendientes',
  'Validar Fichas de Eventos',
  'Descargar Reportes de Cierre',
];

// Actividad reciente (vacío: se llena desde el backend).
const ACTIVIDAD_DEFAULT = [];

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
  { clave: 'config-firmas', etiqueta: 'Firmas de Documentos' },
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
  fichas = [],
  agregarFicha = () => {},
  validarFicha = () => {},
  actualizarFicha = () => {},
  guardarPrograma = () => {},
  guardarInforme = () => {},
  rechazarFicha = () => {},
  alNavegar = () => {},
  alAccesoDirecto = () => {},
  alCerrarSesion = () => {},
}) => {
  const [vistaActiva, setVistaActiva] = useState('inicio');
  const [menuUsuario, setMenuUsuario] = useState(false);
  const [mes, setMes] = useState(mesInicial);
  const [anio, setAnio] = useState(anioInicial);
  // Flujo de la Ficha de Evento (3 etapas) reutilizado del portal docente
  const [etapaFicha, setEtapaFicha] = useState(1);
  const [nombreActividad, setNombreActividad] = useState('');
  const [borradorFicha, setBorradorFicha] = useState(null);
  // Ficha en revisión (solo lectura) o en edición por el coordinador.
  const [fichaRevision, setFichaRevision] = useState(null);
  const [fichaEdicion, setFichaEdicion] = useState(null);
  // Etapa activa dentro del asistente de edición (1, 2 o 3).
  const [etapaEdicion, setEtapaEdicion] = useState(1);

  // Adapta las fichas del almacén al formato que espera Aprobación de Eventos.
  const eventosParaAprobacion = fichas.map((f) => ({
    id: f.id,
    evento: f.nombre,
    carrera: f.carrera,
    extension: null,
    periodo: f.cuatrimestre,
    docente: f.docente,
    etapa1: f.etapa1,
    etapa2: f.etapa2?.estado === 'finalizado' ? 'validado' : (f.etapa2?.estado || 'pendiente'),
    etapa3: f.etapa3?.estado || 'pendiente',
    fecha: f.fecha,
    hora: f.hora,
  }));
  // Folio único que enlaza la Etapa 1 con la Etapa 3
  const [folio, setFolio] = useState(() => `UPB-FT-2026-${Math.floor(1000 + Math.random() * 9000)}`);

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
        <div className="cc-brand">
          <img
            src="/img/logo-blanco-horizontal@2x.png"
            alt="UPB · SRAA"
            className="cc-brand-logo"
          />
        </div>

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
            <img
              src="/img/logo-horizontal-upb@2x.png"
              alt="Universidad Politécnica de Bacalar"
              className="cc-header-logo-img"
            />
            <span className="cc-header-univ">UNIVERSIDAD POLITÉCNICA DE BACALAR</span>
          </div>
          <div className="cc-header-actions">
            <div className="cc-user-menu-wrap">
              <button
                type="button"
                className="cc-user-badge"
                onClick={() => setMenuUsuario((v) => !v)}
                aria-haspopup="true"
                aria-expanded={menuUsuario}
              >
                <span className="cc-user-initials">{iniciales}</span>
                <span className="cc-user-name">{usuario.nombre}</span>
                <span className={`cc-user-arrow ${menuUsuario ? 'abierto' : ''}`}>▾</span>
              </button>

              {menuUsuario && (
                <>
                  <div className="cc-user-backdrop" onClick={() => setMenuUsuario(false)} />
                  <div className="cc-user-dropdown" role="menu">
                    <div className="cc-user-dropdown-head">
                      <span className="cc-user-dropdown-avatar">{iniciales}</span>
                      <div>
                        <strong>{usuario.nombre}</strong>
                        {usuario.correo && <span className="cc-user-dropdown-mail">{usuario.correo}</span>}
                        {usuario.rol && <span className="cc-user-dropdown-rol">{usuario.rol}</span>}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="cc-user-dropdown-item"
                      onClick={() => { setMenuUsuario(false); seleccionarVista('config-firmas'); }}
                    >
                      ✍️ Firmas de Documentos
                    </button>
                    <button
                      type="button"
                      className="cc-user-dropdown-item cc-user-dropdown-salir"
                      onClick={() => { setMenuUsuario(false); alCerrarSesion(); }}
                    >
                      ⎋ Cerrar sesión
                    </button>
                  </div>
                </>
              )}
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
              datosEventos={eventosParaAprobacion}
              alRevisar={(id) => {
                setFichaRevision(fichas.find((f) => f.id === id) || null);
                setVistaActiva('revisar-ficha');
              }}
              alValidar={(id) => validarFicha(id)}
              alEditar={(id) => {
                const f = fichas.find((x) => x.id === id);
                if (!f) return;
                setFichaEdicion(f);
                setFolio(f.folio || '');
                setNombreActividad(f.nombre || '');
                setEtapaEdicion(1);
                setVistaActiva('editar-ficha');
              }}
              alRechazar={(id) => rechazarFicha(id)}
              alDescargarFicha={(id) => generarFichaPDF(fichas.find((f) => f.id === id))}
              alDescargarInforme={(id) => generarInformePDF(fichas.find((f) => f.id === id))}
            />
          )}

          {vistaActiva === 'revisar-ficha' && (
            <FichaTecnicaVista
              ficha={fichaRevision}
              alVolver={() => setVistaActiva('aprobacion-eventos')}
            />
          )}

          {vistaActiva === 'editar-ficha' && fichaEdicion && (
            <>
              {etapaEdicion === 1 && (
                <FichaEventoEtapa1
                  folio={folio}
                  setFolio={setFolio}
                  nombreActividad={nombreActividad}
                  setNombreActividad={setNombreActividad}
                  datosIniciales={fichaEdicion?.tecnica}
                  textoBoton="Guardar"
                  alGuardar={(datos) => {
                    actualizarFicha(fichaEdicion.id, datos);
                    setEtapaEdicion(2);
                  }}
                  alCancelar={() => { setEtapaEdicion(1); setVistaActiva('aprobacion-eventos'); }}
                />
              )}
              {etapaEdicion === 2 && (
                <FichaEventoEtapa2
                  nombreActividad={nombreActividad}
                  datosIniciales={{ itinerario: fichaEdicion?.programa }}
                  textoBoton="Guardar"
                  alAvanzar={(datosE2) => {
                    guardarPrograma(fichaEdicion.id, datosE2.itinerario);
                    setEtapaEdicion(3);
                  }}
                  alRetroceder={() => setEtapaEdicion(1)}
                />
              )}
              {etapaEdicion === 3 && (
                <FichaEventoEtapa3
                  ficha={fichaEdicion}
                  folio={fichaEdicion?.folio || folio}
                  textoBoton="Guardar"
                  alGuardarInforme={(id, datos) => guardarInforme(id, datos)}
                  alFinalizar={() => { setEtapaEdicion(1); setVistaActiva('aprobacion-eventos'); }}
                  alRetroceder={() => setEtapaEdicion(2)}
                />
              )}
            </>
          )}

          {vistaActiva === 'informe-evento' && (
            <div className="cc-descargas-workspace">
              <div className="ap-title-section">
                <h1>Descargar Informe de Evento</h1>
                <p className="cc-descargas-sub">
                  Informes de Actividades Académicas de los eventos ya finalizados.
                </p>
              </div>
              <div className="ap-tabla-card">
                <table className="ap-tabla cc-tabla-descargas">
                  <thead>
                    <tr>
                      <th className="ap-col-num">N°</th>
                      <th>Folio</th>
                      <th>Evento Académico</th>
                      <th>Programa Educativo</th>
                      <th>Docente</th>
                      <th>Etapa 3</th>
                      <th>Fecha</th>
                      <th className="ap-col-accion">Descarga</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fichas.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="ap-fila-vacia">
                          Aún no hay eventos registrados.
                        </td>
                      </tr>
                    ) : (
                      fichas.map((f, i) => {
                        const finalizado = f.etapa3?.estado === 'finalizado';
                        return (
                          <tr key={f.id}>
                            <td className="ap-col-num">{i + 1}</td>
                            <td>{f.folio || '—'}</td>
                            <td><strong>{f.nombre}</strong></td>
                            <td>{f.carrera || '—'}</td>
                            <td>{f.docente?.nombre || '—'}</td>
                            <td>
                              {finalizado ? (
                                <span className="ap-chip ap-chip-validado">✔ Finalizado</span>
                              ) : (
                                <span className="ap-chip ap-chip-pendiente">⧗ Pendiente</span>
                              )}
                            </td>
                            <td>{f.fecha}</td>
                            <td className="ap-col-accion">
                              <button
                                type="button"
                                className={`cc-btn-descarga ${finalizado ? '' : 'cc-btn-descarga-off'}`}
                                disabled={!finalizado}
                                onClick={() => generarInformePDF(f)}
                                title={finalizado ? 'Descargar Informe de Actividades' : 'El informe aún no se completa'}
                              >
                                📑 Descargar Informe
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {vistaActiva === 'crear-ficha' && (
            <>
              {etapaFicha === 1 && (
                <FichaEventoEtapa1
                  folio={folio}
                  setFolio={setFolio}
                  nombreActividad={nombreActividad}
                  setNombreActividad={setNombreActividad}
                  alAvanzar={(datos) => { setBorradorFicha(datos); setEtapaFicha(2); }}
                  alCancelar={() => seleccionarVista('inicio')}
                />
              )}
              {etapaFicha === 2 && (
                <FichaEventoEtapa2
                  nombreActividad={nombreActividad}
                  setNombreActividad={setNombreActividad}
                  alAvanzar={(datosE2) => { agregarFicha(borradorFicha, datosE2); seleccionarVista('aprobacion-eventos'); }}
                  alRetroceder={() => setEtapaFicha(1)}
                />
              )}
              {etapaFicha === 3 && (
                <FichaEventoEtapa3
                  folio={folio}
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
              emisor={usuario.nombre}
              alGenerar={(payload) => console.log('Constancia enviada:', payload)}
              alVisualizar={(payload) => console.log('Vista previa:', payload)}
            />
          )}

          {MODULOS_ADMIN[vistaActiva] && (
            vistaActiva === 'usuarios' ? (
              <CrudAdmin key="usuarios" servicio={SERVICIO_USUARIOS} config={MODULOS_ADMIN.usuarios} />
            ) : (
              <CrudAdmin key={vistaActiva} tipo={vistaActiva} config={MODULOS_ADMIN[vistaActiva]} />
            )
          )}

          {vistaActiva === 'aprobacion-profesores' && <AprobacionProfesores />}

          {vistaActiva === 'config-firmas' && <ConfigFirmas />}

          {vistaActiva === 'mis-constancias' && (
            <CrudAdmin
              key="mis-constancias"
              servicio={SERVICIO_CONSTANCIAS}
              config={CONFIG_CONSTANCIAS}
              alDescargar={(c) =>
                generarConstanciaPDF({
                  tipo: c.tipo || 'Constancia',
                  evento: c.titulo || '',
                  fecha: c.fecha || '',
                  texto: c.descripcion || '',
                  destinatarios: [c.destinatario || ''],
                })
              }
            />
          )}

          {!['inicio', 'aprobacion-eventos', 'crear-ficha', 'revisar-ficha', 'editar-ficha', 'informe-evento', 'crear-constancia', 'aprobacion-profesores', 'mis-constancias', 'config-firmas'].includes(vistaActiva) &&
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
