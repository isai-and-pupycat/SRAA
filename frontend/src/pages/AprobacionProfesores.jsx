import { useState } from 'react';
import './AprobacionEventos.css'; // estilo de tabla (consistencia)
import './AdminCrud.css'; // estilo de modal + formulario
import './AprobacionProfesores.css';

const PROGRAMAS = [
  'Ingeniería en IT e Innovación Digital',
  'Licenciatura en Nutrición',
  'Lic. en Gestión y Desarrollo Turístico',
  'Tronco Común',
];

/*
 * Docentes de ejemplo. estatus: 'pendiente' | 'activo' | 'inactivo'.
 * En producción llegan por la prop `datosProfesores` desde el backend.
 */
const PROFESORES_DEFAULT = [
  { id: 1, nombre: 'Dr. Isai Rosas Canto', correo: 'isai.rosas@upb.edu.mx', programa: 'Ingeniería en IT e Innovación Digital', fechaRegistro: '22/06/2026', estatus: 'pendiente' },
  { id: 2, nombre: 'Lic. Elena Zapata López', correo: 'elena.zapata@upb.edu.mx', programa: 'Licenciatura en Nutrición', fechaRegistro: '20/06/2026', estatus: 'pendiente' },
  { id: 3, nombre: 'Mtro. Fabián Johanan', correo: 'fabian.johanan@upb.edu.mx', programa: 'Lic. en Gestión y Desarrollo Turístico', fechaRegistro: '12/01/2025', estatus: 'activo' },
  { id: 4, nombre: 'Ing. Erick Oscar Rosas', correo: 'erick.oscar@upb.edu.mx', programa: 'Ingeniería en IT e Innovación Digital', fechaRegistro: '14/03/2025', estatus: 'activo' },
];

const getIniciales = (nombre) => {
  const partes = nombre.split(' ').filter((p) => !p.endsWith('.'));
  return partes.slice(0, 2).map((p) => p[0]).join('').toUpperCase();
};

// Fecha de hoy en formato dd/mm/aaaa para los registros nuevos.
const fechaHoy = () => {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
};

/* -------- Badge de estatus reutilizable -------- */
const EstatusBadge = ({ estatus }) => {
  if (estatus === 'activo') {
    return <span className="apr-badge apr-badge-activo">● Activo</span>;
  }
  if (estatus === 'inactivo') {
    return <span className="apr-badge apr-badge-inactivo">● Inactivo</span>;
  }
  return <span className="apr-badge apr-badge-pendiente">⏱ Pendiente por Aprobar</span>;
};

const AprobacionProfesores = ({ datosProfesores = PROFESORES_DEFAULT }) => {
  const [profesores, setProfesores] = useState(datosProfesores);
  const [busqueda, setBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [form, setForm] = useState({ nombre: '', correo: '', programa: '' });
  const [errores, setErrores] = useState({});

  /*
   * Simula una petición a la API para cambiar el estatus de un docente.
   * Al aprobar, el registro pasa a 'activo' y sus botones cambian solos.
   */
  const cambiarEstatus = (id, nuevoEstatus) => {
    console.log(`API → cambiar estatus del docente ${id} a "${nuevoEstatus}"`);
    setProfesores((prev) =>
      prev.map((p) => (p.id === id ? { ...p, estatus: nuevoEstatus } : p))
    );
  };

  const darDeBaja = (prof) => {
    if (window.confirm(`¿Dar de baja a "${prof.nombre}"? No podrá ingresar al sistema.`)) {
      cambiarEstatus(prof.id, 'inactivo');
    }
  };

  // Búsqueda eficiente con .filter() sobre nombre, correo y programa.
  const texto = busqueda.trim().toLowerCase();
  const profesoresFiltrados = profesores.filter(
    (p) =>
      texto === '' ||
      p.nombre.toLowerCase().includes(texto) ||
      p.correo.toLowerCase().includes(texto) ||
      p.programa.toLowerCase().includes(texto)
  );

  /* ---- Registro manual ---- */
  const abrirModal = () => {
    setForm({ nombre: '', correo: '', programa: '' });
    setErrores({});
    setModalAbierto(true);
  };

  const cambiarCampo = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const registrarProfesor = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.nombre.trim()) errs.nombre = 'El nombre es obligatorio.';
    if (!form.correo.trim()) errs.correo = 'El correo es obligatorio.';
    else if (!/^[^\s@]+@upb\.edu\.mx$/i.test(form.correo.trim()))
      errs.correo = 'Debe ser un correo institucional (@upb.edu.mx).';
    if (!form.programa) errs.programa = 'Selecciona un programa educativo.';

    if (Object.keys(errs).length > 0) {
      setErrores(errs);
      return;
    }

    const nuevoId = profesores.length ? Math.max(...profesores.map((p) => p.id)) + 1 : 1;
    // Los registros nuevos entran como 'pendiente': deben ser aprobados.
    setProfesores((prev) => [
      ...prev,
      { id: nuevoId, ...form, fechaRegistro: fechaHoy(), estatus: 'pendiente' },
    ]);
    setModalAbierto(false);
  };

  return (
    <div className="ap-workspace">
      {/* ENCABEZADO */}
      <div className="ap-title-section">
        <h1>Aprobación de Profesores</h1>
      </div>

      {/* TOOLBAR */}
      <div className="ap-toolbar">
        <div className="ap-busqueda">
          <span className="ap-busqueda-icono">🔍</span>
          <input
            type="text"
            placeholder="Buscar profesor por nombre o correo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <button type="button" className="apr-btn-registrar" onClick={abrirModal}>
          👤 + Registrar Profesor
        </button>
      </div>

      {/* TABLA */}
      <div className="ap-tabla-card">
        <table className="ap-tabla apr-tabla">
          <thead>
            <tr>
              <th className="ap-col-num">N°</th>
              <th>Nombre del Docente / Correo</th>
              <th>Programa Educativo Asignado</th>
              <th>Fecha Registro</th>
              <th>Estatus Cuenta</th>
              <th className="apr-col-accion">Acción</th>
            </tr>
          </thead>
          <tbody>
            {profesoresFiltrados.length === 0 ? (
              <tr>
                <td colSpan={6} className="ap-fila-vacia">
                  No se encontraron docentes.
                </td>
              </tr>
            ) : (
              profesoresFiltrados.map((prof, indice) => (
                <tr key={prof.id}>
                  <td className="ap-col-num">{indice + 1}</td>

                  <td>
                    <div className="apr-docente">
                      <span className="apr-avatar">{getIniciales(prof.nombre)}</span>
                      <div className="apr-docente-info">
                        <strong>{prof.nombre}</strong>
                        <span className="apr-correo">{prof.correo}</span>
                      </div>
                    </div>
                  </td>

                  <td className="apr-programa">{prof.programa}</td>

                  <td>{prof.fechaRegistro}</td>

                  <td>
                    <EstatusBadge estatus={prof.estatus} />
                  </td>

                  <td className="apr-col-accion">
                    <div className="apr-acciones">
                      {prof.estatus === 'pendiente' && (
                        <>
                          <button
                            type="button"
                            className="apr-btn apr-btn-aprobar"
                            onClick={() => cambiarEstatus(prof.id, 'activo')}
                          >
                            ✓ Aprobar
                          </button>
                          <button type="button" className="apr-btn apr-btn-editar">
                            ✎ Editar
                          </button>
                        </>
                      )}

                      {prof.estatus === 'activo' && (
                        <>
                          <button type="button" className="apr-btn apr-btn-editar">
                            ✎ Editar
                          </button>
                          <button
                            type="button"
                            className="apr-btn apr-btn-baja"
                            onClick={() => darDeBaja(prof)}
                          >
                            ⬇ Baja
                          </button>
                        </>
                      )}

                      {prof.estatus === 'inactivo' && (
                        <>
                          <button type="button" className="apr-btn apr-btn-editar">
                            ✎ Editar
                          </button>
                          <button
                            type="button"
                            className="apr-btn apr-btn-aprobar"
                            onClick={() => cambiarEstatus(prof.id, 'activo')}
                          >
                            ↻ Reactivar
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL: REGISTRO MANUAL */}
      {modalAbierto && (
        <>
          <div className="adm-modal-backdrop" onClick={() => setModalAbierto(false)} />
          <div className="adm-modal" role="dialog" aria-modal="true">
            <div className="adm-modal-head">
              <h3>Registrar Profesor</h3>
              <button
                type="button"
                className="adm-modal-close"
                onClick={() => setModalAbierto(false)}
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            <form onSubmit={registrarProfesor} className="adm-form">
              <div className="adm-field">
                <label>Nombre completo<span className="adm-req">*</span></label>
                <input
                  type="text"
                  name="nombre"
                  value={form.nombre}
                  onChange={cambiarCampo}
                  placeholder="Ej. Dr. Isai Rosas Canto"
                />
                {errores.nombre && <span className="adm-error">{errores.nombre}</span>}
              </div>

              <div className="adm-field">
                <label>Correo institucional<span className="adm-req">*</span></label>
                <input
                  type="email"
                  name="correo"
                  value={form.correo}
                  onChange={cambiarCampo}
                  placeholder="nombre.apellido@upb.edu.mx"
                />
                {errores.correo && <span className="adm-error">{errores.correo}</span>}
              </div>

              <div className="adm-field">
                <label>Programa educativo<span className="adm-req">*</span></label>
                <select name="programa" value={form.programa} onChange={cambiarCampo}>
                  <option value="">Seleccionar...</option>
                  {PROGRAMAS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                {errores.programa && <span className="adm-error">{errores.programa}</span>}
              </div>

              <p className="apr-nota-modal">
                El docente se registrará como <strong>Pendiente por Aprobar</strong> y no podrá
                ingresar hasta que sea aprobado.
              </p>

              <div className="adm-form-actions">
                <button type="button" className="adm-btn-cancelar" onClick={() => setModalAbierto(false)}>
                  Cancelar
                </button>
                <button type="submit" className="adm-btn-guardar">
                  Registrar
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default AprobacionProfesores;
