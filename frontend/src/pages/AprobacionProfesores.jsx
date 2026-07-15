import { useState, useEffect } from 'react';
import './AprobacionEventos.css'; // estilo de tabla (consistencia)
import './AdminCrud.css'; // estilo de modal + formulario
import './AprobacionProfesores.css';
import {
  obtenerUsuarios,
  crearUsuario,
  actualizarUsuario,
  cambiarEstatusUsuario,
} from '../services/usuariosService';
import { obtenerCatalogo } from '../services/catalogosService';

const getIniciales = (nombre) => {
  const partes = (nombre || '?').split(' ').filter((p) => !p.endsWith('.'));
  return partes.slice(0, 2).map((p) => p[0]).join('').toUpperCase();
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

const AprobacionProfesores = () => {
  const [profesores, setProfesores] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [modal, setModal] = useState(null); // null | { modo: 'crear' | 'editar', id? }
  const [form, setForm] = useState({ nombre: '', correo: '', programa: '', contrasena: '' });
  const [errores, setErrores] = useState({});
  const [programas, setProgramas] = useState([]);

  // Carga los docentes desde el backend (tabla usuarios, rol docente).
  const cargar = () => {
    obtenerUsuarios('docente')
      .then(setProfesores)
      .catch((error) => console.error('No se pudieron cargar los profesores:', error));
  };

  useEffect(() => {
    cargar();
    // Programas educativos desde el catálogo de Carreras.
    obtenerCatalogo('carreras')
      .then((cs) => setProgramas(cs.filter((c) => c.estado !== 'Inactivo').map((c) => c.nombre)))
      .catch(() => setProgramas([]));
  }, []);

  // Cambia el estatus de un docente en el backend (aprobar / baja / reactivar).
  const cambiarEstatus = async (id, nuevoEstatus) => {
    try {
      const actualizado = await cambiarEstatusUsuario(id, nuevoEstatus);
      setProfesores((prev) => prev.map((p) => (p.id === id ? actualizado : p)));
    } catch (error) {
      console.error('Error al cambiar estatus:', error);
      window.alert('No se pudo actualizar. Revisa que el backend esté encendido.');
    }
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
      (p.nombre || '').toLowerCase().includes(texto) ||
      (p.correo || '').toLowerCase().includes(texto) ||
      (p.programa || '').toLowerCase().includes(texto)
  );

  /* ---- Alta / edición ---- */
  const abrirCrear = () => {
    setForm({ nombre: '', correo: '', programa: '', contrasena: '' });
    setErrores({});
    setModal({ modo: 'crear' });
  };

  const abrirEditar = (prof) => {
    setForm({ nombre: prof.nombre, correo: prof.correo, programa: prof.programa || '', contrasena: '' });
    setErrores({});
    setModal({ modo: 'editar', id: prof.id });
  };

  const cerrarModal = () => setModal(null);

  const cambiarCampo = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const registrarProfesor = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.nombre.trim()) errs.nombre = 'El nombre es obligatorio.';
    if (!form.correo.trim()) errs.correo = 'El correo es obligatorio.';
    else if (!/^[^\s@]+@upb\.edu\.mx$/i.test(form.correo.trim()))
      errs.correo = 'Debe ser un correo institucional (@upb.edu.mx).';
    if (!form.programa) errs.programa = 'Selecciona un programa educativo.';
    if (modal.modo === 'crear' && !form.contrasena.trim())
      errs.contrasena = 'Define una contraseña inicial.';

    if (Object.keys(errs).length > 0) {
      setErrores(errs);
      return;
    }

    try {
      if (modal.modo === 'crear') {
        // Alta por el coordinador: entra como docente ACTIVO (listo para usar).
        const creado = await crearUsuario({
          nombre: form.nombre,
          correo: form.correo,
          contrasena: form.contrasena,
          rol: 'docente',
          estatus: 'activo',
          programa: form.programa,
        });
        setProfesores((prev) => [...prev, creado]);
      } else {
        const actualizado = await actualizarUsuario(modal.id, {
          nombre: form.nombre,
          correo: form.correo,
          programa: form.programa,
          ...(form.contrasena.trim() ? { contrasena: form.contrasena } : {}),
        });
        setProfesores((prev) => prev.map((p) => (p.id === modal.id ? actualizado : p)));
      }
      cerrarModal();
    } catch (error) {
      const msg = error?.response?.data?.message || 'No se pudo guardar. Revisa el backend.';
      setErrores({ correo: msg });
    }
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
        <button type="button" className="apr-btn-registrar" onClick={abrirCrear}>
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
                          <button
                            type="button"
                            className="apr-btn apr-btn-editar"
                            onClick={() => abrirEditar(prof)}
                          >
                            ✎ Editar
                          </button>
                        </>
                      )}

                      {prof.estatus === 'activo' && (
                        <>
                          <button
                            type="button"
                            className="apr-btn apr-btn-editar"
                            onClick={() => abrirEditar(prof)}
                          >
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
                          <button
                            type="button"
                            className="apr-btn apr-btn-editar"
                            onClick={() => abrirEditar(prof)}
                          >
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

      {/* MODAL: ALTA / EDICIÓN */}
      {modal && (
        <>
          <div className="adm-modal-backdrop" onClick={cerrarModal} />
          <div className="adm-modal" role="dialog" aria-modal="true">
            <div className="adm-modal-head">
              <h3>{modal.modo === 'crear' ? 'Registrar Profesor' : 'Editar Profesor'}</h3>
              <button type="button" className="adm-modal-close" onClick={cerrarModal} aria-label="Cerrar">
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
                  {programas.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                {programas.length === 0 && (
                  <span className="adm-error">
                    No hay carreras registradas. Agrégalas en Administración → Carreras.
                  </span>
                )}
                {errores.programa && <span className="adm-error">{errores.programa}</span>}
              </div>

              <div className="adm-field">
                <label>
                  Contraseña {modal.modo === 'crear' ? 'inicial' : '(dejar en blanco para no cambiarla)'}
                  {modal.modo === 'crear' && <span className="adm-req">*</span>}
                </label>
                <input
                  type="password"
                  name="contrasena"
                  value={form.contrasena}
                  onChange={cambiarCampo}
                  placeholder="••••••••"
                />
                {errores.contrasena && <span className="adm-error">{errores.contrasena}</span>}
              </div>

              {modal.modo === 'crear' && (
                <p className="apr-nota-modal">
                  El docente quedará <strong>Activo</strong> y podrá iniciar sesión con el correo y
                  la contraseña indicados.
                </p>
              )}

              <div className="adm-form-actions">
                <button type="button" className="adm-btn-cancelar" onClick={cerrarModal}>
                  Cancelar
                </button>
                <button type="submit" className="adm-btn-guardar">
                  {modal.modo === 'crear' ? 'Registrar' : 'Guardar cambios'}
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
