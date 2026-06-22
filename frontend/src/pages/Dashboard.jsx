import React, { useState } from 'react';
import '../Dashboard.css';

const Dashboard = () => {
  const [docente] = useState({
    nombre: 'Ing. Isai Rosas Canto',
    iniciales: 'IC'
  });

  // Datos de control interno para el flujo de fichas del SRAA
  const [fichasRecientes] = useState([
    { id: 'F-025', nombre: 'Taller de Arduino Uno', fecha: '15/06/2026', estado: 'Autorizado' },
    { id: 'F-026', nombre: 'Laboratorio de Redes Cisco', fecha: '20/06/2026', estado: 'En Revisión' },
    { id: 'F-027', nombre: 'Seminario Sistemas Distribuidos', fecha: '22/06/2026', estado: 'Pendiente' },
  ]);

  return (
    <div className="dashboard-layout">
      
      {/* 1. SIDEBAR MENÚ (Identidad Institucional SRAA) */}
      <aside className="sidebar">
        <div className="sidebar-brand">SRAA</div>
        <ul className="sidebar-menu">
          <li className="sidebar-item active">
            <i className="fa-solid fa-house"></i> Inicio
          </li>
          <li className="sidebar-item">
            <i className="fa-solid fa-file-signature"></i> Fichas de Eventos
          </li>
          <li className="sidebar-item">
            <i className="fa-solid fa-award"></i> Mis constancias
          </li>
          <li className="sidebar-item">
            <i className="fa-solid fa-list-ul"></i> Listado de eventos
          </li>
        </ul>
      </aside>

      {/* 2. ÁREA OPERATIVA PRINCIPAL */}
      <main className="main-content">
        
        {/* HEADER SUPERIOR */}
        <header className="header-top">
          <div className="header-title">
            <h1>Portal docente - SRAA</h1>
            <span>Panel de Control</span>
          </div>
          <div className="user-profile">
            <div className="user-avatar">{docente.iniciales}</div>
            {docente.nombre}
            <i className="fa-solid fa-chevron-down" style={{ fontSize: '0.75rem', color: '#a0aec0' }}></i>
          </div>
        </header>

        {/* WORKSPACE (Ajustado al 100% de la pantalla) */}
        <div className="workspace">
          
          {/* CONTROL DE TRÁMITES EN TARJETAS RÁPIDAS */}
          <div className="metrics-row">
            <div className="card-metric blue">
              <div>
                <p className="value">03</p>
                <p className="label">Fichas Generadas</p>
              </div>
              <div className="icon-box"><i className="fa-solid fa-folder-open"></i></div>
            </div>
            <div className="card-metric orange">
              <div>
                <p className="value">01</p>
                <p className="label">En Revisión / Cambios</p>
              </div>
              <div className="icon-box"><i className="fa-solid fa-triangle-exclamation"></i></div>
            </div>
            <div className="card-metric green">
              <div>
                <p className="value">01</p>
                <p className="label">Constancias Emitidas</p>
              </div>
              <div className="icon-box"><i className="fa-solid fa-file-circle-check"></i></div>
            </div>
          </div>

          {/* BARRA DE BÚSQUEDA Y ACCIÓN DE REGISTRO */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
            <div style={{ display: 'flex', gap: '10px', width: '40%' }}>
              <input 
                type="text" 
                placeholder="Buscar por folio o nombre del evento..." 
                style={{ padding: '10px 15px', borderRadius: '8px', border: '1px solid #e2e8f0', width: '100%', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>
            <button className="btn-ingresar" style={{ width: 'auto', padding: '10px 20px', marginTop: 0 }}>
              <i className="fa-solid fa-plus" style={{ marginRight: '8px' }}></i> Crear Nueva Ficha Técnica
            </button>
          </div>

          {/* GRID OPERATIVO (Historial + Retroalimentación) */}
          <div className="dashboard-grid">
            
            {/* PANEL IZQUIERDO: SEGUIMIENTO DE REQUISITOS */}
            <div className="panel-box">
              <h3>Estatus de Fichas Técnicas</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                <thead>
                  <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#4a5568', fontSize: '0.85rem' }}>Folio</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#4a5568', fontSize: '0.85rem' }}>Nombre del Evento</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#4a5568', fontSize: '0.85rem' }}>Registro</th>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#4a5568', fontSize: '0.85rem' }}>Estado</th>
                    <th style={{ padding: '12px', textAlign: 'center', color: '#4a5568', fontSize: '0.85rem' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {fichasRecientes.map((ficha) => (
                    <tr key={ficha.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                      <td style={{ padding: '14px 12px', fontWeight: 'bold', fontSize: '0.9rem' }}>{ficha.id}</td>
                      <td style={{ padding: '14px 12px', fontSize: '0.9rem' }}>{ficha.nombre}</td>
                      <td style={{ padding: '14px 12px', fontSize: '0.9rem', color: '#718096' }}>{ficha.fecha}</td>
                      <td style={{ padding: '14px 12px' }}>
                        <span className={`event-tag ${ficha.estado === 'Autorizado' ? 'green' : ficha.estado === 'En Revisión' ? 'blue' : 'yellow'}`} style={{ padding: '4px 10px', borderRadius: '20px' }}>
                          {ficha.estado}
                        </span>
                      </td>
                      <td style={{ padding: '14px 12px', textAlign: 'center' }}>
                        <button style={{ background: 'none', border: 'none', color: '#0072ff', cursor: 'pointer', marginRight: '12px' }} title="Ver Detalles">
                          <i className="fa-solid fa-eye"></i>
                        </button>
                        {ficha.estado === 'Autorizado' && (
                          <button style={{ background: 'none', border: 'none', color: '#2ed573', cursor: 'pointer' }} title="Descargar Constancia Firmada (PDF)">
                            <i className="fa-solid fa-file-pdf"></i>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PANEL DERECHO: NOTAS DE COORDINACIÓN */}
            <div className="panel-box">
              <h3>Avisos del Coordinador</h3>
              <div className="activity-list">
                <div className="activity-card orange" style={{ borderRadius: '8px', borderLeftWidth: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#ffa502' }}>F-026 (Observaciones)</span>
                    <span style={{ fontSize: '0.75rem', color: '#a0aec0' }}>Hoy</span>
                  </div>
                  <p className="txt" style={{ margin: 0, fontSize: '0.85rem', lineHeight: '1.4' }}>
                    "Falta la firma física del jefe de grupo en el documento de control. Adjuntar escaneo nuevo para liberación."
                  </p>
                </div>

                <div className="activity-card green" style={{ borderRadius: '8px', borderLeftWidth: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#2ed573' }}>F-025 (Liberada)</span>
                    <span style={{ fontSize: '0.75rem', color: '#a0aec0' }}>Ayer</span>
                  </div>
                  <p className="txt" style={{ margin: 0, fontSize: '0.85rem', lineHeight: '1.4' }}>
                    La constancia institucional ha sido firmada digitalmente. Disponible para descarga.
                  </p>
                </div>
              </div>
            </div>

          </div> {/* Fin de dashboard-grid */}
        </div> {/* Fin de workspace */}

        {/* FOOTER */}
        <footer className="footer-upb">
          <strong>UNIVERSIDAD POLITÉCNICA DE BACALAR</strong><br />
          Avenida 39, REG 12 MZ 325 LT 1 entre calle 56 y 46-A, C.P. 77930, Bacalar, Q.Roo. Tel: 983 128 1591 | Protección de Datos Personales
        </footer>

      </main>
    </div>
  );
};

export default Dashboard;