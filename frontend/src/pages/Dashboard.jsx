import { useState } from 'react';
import '../Dashboard.css';

const NOMBRE_MES = [
  'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
  'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE',
];

// dd/mm/aaaa -> { d, m, a }
const parseFecha = (str) => {
  if (!str || !str.includes('/')) return null;
  const [d, m, a] = str.split('/').map((n) => parseInt(n, 10));
  if (!d || !m || !a) return null;
  return { d, m, a };
};

// Construye las celdas del mes (lunes primero), con días del mes anterior/siguiente en gris.
const construirCeldas = (anio, mes) => {
  const primerDia = new Date(anio, mes, 1).getDay(); // 0=Dom..6=Sáb
  const offset = (primerDia + 6) % 7; // lunes = 0
  const diasEnMes = new Date(anio, mes + 1, 0).getDate();
  const diasMesPrev = new Date(anio, mes, 0).getDate();

  const celdas = [];
  for (let i = offset; i > 0; i -= 1) celdas.push({ dia: diasMesPrev - i + 1, muted: true });
  for (let d = 1; d <= diasEnMes; d += 1) celdas.push({ dia: d, muted: false });
  let sig = 1;
  while (celdas.length % 7 !== 0) celdas.push({ dia: sig++, muted: true });
  return celdas;
};

const Dashboard = ({ fichas = [], alClickCrearFicha = () => {}, alClickConstancias = () => {} }) => {
  const hoy = new Date();
  const [mes, setMes] = useState(hoy.getMonth());
  const [anio, setAnio] = useState(hoy.getFullYear());

  // Métricas reales a partir de las fichas del docente.
  const total = fichas.length;
  const validados = fichas.filter((f) => f.etapa1 === 'validado').length;
  const enRevision = fichas.filter((f) => f.etapa1 !== 'validado').length;

  // Eventos del mes visible, indexados por día.
  const eventosDelMes = {};
  fichas.forEach((f) => {
    const p = parseFecha(f.fecha);
    if (p && p.m === mes + 1 && p.a === anio) {
      (eventosDelMes[p.d] = eventosDelMes[p.d] || []).push({
        nombre: f.nombre,
        validado: f.etapa1 === 'validado',
      });
    }
  });

  const celdas = construirCeldas(anio, mes);

  const mesAnterior = () => {
    if (mes === 0) { setMes(11); setAnio(anio - 1); } else setMes(mes - 1);
  };
  const mesSiguiente = () => {
    if (mes === 11) { setMes(0); setAnio(anio + 1); } else setMes(mes + 1);
  };

  return (
    <div className="dashboard-three-column-grid">

      {/* ============ COLUMNA 1: MI ACTIVIDAD (datos reales) ============ */}
      <section className="col-left-activity">
        <div className="activity-panel-card">
          <span className="panel-section-title">MI ACTIVIDAD</span>

          <div className="metric-vertical-card border-blue">
            <span className="m-num">{total}</span>
            <span className="m-label">EVENTOS REGISTRADOS</span>
          </div>

          <div className="metric-vertical-card border-green">
            <span className="m-num">{validados}</span>
            <span className="m-label">EVENTOS VALIDADOS</span>
          </div>

          <div className="metric-vertical-card border-orange">
            <span className="m-num">{enRevision}</span>
            <span className="m-label">EN REVISIÓN</span>
          </div>
        </div>
      </section>

      {/* ============ COLUMNA 2: CALENDARIO (funcional) ============ */}
      <section className="col-center-core">
        <div className="calendar-grid-container">
          <div className="calendar-nav-header">
            <button type="button" className="cal-arrow" onClick={mesAnterior}>&lt;</button>
            <span className="cal-month">{NOMBRE_MES[mes]} {anio}</span>
            <button type="button" className="cal-arrow" onClick={mesSiguiente}>&gt;</button>
          </div>

          <div className="calendar-weekdays">
            <span>LUN</span><span>MAR</span><span>MIÉ</span><span>JUE</span><span>VIE</span><span>SÁB</span><span>DOM</span>
          </div>

          <div className="calendar-cells-grid">
            {celdas.map((celda, i) => {
              const eventos = !celda.muted ? (eventosDelMes[celda.dia] || []) : [];
              return (
                <div
                  key={i}
                  className={`c-cell ${celda.muted ? 'muted' : ''} ${eventos.length ? 'has-tag' : ''}`}
                >
                  <span className="n">{celda.dia}</span>
                  {eventos.slice(0, 2).map((ev, k) => (
                    <div key={k} className={`c-tag ${ev.validado ? 'tag-green' : 'tag-yellow'}`} title={ev.nombre}>
                      {ev.nombre}
                    </div>
                  ))}
                  {eventos.length > 2 && (
                    <div className="c-tag tag-yellow">+{eventos.length - 2} más</div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="calendar-legend-bottom">
            <span className="leg"><span className="dot d-green"></span> Validado por el coordinador</span>
            <span className="leg"><span className="dot d-yellow"></span> Pendiente de validación</span>
          </div>
        </div>
      </section>

      {/* ============ COLUMNA 3: ACCIONES ============ */}
      <section className="col-right-resources">
        <div className="resources-card">
          <span className="panel-section-title">FORMATOS Y DESCARGAS</span>

          <div className="download-item-row">
            <div className="item-icon-title-pair">
              <span className="file-icon red-pdf">📄</span>
              <div className="file-meta">
                <strong>Ficha de Evento</strong>
                <span>Registra una nueva actividad académica y envíala al coordinador.</span>
              </div>
            </div>
            <button type="button" className="btn-download-action" onClick={alClickCrearFicha}>
              ➕ Crear Nueva Ficha de Evento
            </button>
          </div>

          <div className="download-item-row">
            <div className="item-icon-title-pair">
              <span className="file-icon green-badge">🏅</span>
              <div className="file-meta">
                <strong>Mis Constancias</strong>
                <span>Consulta y descarga las constancias emitidas a tu nombre.</span>
              </div>
            </div>
            <button type="button" className="btn-download-action" onClick={alClickConstancias}>
              🏅 Ver Mis Constancias
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Dashboard;
