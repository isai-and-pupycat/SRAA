import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Dashboard from './pages/Dashboard';
import FichaEventoEtapa1 from './components/FichaEventoEtapa1';
import FichaEventoEtapa2 from './components/FichaEventoEtapa2';
import FichaEventoEtapa3 from './components/FichaEventoEtapa3';
import Accesos from './pages/Accesos';
import CentroControl from './pages/CentroControl';
import ListadoFichas from './components/ListadoFichas';
import FichaTecnicaVista from './components/FichaTecnicaVista';
import Constancias from './components/Constancias';
import {
  obtenerFichas,
  crearFicha,
  validarFichaApi,
  actualizarFichaApi,
  guardarInformeApi,
  eliminarFichaApi,
} from './services/fichasService';
import { generarFolio } from './services/fichaTecnicaService';
import { generarInformePDF } from './utils/generarInformePDF';

import './App.css';
import './Dashboard.css';

// Recupera la sesión guardada (si existe) para no perderla al recargar.
const usuarioGuardado = (() => {
  try {
    return JSON.parse(localStorage.getItem('usuario'));
  } catch {
    return null;
  }
})();

// Vista inicial según haya o no una sesión activa.
const vistaInicial = (() => {
  if (!usuarioGuardado) return 'enlaces';
  const rol = (usuarioGuardado.rol || '').toLowerCase();
  return ['coordinador', 'admin', 'administrador'].includes(rol) ? 'centro-control' : 'dashboard';
})();

function App() {
  const [vistaActual, setVistaActual] = useState(vistaInicial);
  const [usuarioActual, setUsuarioActual] = useState(usuarioGuardado);
  // Nombre de la actividad, compartido entre las etapas de la ficha.
  const [nombreActividad, setNombreActividad] = useState('');
  // Folio único que conecta la Etapa 1 (Ficha Técnica) con la Etapa 3 (Informe).
  const [folio, setFolio] = useState(() => `UPB-FT-2026-${Math.floor(1000 + Math.random() * 9000)}`);

  // Almacén compartido de fichas: el docente crea → el coordinador aprueba.
  // Se cargan y guardan en la base de datos PostgreSQL vía el backend.
  const [fichas, setFichas] = useState([]);
  const [borradorFicha, setBorradorFicha] = useState(null);
  // Ficha que se está viendo en detalle (solo lectura).
  const [fichaVista, setFichaVista] = useState(null);
  // Ficha cuyo Informe (Etapa 3) se está completando.
  const [fichaInforme, setFichaInforme] = useState(null);
  // Menú desplegable del badge de usuario (header del docente).
  const [menuUsuario, setMenuUsuario] = useState(false);

  // Al arrancar la app, traemos las fichas guardadas en la base de datos.
  useEffect(() => {
    obtenerFichas()
      .then((datos) => setFichas(datos))
      .catch((error) => {
        console.error('No se pudieron cargar las fichas del backend:', error);
      });
  }, []);

  const cambiarVista = (nuevaVista) => {
    setVistaActual(nuevaVista);
    window.scrollTo(0, 0);
  };

  // Cierra la sesión: borra los datos guardados y vuelve al login.
  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUsuarioActual(null);
    cambiarVista('login');
  };

  // Convierte una fecha ISO (yyyy-mm-dd) al formato dd/mm/yyyy.
  const formatearFecha = (iso) => (iso ? iso.split('-').reverse().join('/') : 'Sin fecha');

  // Crea una ficha nueva a partir del borrador (Etapa 1) + itinerario (Etapa 2).
  // Se guarda en la base de datos y se agrega a la lista local.
  const agregarFicha = async (datos, datosEtapa2) => {
    if (!datos) return;

    // Confirma el folio correlativo real (reserva el número en el backend).
    // Si falla (sin cuatrimestre activo / backend caído), usa el de la vista previa.
    let folioFinal = datos.folio;
    try {
      const reg = await generarFolio(datos.nombreActividad || 'Actividad sin nombre');
      folioFinal = reg.folio;
    } catch {
      /* se conserva el folio mostrado en la Etapa 1 */
    }

    const payload = {
      folio: folioFinal,
      nombre: datos.nombreActividad || 'Actividad sin nombre',
      carrera: datos.programa || 'Sin programa',
      cuatrimestre: datos.cuatrimestre || 'Sin cuatrimestre',
      docente: {
        id: usuarioActual?.id || null,
        nombre: usuarioActual?.nombre || 'Docente',
        rol: usuarioActual?.rol === 'coordinador' ? 'coordinador' : 'profesor',
      },
      fecha: formatearFecha(datos.fechaInicio),
      hora: datos.horaInicio && datos.horaFin ? `${datos.horaInicio} - ${datos.horaFin}` : 'Por definir',
      // Datos completos de la Etapa 1 para poder ver/descargar la ficha técnica.
      tecnica: datos,
      // Programa del evento (itinerario de la Etapa 2).
      programa: datosEtapa2?.itinerario || [],
    };
    try {
      const fichaGuardada = await crearFicha(payload);
      setFichas((prev) => [...prev, fichaGuardada]);
    } catch (error) {
      console.error('Error al guardar la ficha:', error);
      window.alert(
        'No se pudo guardar la ficha en la base de datos.\n' +
          'Verifica que el servidor backend esté encendido (npm start en la carpeta backend).'
      );
    }
  };

  // Acciones del coordinador sobre una ficha.
  const validarFicha = async (id) => {
    try {
      const actualizada = await validarFichaApi(id);
      setFichas((prev) => prev.map((f) => (f.id === id ? actualizada : f)));
    } catch (error) {
      console.error('Error al validar la ficha:', error);
      window.alert('No se pudo validar la ficha. Revisa que el backend esté encendido.');
    }
  };

  const rechazarFicha = async (id) => {
    try {
      await eliminarFichaApi(id);
      setFichas((prev) => prev.filter((f) => f.id !== id));
    } catch (error) {
      console.error('Error al eliminar la ficha:', error);
      window.alert('No se pudo eliminar la ficha. Revisa que el backend esté encendido.');
    }
  };

  // Actualiza la Ficha Técnica (edición del coordinador).
  const actualizarFicha = async (id, datosEtapa1) => {
    const payload = {
      folio: datosEtapa1.folio,
      nombre: datosEtapa1.nombreActividad || 'Actividad sin nombre',
      carrera: datosEtapa1.programa || 'Sin programa',
      cuatrimestre: datosEtapa1.cuatrimestre || 'Sin cuatrimestre',
      fecha: formatearFecha(datosEtapa1.fechaInicio),
      hora:
        datosEtapa1.horaInicio && datosEtapa1.horaFin
          ? `${datosEtapa1.horaInicio} - ${datosEtapa1.horaFin}`
          : 'Por definir',
      tecnica: datosEtapa1,
    };
    try {
      const actualizada = await actualizarFichaApi(id, payload);
      setFichas((prev) => prev.map((f) => (f.id === id ? actualizada : f)));
    } catch (error) {
      console.error('Error al actualizar la ficha:', error);
      window.alert('No se pudo guardar la edición. Revisa que el backend esté encendido.');
    }
  };

  // Guarda solo el itinerario (Etapa 2) de una ficha, sin tocar las demás etapas.
  const guardarProgramaFicha = async (id, itinerario) => {
    try {
      const actualizada = await actualizarFichaApi(id, { programa: itinerario || [] });
      setFichas((prev) => prev.map((f) => (f.id === id ? actualizada : f)));
      return actualizada;
    } catch (error) {
      console.error('Error al guardar la Etapa 2:', error);
      window.alert('No se pudo guardar la Etapa 2. Revisa que el backend esté encendido.');
    }
  };

  // Guarda el Informe (Etapa 3) sin navegar (para el asistente de edición).
  const guardarInformeFicha = async (id, datosInforme) => {
    const actualizada = await guardarInformeApi(id, datosInforme);
    setFichas((prev) => prev.map((f) => (f.id === id ? actualizada : f)));
    return actualizada;
  };

  // Guarda el Informe (Etapa 3) de una ficha y regresa al listado.
  const guardarInforme = async (id, datosInforme) => {
    try {
      const actualizada = await guardarInformeApi(id, datosInforme);
      setFichas((prev) => prev.map((f) => (f.id === id ? actualizada : f)));
      cambiarVista('listado');
    } catch (error) {
      console.error('Error al guardar el informe:', error);
      window.alert('No se pudo guardar el informe. Revisa que el backend esté encendido.');
    }
  };

  // El docente solo debe ver SUS propias fichas (por id; si no hay, por nombre).
  const misFichas = fichas.filter((f) => {
    if (!usuarioActual) return false;
    if (usuarioActual.id && f.docente?.id) return f.docente.id === usuarioActual.id;
    return (f.docente?.nombre || '') === (usuarioActual.nombre || '');
  });

  if (vistaActual === 'enlaces') {
    return <Accesos alIrALogin={() => cambiarVista('login')} />;
  }

  if (vistaActual === 'login') {
    return (
      <div className="sraa-login-wrapper-debug">
        <Login
          alIngresar={(usuario) => {
            setUsuarioActual(usuario);
            // Guarda la sesión para que sobreviva a las recargas (F5).
            localStorage.setItem('usuario', JSON.stringify(usuario));
            // Enrutamos según el rol del usuario que inicia sesión
            const rol = (usuario?.rol || '').toLowerCase();
            if (['coordinador', 'admin', 'administrador'].includes(rol)) {
              cambiarVista('centro-control');
            } else {
              cambiarVista('dashboard');
            }
          }}
          alIrAEnlaces={() => cambiarVista('enlaces')}
          alIrARegistro={() => cambiarVista('registro')}
        />
      </div>
    );
  }

  if (vistaActual === 'registro') {
    return (
      <div className="sraa-login-wrapper-debug">
        <Registro
          alRegistrar={() => cambiarVista('login')}
          alIrALogin={() => cambiarVista('login')}
        />
      </div>
    );
  }

  if (vistaActual === 'centro-control') {
    return (
      <CentroControl
        usuario={usuarioActual || undefined}
        fichas={fichas}
        agregarFicha={agregarFicha}
        validarFicha={validarFicha}
        actualizarFicha={actualizarFicha}
        guardarPrograma={guardarProgramaFicha}
        guardarInforme={guardarInformeFicha}
        rechazarFicha={rechazarFicha}
        alCerrarSesion={cerrarSesion}
      />
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
            className={`nav-item ${vistaActual === 'constancias' ? 'active' : ''}`}
            href="#constancias"
            onClick={(e) => { e.preventDefault(); cambiarVista('constancias'); }}
          >
            Mis constancias
          </a>
          <a
            className={`nav-item ${vistaActual === 'listado' ? 'active' : ''}`}
            href="#listado-eventos"
            onClick={(e) => { e.preventDefault(); cambiarVista('listado'); }}
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
            <div className="user-menu-wrap">
              <button
                type="button"
                className="user-badge"
                onClick={() => setMenuUsuario((v) => !v)}
                aria-haspopup="true"
                aria-expanded={menuUsuario}
              >
                <span className="user-initials">
                  {(usuarioActual?.nombre || 'Usuario')
                    .split(' ')
                    .map((parte) => parte[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </span>
                <span className="user-name">{usuarioActual?.nombre || 'Perfil de usuario'}</span>
                <span className={`arrow-down ${menuUsuario ? 'abierto' : ''}`}>v</span>
              </button>

              {menuUsuario && (
                <>
                  <div className="user-menu-backdrop" onClick={() => setMenuUsuario(false)} />
                  <div className="user-menu-dropdown" role="menu">
                    <div className="user-menu-head">
                      <span className="user-menu-avatar">
                        {(usuarioActual?.nombre || 'Usuario')
                          .split(' ')
                          .map((parte) => parte[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase()}
                      </span>
                      <div>
                        <strong>{usuarioActual?.nombre || 'Usuario'}</strong>
                        {usuarioActual?.correo && (
                          <span className="user-menu-mail">{usuarioActual.correo}</span>
                        )}
                        {usuarioActual?.rol && <span className="user-menu-rol">{usuarioActual.rol}</span>}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="user-menu-item"
                      onClick={() => { setMenuUsuario(false); cambiarVista('listado'); }}
                    >
                      📋 Mis Fichas de Eventos
                    </button>
                    <button
                      type="button"
                      className="user-menu-item"
                      onClick={() => { setMenuUsuario(false); cambiarVista('constancias'); }}
                    >
                      🏅 Mis Constancias
                    </button>
                    <button
                      type="button"
                      className="user-menu-item user-menu-salir"
                      onClick={() => { setMenuUsuario(false); cerrarSesion(); }}
                    >
                      ⎋ Cerrar sesión
                    </button>
                  </div>
                </>
              )}
            </div>
            <button
              type="button"
              className="btn-header-login"
              onClick={cerrarSesion}
            >
              Cerrar sesión
            </button>
          </div>
        </header>

        <div className="sraa-dynamic-content-body">
          {vistaActual === 'dashboard' && (
            <Dashboard
              fichas={misFichas}
              alClickCrearFicha={() => cambiarVista('etapa1')}
              alClickConstancias={() => cambiarVista('constancias')}
            />
          )}
          {vistaActual === 'etapa1' && (
            <FichaEventoEtapa1
              folio={folio}
              setFolio={setFolio}
              nombreActividad={nombreActividad}
              setNombreActividad={setNombreActividad}
              alAvanzar={(datos) => { setBorradorFicha(datos); cambiarVista('etapa2'); }}
              alCancelar={() => cambiarVista('dashboard')}
            />
          )}
          {vistaActual === 'etapa2' && (
            <FichaEventoEtapa2
              nombreActividad={nombreActividad}
              setNombreActividad={setNombreActividad}
              alAvanzar={(datosE2) => { agregarFicha(borradorFicha, datosE2); cambiarVista('listado'); }}
              alRetroceder={() => cambiarVista('etapa1')}
            />
          )}
          {vistaActual === 'etapa3' && (
            <FichaEventoEtapa3
              ficha={fichaInforme}
              folio={fichaInforme?.folio || folio}
              alGuardarInforme={guardarInforme}
              alRetroceder={() => cambiarVista('listado')}
            />
          )}
          {vistaActual === 'listado' && (
            <ListadoFichas
              datosFichas={misFichas}
              alEliminarFicha={(id) => {
                if (window.confirm('¿Eliminar esta ficha de evento? Esta acción no se puede deshacer.')) {
                  rechazarFicha(id);
                }
              }}
              alDescargarInforme={(ficha) => generarInformePDF(ficha)}
              alSeleccionarFicha={(id, accion) => {
                if (accion === 'ver') {
                  // Muestra la ficha técnica completa en modo lectura.
                  setFichaVista(misFichas.find((f) => f.id === id) || null);
                  cambiarVista('ver-ficha');
                } else if (accion === 'editar') {
                  // Ya validada por el coordinador, se completa el Informe (Etapa 3).
                  setFichaInforme(misFichas.find((f) => f.id === id) || null);
                  cambiarVista('etapa3');
                }
              }}
            />
          )}
          {vistaActual === 'ver-ficha' && (
            <FichaTecnicaVista
              ficha={fichaVista}
              alVolver={() => cambiarVista('listado')}
            />
          )}
          {vistaActual === 'constancias' && (
            <Constancias usuario={usuarioActual || undefined} />
          )}
        </div>
      </main>
    </div>
  );
}

export default App;