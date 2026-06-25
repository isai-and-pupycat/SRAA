import React from 'react';
import { Link } from 'react-router-dom';
import './Accesos.css';

const Accesos = () => {
  return (
    <div className="accesos-body">
      {/* BARRA SUPERIOR */}
      <header className="topbar-accesos">
        <div className="topbar-left"></div>
        <div className="topbar-center">
          {/* La ruta apunta directo a /img/ porque ya está en la carpeta public */}
          <img src="/img/logo-horizontal-upb@2x.png" alt="Logo institucional" />
        </div>
        <div className="topbar-right"></div>
      </header>

      <div className="brand-title">Portal de Sistemas Institucionales</div>

      {/* CONTENEDOR DE TARJETAS */}
      <section className="cards-container">
        
        {/* TARJETA 1: Tu sistema SRAA conectado al Login de React */}
        <article className="card-institucional">
          <div className="card-header-ins">
            <span className="card-icon">📝</span>
            <div className="card-title-ins">SRAA</div>
          </div>
          <div className="card-text">
            Sistema de Registro de Actividades Académicas, plataforma para la gestión, validación y certificación de evidencias docentes.
          </div>
          <Link to="/login" className="card-link">Ingresar al Sistema</Link>
        </article>

        {/* TARJETA 2: SIPRELI */}
        <article className="card-institucional">
          <div className="card-header-ins">
            <span className="card-icon">📁</span>
            <div className="card-title-ins">SIPRELI</div>
          </div>
          <div className="card-text">
            Sistema de Pre-liberación y control de estadías. Gestión de documentación para procesos de titulación.
          </div>
          <a href="https://sipreli.ingenieriasupb.com/" target="_blank" rel="noopener noreferrer" className="card-link">Visitar SIPRELI</a>
        </article>

        {/* TARJETA 3: SIJUP */}
        <article className="card-institucional">
          <div className="card-header-ins">
            <span className="card-icon">👤</span>
            <div className="card-title-ins">SIJUP</div>
          </div>
          <div className="card-text">
            Gestión de usuarios y permisos para personal autorizado.
          </div>
          <a href="https://sijup.ingenieriasupb.com/login" target="_blank" rel="noopener noreferrer" className="card-link">Visitar SIJUP</a>
        </article>

        {/* TARJETA 4: BIBLIOTECA */}
        <article className="card-institucional">
          <div className="card-header-ins">
            <span className="card-icon">📚</span>
            <div className="card-title-ins">Biblioteca Digital</div>
          </div>
          <div className="card-text">
            Acervo digital universitario. Consulta de libros electrónicos, tesis y revistas científicas suscritas.
          </div>
          <a href="https://elibro.net/es/lc/upb/login_usuario/?next=/es/lc/upb/inicio/" target="_blank" rel="noopener noreferrer" className="card-link">Visitar Biblioteca</a>
        </article>

        {/* TARJETA 5: NUEVO SICE */}
        <article className="card-institucional">
          <div className="card-header-ins">
            <span className="card-icon">🏫</span>
            <div className="card-title-ins">Nuevo Sice</div>
          </div>
          <div className="card-text">
            Portal de Servicios Escolares. Consulta de calificaciones, carga académica e historial del estudiante.
          </div>
          <a href="https://upb.dev.ozelot.it/Account/Login?ReturnUrl=%2F" target="_blank" rel="noopener noreferrer" className="card-link">Visitar SICE</a>
        </article>

        {/* TARJETA 6: SRPI */}
        <article className="card-institucional">
          <div className="card-header-ins">
            <span className="card-icon">🔬</span>
            <div className="card-title-ins">SRPI</div>
          </div>
          <div className="card-text">
            Sistema de Registro de Proyectos Institucionales. Repositorio de investigaciones y desarrollo tecnológico.
          </div>
          <a href="https://srpi.ingenieriasupb.com/" target="_blank" rel="noopener noreferrer" className="card-link">Visitar SRPI</a>
        </article>

      </section>
    </div>
  );
};

export default Accesos;