import { useState } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FichaEventoEtapa1 from './components/FichaEventoEtapa1';
import FichaEventoEtapa2 from './components/FichaEventoEtapa2';
import FichaEventoEtapa3 from './components/FichaEventoEtapa3';
import Accesos from './pages/Accesos';

import './App.css';
import './Dashboard.css';

function App() {
  const [vistaActual, setVistaActual] = useState('enlaces');
  const [usuarioActual, setUsuarioActual] = useState(null);

  const cambiarVista = (nuevaVista) => {
    setVistaActual(nuevaVista);
    window.scrollTo(0, 0);
  };

  if (vistaActual === 'enlaces') {
    return <Accesos alIrALogin={() => cambiarVista('login')} />;
  }

  if (vistaActual === 'login') {
    return (
      <div className="sraa-login-wrapper-debug">
        <Login
          alIngresar={(usuario) => {
            setUsuarioActual(usuario);
            cambiarVista('dashboard');
          }}
          alIrAEnlaces={() => cambiarVista('enlaces')}
        />
      </div>
    );
  }

  return (
    <div className="sraa-layout-container">
      <aside className="sraa-sidebar">
        <div className="sidebar-brand">
          <img
            src="/img/logo-blanco-horizontal@2x.png"
            alt="SRAA"
            style={{ width: '150px', height: 'auto', display: 'block' }}
          />
        </div>
        <nav className="sidebar-nav">
          <a
            className={`nav-item ${vistaActual === 'dashboard' ? 'active' : ''}`}
            href="#inicio"
            onClick={(e) => { e.preventDefault(); cambiarVista('dashboard'); }}
          >
            Inicio
          </a>
          <a
            className={`nav-item ${vistaActual.startsWith('etapa') ? 'active' : ''}`}
            href="#fichas"
            onClick={(e) => { e.preventDefault(); cambiarVista('etapa1'); }}
          >
            Fichas de Eventos
          </a>
          <a
            className="nav-item"
            href="#constancias"
            onClick={(e) => { e.preventDefault(); }}
          >
            Mis constancias
          </a>
          <a
            className="nav-item"
            href="#listado-eventos"
            onClick={(e) => { e.preventDefault(); }}
          >
            Listado de eventos
          </a>
        </nav>
      </aside>

      <main className="sraa-main-wrapper">
        <header className="sraa-header-bar">
          <div className="header-left-institution">
            <div className="upb-logo-placeholder">
              <img
                src="/img/logo-horizontal-upb@2x.png"
                alt="UPB"
                style={{ height: '40px', width: 'auto', display: 'block' }}
              />
            </div>
            <div className="header-titles">
              <h1>Bienvenido</h1>
              <span className="welcome-tag">
                {usuarioActual?.nombre || 'Usuario del sistema'}
              </span>
            </div>
          </div>

          <div className="header-user-actions">
            <div className="user-badge" aria-label="Perfil del usuario">
              <span className="user-initials">
                {(usuarioActual?.nombre || 'Usuario')
                  .split(' ')
                  .map((parte) => parte[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase()}
              </span>
              <span className="user-name">{usuarioActual?.nombre || 'Perfil de usuario'}</span>
              <span className="arrow-down">v</span>
            </div>
            <button
              type="button"
              className="btn-header-login"
              onClick={() => cambiarVista('login')}
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        <div className="sraa-dynamic-content-body">
          {vistaActual === 'dashboard' && (
            <Dashboard alClickCrearFicha={() => cambiarVista('etapa1')} />
          )}
          {vistaActual === 'etapa1' && (
            <FichaEventoEtapa1
              alAvanzar={() => cambiarVista('etapa2')}
              alCancelar={() => cambiarVista('dashboard')}
            />
          )}
          {vistaActual === 'etapa2' && (
            <FichaEventoEtapa2
              alAvanzar={() => cambiarVista('etapa3')}
              alRetroceder={() => cambiarVista('etapa1')}
            />
          )}
          {vistaActual === 'etapa3' && (
            <FichaEventoEtapa3
              alFinalizar={() => cambiarVista('dashboard')}
              alRetroceder={() => cambiarVista('etapa2')}
            />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;