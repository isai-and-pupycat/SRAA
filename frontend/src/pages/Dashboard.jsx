import '../Dashboard.css';

const Dashboard = ({ alClickCrearFicha }) => {
  return (
    /* 🚀 REJILLA PRINCIPAL DE 3 COLUMNAS MOCKUP FIEL */
    <div className="dashboard-three-column-grid">
      
      {/* ================= COLUMNA 1: MI ACTIVIDAD ================= */}
      <section className="col-left-activity">
        <div className="activity-panel-card">
          <span className="panel-section-title">MI ACTIVIDAD</span>
          
          <div className="metric-vertical-card border-blue">
            <span className="m-num">12</span>
            <span className="m-label">EVENTOS REGISTRADOS</span>
          </div>
          
          <div className="metric-vertical-card border-green">
            <span className="m-num">08</span>
            <span className="m-label">AUTORIZADOS EN CALENDAR</span>
          </div>
          
          <div className="metric-vertical-card border-orange">
            <span className="m-num">04</span>
            <span className="m-label">EN REVISIÓN</span>
          </div>
        </div>
      </section>

      {/* ================= COLUMNA 2: CORE CENTRAL ================= */}
      <section className="col-center-core">
        
        {/* FILA SUPERIOR: SINOPSIS DE FICHAS Y CONSTANCIAS */}
        <div className="mini-stats-row">
          <div className="mini-stat-box">
            <span className="stat-icon">📄</span>
            <div className="stat-info">
              <strong>08</strong>
              <span>FICHAS LIBERADAS</span>
            </div>
          </div>
          <div className="mini-stat-box">
            <span className="stat-icon">⏳</span>
            <div className="stat-info">
              <strong>04</strong>
              <span>SOLICITUDES PENDIENTES</span>
            </div>
          </div>
          <div className="mini-stat-box">
            <span className="stat-icon">🏅</span>
            <div className="stat-info">
              <strong>15</strong>
              <span>CONSTANCIAS EMITIDAS</span>
            </div>
          </div>
        </div>

        {/* El Calendario de Rejilla Central */}
        <div className="calendar-grid-container">
          <div className="calendar-nav-header">
            <button className="cal-arrow">&lt;</button>
            <span className="cal-month">MAYO 2026</span>
            <button className="cal-arrow">&gt;</button>
          </div>

          <div className="calendar-weekdays">
            <span>LUN</span><span>MAR</span><span>MIÉ</span><span>JUE</span><span>VIE</span><span>SÁB</span><span>DOM</span>
          </div>

          <div className="calendar-cells-grid">
            {/* Fila 1 */}
            <div className="c-cell muted"><span className="n">27</span></div>
            <div className="c-cell muted"><span className="n">28</span></div>
            <div className="c-cell muted"><span className="n">29</span></div>
            <div className="c-cell muted"><span className="n">30</span></div>
            <div className="c-cell"><span className="n">1</span></div>
            <div className="c-cell"><span className="n">2</span></div>
            <div className="c-cell"><span className="n">3</span></div>

            {/* Fila 2 */}
            <div className="c-cell"><span className="n">4</span></div>
            <div className="c-cell has-tag">
              <span className="n">5</span>
              <div className="c-tag tag-green">Taller Arduino</div>
            </div>
            <div className="c-cell"><span className="n">6</span></div>
            <div className="c-cell"><span className="n">7</span></div>
            <div className="c-cell"><span className="n">8</span></div>
            <div className="c-cell"><span className="n">9</span></div>
            <div className="c-cell"><span className="n">10</span></div>

            {/* Fila 3 */}
            <div className="c-cell"><span className="n">11</span></div>
            <div className="c-cell"><span className="n">12</span></div>
            <div className="c-cell"><span className="n">13</span></div>
            <div className="c-cell"><span className="n">14</span></div>
            <div className="c-cell has-tag">
              <span className="n">15</span>
              <div className="c-tag tag-yellow">Evidencia Clase</div>
            </div>
            <div className="c-cell"><span className="n">16</span></div>
            <div className="c-cell"><span className="n">17</span></div>

            {/* Fila 4 */}
            <div className="c-cell"><span className="n">18</span></div>
            <div className="c-cell"><span className="n">19</span></div>
            <div className="c-cell has-tag">
              <span className="n">20</span>
              <div className="c-tag tag-green">Lab. Redes</div>
            </div>
            <div className="c-cell"><span className="n">21</span></div>
            <div className="c-cell"><span className="n">22</span></div>
            <div className="c-cell"><span className="n">23</span></div>
            <div className="c-cell"><span className="n">24</span></div>
          </div>

          <div className="calendar-legend-bottom">
            <span className="leg"><span className="dot d-green"></span> Autorizado en Google Calendar</span>
            <span className="leg"><span className="dot d-yellow"></span> Pendiente de Validación</span>
          </div>
        </div>

      </section>

      {/* ================= COLUMNA 3: RECURSOS Y ACTIVIDAD ================= */}
      <section className="col-right-resources">
        
        {/* Caja de Formatos y Descargas */}
        <div className="resources-card">
          <span className="panel-section-title">FORMATOS Y DESCARGAS</span>
          
          <div className="download-item-row">
            <div className="item-icon-title-pair">
              <span className="file-icon red-pdf">📄</span>
              <div className="file-meta">
                <strong>Lista de Asistencia</strong>
                <span>Formato PDF oficial para recolección de firmas físicas en el aula.</span>
              </div>
            </div>
            <button className="btn-download-action" onClick={alClickCrearFicha}>
              ➕ Crear Nueva Ficha de Evento
            </button>
          </div>

          <div className="download-item-row">
            <div className="item-icon-title-pair">
              <span className="file-icon green-badge">🏅</span>
              <div className="file-meta">
                <strong>Mis Constancias</strong>
                <span>Baja los certificados PDF de tus conferencias magistrales validadas.</span>
              </div>
            </div>
            <button className="btn-download-action">⚙️ Obtener Constancias</button>
          </div>
        </div>

        {/* Caja de Actividad Reciente Scrollable */}
        <div className="resources-card activity-log-card">
          <span className="panel-section-title icon-title">
            <span className="bell-log-icon">🔔</span> Actividad Reciente
          </span>
          
          <div className="scrollable-activity-list">
            <div className="log-item-row">
              <span className="log-dot dot-blue">✅</span>
              <div className="log-text-content">
                <strong>Ficha Técnica Autorizada</strong>
                <p>El coordinador institucional aprobó los detalles finales de tu "Taller de Arduino Uno".</p>
                <span className="log-time">Hace 15 minutos</span>
              </div>
            </div>

            <div className="log-item-row">
              <span className="log-dot dot-orange">⚠️</span>
              <div className="log-text-content">
                <strong>Ficha Técnica Devuelta</strong>
                <p>Has solicitado correcciones en la ficha "ARTMOSFERA 2026".</p>
                <span className="log-time">Hace 2 horas</span>
              </div>
            </div>

            <div className="log-item-row">
              <span className="log-dot dot-green">🏅</span>
              <div className="log-text-content">
                <strong>Constancias Disponibles</strong>
                <p>Se liberaron los PDF de participación correspondientes al "Laboratorio de Redes Cisco".</p>
                <span className="log-time">Ayer</span>
              </div>
            </div>
          </div>
        </div>

      </section>

    </div>
  );
};

export default Dashboard;
