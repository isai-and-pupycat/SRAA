import { useState } from 'react';
import './AprobacionEventos.css'; // reutilizamos el estilo de tabla (consistencia)
import './AdminCrud.css';

// Genera un objeto de valores vacíos a partir de la definición de campos.
const valoresVacios = (campos) => {
  const v = {};
  campos.forEach((c) => {
    v[c.clave] = '';
  });
  return v;
};

/*
 * Componente CRUD genérico dirigido por configuración.
 * Recibe `config` (ver adminModulos.js) y resuelve listar/crear/editar/eliminar
 * con un modal y validaciones básicas. Un solo componente para los 5 módulos.
 */
const CrudAdmin = ({ config }) => {
  const { titulo, subtitulo, singular, columnas, campos, datos } = config;

  const [registros, setRegistros] = useState(datos);
  const [busqueda, setBusqueda] = useState('');
  const [modal, setModal] = useState(null); // { modo: 'crear' | 'editar', id? }
  const [valores, setValores] = useState({});
  const [errores, setErrores] = useState({});

  const abrirCrear = () => {
    setValores(valoresVacios(campos));
    setErrores({});
    setModal({ modo: 'crear' });
  };

  const abrirEditar = (registro) => {
    setValores({ ...registro });
    setErrores({});
    setModal({ modo: 'editar', id: registro.id });
  };

  const cerrar = () => setModal(null);

  const cambiarCampo = (clave, valor) => {
    setValores((prev) => ({ ...prev, [clave]: valor }));
  };

  // Validaciones básicas: requeridos + formato de correo institucional.
  const validar = () => {
    const errs = {};
    campos.forEach((campo) => {
      const val = (valores[campo.clave] ?? '').toString().trim();
      if (campo.requerido && !val) {
        errs[campo.clave] = 'Este campo es obligatorio.';
      } else if (campo.tipo === 'email' && val && !/^[^\s@]+@upb\.edu\.mx$/i.test(val)) {
        errs[campo.clave] = 'Debe ser un correo institucional (@upb.edu.mx).';
      }
    });
    return errs;
  };

  const guardar = (e) => {
    e.preventDefault();
    const errs = validar();
    if (Object.keys(errs).length > 0) {
      setErrores(errs);
      return;
    }

    if (modal.modo === 'crear') {
      const nuevoId = registros.length ? Math.max(...registros.map((r) => r.id)) + 1 : 1;
      setRegistros((prev) => [...prev, { id: nuevoId, ...valores }]);
    } else {
      setRegistros((prev) => prev.map((r) => (r.id === modal.id ? { ...r, ...valores } : r)));
    }
    cerrar();
  };

  const eliminar = (registro) => {
    const etiqueta = registro[columnas[0].clave];
    if (window.confirm(`¿Eliminar "${etiqueta}"? Esta acción no se puede deshacer.`)) {
      setRegistros((prev) => prev.filter((r) => r.id !== registro.id));
    }
  };

  // Filtrado por texto en cualquiera de las columnas visibles.
  const texto = busqueda.trim().toLowerCase();
  const filtrados = registros.filter(
    (r) =>
      texto === '' ||
      columnas.some((c) => (r[c.clave] ?? '').toString().toLowerCase().includes(texto))
  );

  // Renderiza el contenido de una celda según el tipo de columna.
  const renderCelda = (registro, col) => {
    const valor = registro[col.clave];
    if (col.tipo === 'estado') {
      const activo = valor === 'Activo';
      return (
        <span className={`ap-chip ${activo ? 'ap-chip-validado' : 'adm-chip-inactivo'}`}>
          {valor}
        </span>
      );
    }
    if (col.tipo === 'rol') {
      const claseRol = valor === 'docente' ? 'profesor' : 'coordinador';
      return <span className={`ap-rol-chip ap-rol-${claseRol}`}>{String(valor).toUpperCase()}</span>;
    }
    return valor;
  };

  return (
    <div className="ap-workspace">
      {/* ENCABEZADO */}
      <div className="ap-title-section">
        <h1>{titulo}</h1>
        {subtitulo && <p className="adm-subtitulo">{subtitulo}</p>}
      </div>

      {/* TOOLBAR: buscador + botón nuevo */}
      <div className="ap-toolbar">
        <div className="ap-busqueda">
          <span className="ap-busqueda-icono">🔍</span>
          <input
            type="text"
            placeholder={`Buscar ${singular.toLowerCase()}...`}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <button type="button" className="adm-btn-nuevo" onClick={abrirCrear}>
          ＋ Nuevo {singular}
        </button>
      </div>

      {/* TABLA */}
      <div className="ap-tabla-card">
        <table className="ap-tabla adm-tabla">
          <thead>
            <tr>
              <th className="ap-col-num">N°</th>
              {columnas.map((c) => (
                <th key={c.clave}>{c.etiqueta}</th>
              ))}
              <th className="adm-col-accion">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.length === 0 ? (
              <tr>
                <td colSpan={columnas.length + 2} className="ap-fila-vacia">
                  No hay registros para mostrar.
                </td>
              </tr>
            ) : (
              filtrados.map((registro, indice) => (
                <tr key={registro.id}>
                  <td className="ap-col-num">{indice + 1}</td>
                  {columnas.map((c) => (
                    <td key={c.clave}>{renderCelda(registro, c)}</td>
                  ))}
                  <td className="adm-col-accion">
                    <div className="adm-acciones">
                      <button
                        type="button"
                        className="ap-icon-btn adm-icon-editar"
                        title="Editar"
                        onClick={() => abrirEditar(registro)}
                      >
                        ✎
                      </button>
                      <button
                        type="button"
                        className="ap-icon-btn adm-icon-eliminar"
                        title="Eliminar"
                        onClick={() => eliminar(registro)}
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DE ALTA / EDICIÓN */}
      {modal && (
        <>
          <div className="adm-modal-backdrop" onClick={cerrar} />
          <div className="adm-modal" role="dialog" aria-modal="true">
            <div className="adm-modal-head">
              <h3>{modal.modo === 'crear' ? `Nuevo ${singular}` : `Editar ${singular}`}</h3>
              <button type="button" className="adm-modal-close" onClick={cerrar} aria-label="Cerrar">
                ✕
              </button>
            </div>

            <form onSubmit={guardar} className="adm-form">
              {campos.map((campo) => (
                <div className="adm-field" key={campo.clave}>
                  <label>
                    {campo.etiqueta}
                    {campo.requerido && <span className="adm-req">*</span>}
                  </label>

                  {campo.tipo === 'select' ? (
                    <select
                      value={valores[campo.clave] ?? ''}
                      onChange={(e) => cambiarCampo(campo.clave, e.target.value)}
                    >
                      <option value="">Seleccionar...</option>
                      {campo.opciones.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={
                        campo.tipo === 'number'
                          ? 'number'
                          : campo.tipo === 'date'
                            ? 'date'
                            : campo.tipo === 'email'
                              ? 'email'
                              : 'text'
                      }
                      value={valores[campo.clave] ?? ''}
                      placeholder={campo.placeholder || ''}
                      onChange={(e) => cambiarCampo(campo.clave, e.target.value)}
                    />
                  )}

                  {errores[campo.clave] && <span className="adm-error">{errores[campo.clave]}</span>}
                </div>
              ))}

              <div className="adm-form-actions">
                <button type="button" className="adm-btn-cancelar" onClick={cerrar}>
                  Cancelar
                </button>
                <button type="submit" className="adm-btn-guardar">
                  {modal.modo === 'crear' ? 'Agregar' : 'Guardar cambios'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default CrudAdmin;
