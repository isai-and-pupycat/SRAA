import { useState, useEffect } from 'react';
import './FichaEvento.css';
import { obtenerCatalogo } from '../services/catalogosService';
import { obtenerUsuarios } from '../services/usuariosService';
import { obtenerSiguienteFolio } from '../services/fichaTecnicaService';

const FichaEventoEtapa1 = ({
  folio,
  setFolio,
  nombreActividad,
  setNombreActividad,
  alAvanzar,
  alCancelar,
  datosIniciales = null,          // datos de una ficha existente (modo edición)
  textoBoton = 'Siguiente: Etapa 2',
  alGuardar = null,               // si se pasa, se guarda en lugar de avanzar
}) => {
  // Valores previos (modo edición) o vacíos (modo creación).
  const di = datosIniciales || {};

  // Estados para inputs convencionales
  const [programa, setPrograma] = useState(di.programa || "");
  const [cuatrimestre, setCuatrimestre] = useState(di.cuatrimestre || "");
  const [lugar, setLugar] = useState(di.lugar || "");

  // Catálogos cargados desde Administración (backend).
  const [carrerasCat, setCarrerasCat] = useState([]);
  const [cuatrisCat, setCuatrisCat] = useState([]);
  // Usuarios reales del sistema (para el select de Responsables).
  const [docentesCat, setDocentesCat] = useState([]);

  useEffect(() => {
    obtenerCatalogo('carreras')
      .then((data) => setCarrerasCat(data))
      .catch(() => setCarrerasCat([]));
    obtenerCatalogo('cuatrimestres')
      .then((data) => setCuatrisCat(data))
      .catch(() => setCuatrisCat([]));
    // Todos los usuarios APROBADOS (estatus activo), sin importar el rol.
    obtenerUsuarios()
      .then((data) => setDocentesCat(data.filter((u) => u.estatus === 'activo')))
      .catch(() => setDocentesCat([]));
  }, []);

  // Aviso cuando no se puede generar el folio (ej. sin cuatrimestre activo).
  const [folioAviso, setFolioAviso] = useState('');

  // Solo al CREAR (no al editar): muestra la vista previa del folio correlativo.
  useEffect(() => {
    if (datosIniciales) return; // en edición se conserva el folio existente
    obtenerSiguienteFolio()
      .then((r) => { setFolio(r.folio); setFolioAviso(''); })
      .catch((e) => setFolioAviso(e?.response?.data?.message || 'No se pudo generar el folio.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Opciones del select de Responsables (usuarios activos/aprobados del sistema).
  const opcionesDocentes = docentesCat.map((d) => d.nombre).filter(Boolean);

  // Opciones del select de Programa Educativo (carreras activas del catálogo).
  const opcionesProgramas = (() => {
    const activas = carrerasCat.filter((c) => c.estado !== 'Inactivo').map((c) => c.nombre);
    // Conserva el valor actual (modo edición) aunque ya no esté en el catálogo.
    if (programa && !activas.includes(programa)) return [programa, ...activas];
    return activas;
  })();

  // Opciones del select de Cuatrimestre (periodos activos del catálogo).
  const opcionesCuatris = (() => {
    const activos = cuatrisCat.filter((c) => c.estado !== 'Inactivo').map((c) => c.nombre);
    if (cuatrimestre && !activos.includes(cuatrimestre)) return [cuatrimestre, ...activos];
    return activos;
  })();
  const [fechaInicio, setFechaInicio] = useState(di.fechaInicio || "");
  const [fechaFin, setFechaFin] = useState(di.fechaFin || "");
  const [horaInicio, setHoraInicio] = useState(di.horaInicio || "");
  const [horaFin, setHoraFin] = useState(di.horaFin || "");
  const [tipoEvento, setTipoEvento] = useState(di.tipoEvento || "");
  const [objetivo, setObjetivo] = useState(di.objetivo || "");
  const [departamento, setDepartamento] = useState(di.departamento || "");
  const [requerimientos, setRequerimientos] = useState(di.requerimientos || "");

  // Estados para arreglos dinámicos (+ / x)
  const [carreras, setCarreras] = useState(di.carreras?.length ? di.carreras : [""]);
  const [docentes, setDocentes] = useState(di.docentes?.length ? di.docentes : [""]);

  // Control de Invitados Especiales (Lógica Condicional)
  const [requiereInvitados, setRequiereInvitados] = useState(di.requiereInvitados || "si");
  const [invitados, setInvitados] = useState(
    di.invitados?.length ? di.invitados : [{ nombre: "", cargo: "" }]
  );

  // Checkboxes de Servicios Requeridos
  const [servicios, setServicios] = useState(
    di.servicios || { diseno: false, fotografia: false, redes: false }
  );

  // Servicios adicionales personalizados (filas dinámicas)
  const [serviciosExtra, setServiciosExtra] = useState(
    di.serviciosExtra?.length ? di.serviciosExtra : [""]
  );

  // Funciones manejadoras para campos dinámicos
  const handleAddCarrera = () => setCarreras([...carreras, ""]);
  const handleRemoveCarrera = (index) => setCarreras(carreras.filter((_, i) => i !== index));
  
  const handleAddDocente = () => setDocentes([...docentes, ""]);
  const handleRemoveDocente = (index) => setDocentes(docentes.filter((_, i) => i !== index));

  const handleAddInvitado = () => setInvitados([...invitados, { nombre: "", cargo: "" }]);
  const handleRemoveInvitado = (index) => setInvitados(invitados.filter((_, i) => i !== index));

  const handleAddServicioExtra = () => setServiciosExtra([...serviciosExtra, ""]);
  const handleRemoveServicioExtra = (index) => setServiciosExtra(serviciosExtra.filter((_, i) => i !== index));
  const handleChangeServicioExtra = (index, value) => {
    const nuevos = [...serviciosExtra];
    nuevos[index] = value;
    setServiciosExtra(nuevos);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const datosEtapa1 = {
      folio, programa, cuatrimestre, lugar, nombreActividad, carreras, fechaInicio, fechaFin,
      horaInicio, horaFin, tipoEvento, objetivo, docentes, requiereInvitados,
      invitados, requerimientos, departamento, servicios, serviciosExtra
    };
    // Modo edición: guarda los cambios. Modo creación: avanza a la Etapa 2.
    if (alGuardar) {
      alGuardar(datosEtapa1);
    } else {
      alAvanzar(datosEtapa1);
    }
  };

  return (
    <div className="sraa-form-workspace">
      
      {/* ENCABEZADO DE LA FICHA */}
      <div className="form-title-section">
        <h2>Ficha de Evento</h2>
        <p>Seguimiento y control de llenado de formatos académicos institucionales</p>
      </div>

      {/* STEPPER DE ETAPAS (image_733c13.png) */}
      <div className="form-stepper-container">
        <div className="step-item active">
          <span className="step-number">1</span>
          <span className="step-label">Etapa 1: Ficha Técnica</span>
        </div>
        <div className="step-line"></div>
        <div className="step-item pending">
          <span className="step-number">2</span>
          <span className="step-label">Etapa 2: Estructura del Orden del Día</span>
        </div>
        <div className="step-line"></div>
        <div className="step-item pending">
          <span className="step-number">3</span>
          <span className="step-label">Etapa 3: Cierre y Evidencias</span>
        </div>
      </div>

      {/* FORMULARIO PRINCIPAL */}
      <form onSubmit={handleSubmit} className="ficha-evento-form-grid">

        {/* SECCIÓN: DATOS GENERALES */}
        <h3 className="form-section-title">Datos Generales</h3>

        <div className="form-field-group full-width-field">
          <label>Folio <span className="form-hint-inline">(se genera automáticamente según el cuatrimestre activo)</span></label>
          <input
            type="text"
            value={folio}
            onChange={(e) => setFolio(e.target.value)}
            readOnly={!datosIniciales}
            required
          />
          {folioAviso && <span className="form-hint-inline" style={{ color: '#dc2626' }}>{folioAviso}</span>}
        </div>

        {/* FILA 1: PROGRAMA Y CUATRIMESTRE */}
        <div className="form-row-two-columns">
          <div className="form-field-group">
            <label>Programa Educativo</label>
            <select value={programa} onChange={(e) => setPrograma(e.target.value)} required>
              <option value="">Seleccionar programa...</option>
              {opcionesProgramas.map((nombre) => (
                <option key={nombre} value={nombre}>{nombre}</option>
              ))}
            </select>
            {opcionesProgramas.length === 0 && (
              <span className="form-hint-inline">
                No hay carreras registradas. Agrégalas en Administración → Carreras.
              </span>
            )}
          </div>
          <div className="form-field-group">
            <label>Cuatrimestre</label>
            <select value={cuatrimestre} onChange={(e) => setCuatrimestre(e.target.value)} required>
              <option value="">Seleccionar cuatrimestre...</option>
              {opcionesCuatris.map((nombre) => (
                <option key={nombre} value={nombre}>{nombre}</option>
              ))}
            </select>
            {opcionesCuatris.length === 0 && (
              <span className="form-hint-inline">
                No hay cuatrimestres registrados. Agrégalos en Administración → Cuatrimestres.
              </span>
            )}
          </div>
        </div>

        {/* LUGAR DEL EVENTO */}
        <div className="form-field-group full-width-field">
          <label>Lugar del Evento</label>
          <input type="text" value={lugar} onChange={(e) => setLugar(e.target.value)} />
        </div>

        {/* FILA 2: NOMBRE Y GRUPOS DINÁMICOS */}
        <div className="form-row-two-columns">
          <div className="form-field-group">
            <label>Nombre de la Actividad</label>
            <input type="text" value={nombreActividad} onChange={(e) => setNombreActividad(e.target.value)} />
          </div>
          
          <div className="form-field-group">
            <label>Carrera (Grupo de Carrera)</label>
            {carreras.map((carrera, index) => (
              <div key={index} className="dynamic-input-row">
                <select value={carrera} onChange={(e) => {
                  const newCarreras = [...carreras];
                  newCarreras[index] = e.target.value;
                  setCarreras(newCarreras);
                }}>
                  <option value="">Seleccionar Grupo...</option>
                  <option value="7A">ITIIID 7° A</option>
                  <option value="10A">ITIIID 10° A</option>
                </select>
                {index === 0 ? (
                  <button type="button" className="btn-dyn-add" onClick={handleAddCarrera}>＋</button>
                ) : (
                  <button type="button" className="btn-dyn-remove" onClick={() => handleRemoveCarrera(index)}>✕</button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* FILA 3: LOGÍSTICA DE FECHAS Y TIEMPOS */}
        <div className="form-row-logistics-time">
          <div className="form-field-group">
            <label>Vigencia del Evento (Fechas)</label>
            <div className="date-inputs-range">
              <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} required />
              <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} required />
            </div>
          </div>
          <div className="form-field-group">
            <label>Horario de inicio</label>
            <input type="time" value={horaInicio} onChange={(e) => setHoraInicio(e.target.value)} />
          </div>
          <div className="form-field-group">
            <label>Horario de finalizado</label>
            <input type="time" value={horaFin} onChange={(e) => setHoraFin(e.target.value)} />
          </div>
        </div>

        {/* SECCIÓN: CATEGORIZACIÓN Y OBJETIVO */}
        <h3 className="form-section-title">Categorización y Objetivo</h3>

        {/* FILA 4: TIPO DE EVENTO */}
        <div className="form-field-group full-width-field">
          <label>Tipo de Evento</label>
          <select value={tipoEvento} onChange={(e) => setTipoEvento(e.target.value)} required>
            <option value="">Seleccionar tipo...</option>
            <option value="Academico">Academico</option>
            <option value="Cultural">Cultural</option>
            <option value="Deportivo">Deportivo</option>
          </select>
        </div>

        {/* FILA 5: OBJETIVO TEXTAREA */}
        <div className="form-field-group full-width-field">
          <label>Objetivo</label>
          <textarea rows="4" value={objetivo} onChange={(e) => setObjetivo(e.target.value)} required />
        </div>

        {/* SECCIÓN: RESPONSABLES E INVITADOS */}
        <h3 className="form-section-title">Responsables e Invitados</h3>

        {/* FILA 6: DOCENTES RESPONSABLES DINÁMICOS */}
        <div className="form-field-group full-width-field">
          <label>Docentes Responsables</label>
          {docentes.map((docente, index) => (
            <div key={index} className="dynamic-input-row current-docente-row">
              <select value={docente} onChange={(e) => {
                const newDocentes = [...docentes];
                newDocentes[index] = e.target.value;
                setDocentes(newDocentes);
              }}>
                <option value="">Seleccionar Docente Responsable...</option>
                {/* Conserva el valor guardado aunque el docente ya no esté en la lista (modo edición). */}
                {docente && !opcionesDocentes.includes(docente) && (
                  <option value={docente}>{docente}</option>
                )}
                {opcionesDocentes.map((nombre) => (
                  <option key={nombre} value={nombre}>{nombre}</option>
                ))}
              </select>
              {index === 0 ? (
                <button type="button" className="btn-dyn-add" onClick={handleAddDocente}>＋</button>
              ) : (
                <button type="button" className="btn-dyn-remove" onClick={() => handleRemoveDocente(index)}>✕</button>
              )}
            </div>
          ))}
        </div>

        {/* SECCIÓN CONDICIONAL: INVITADOS ESPECIALES */}
        <div className="conditional-guests-panel">
          <div className="radio-question-row">
            <span>Requiere invitados especiales?</span>
            <label>
              <input type="radio" name="invitados_radio" value="si" checked={requiereInvitados === "si"} onChange={() => setRequiereInvitados("si")} /> si
            </label>
            <label>
              <input type="radio" name="invitados_radio" value="no" checked={requiereInvitados === "no"} onChange={() => setRequiereInvitados("no")} /> no
            </label>
          </div>

          {requiereInvitados === "si" && (
            <div className="guests-fields-list">
              {invitados.map((invitado, index) => (
                <div key={index} className="guest-input-pair-row">
                  <div className="sub-field">
                    <label>Nombre completo del invitado</label>
                    <input type="text" value={invitado.nombre} onChange={(e) => {
                      const newGuests = [...invitados];
                      newGuests[index].nombre = e.target.value;
                      setInvitados(newGuests);
                    }} />
                  </div>
                  <div className="sub-field position-relative-field">
                    <label>Cargo</label>
                    <div className="dynamic-input-row">
                      <input type="text" value={invitado.cargo} onChange={(e) => {
                        const newGuests = [...invitados];
                        newGuests[index].cargo = e.target.value;
                        setInvitados(newGuests);
                      }} />
                      {index === 0 ? (
                        <button type="button" className="btn-dyn-add" onClick={handleAddInvitado}>＋</button>
                      ) : (
                        <button type="button" className="btn-dyn-remove" onClick={() => handleRemoveInvitado(index)}>✕</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECCIÓN: REQUERIMIENTOS */}
        <h3 className="form-section-title">Requerimientos</h3>

        <div className="lower-requirements-card">

          <div className="form-field-group">
            <label>Requerimientos solicitados</label>
            <textarea rows="3" value={requerimientos} onChange={(e) => setRequerimientos(e.target.value)} />
          </div>

          <div className="form-field-group">
            <label>Área de Departamento que lo solicita</label>
            <input type="text" placeholder="Ej. Direccion de Division de Ingenierias" value={departamento} onChange={(e) => setDepartamento(e.target.value)} />
          </div>

        </div>

        {/* SECCIÓN: SERVICIOS REQUERIDOS */}
        <h3 className="form-section-title">Servicios Requeridos</h3>

        <div className="lower-requirements-card">

          <div className="services-checkboxes-section">

            <label className="checkbox-item-row">
              <input type="checkbox" checked={servicios.diseno} onChange={(e) => setServicios({...servicios, diseno: e.target.checked})} />
              <span>Diseño de promocional <small>(La solicitud debe hacerse con un mínimo de 10 días hábiles)</small></span>
            </label>

            <label className="checkbox-item-row">
              <input type="checkbox" checked={servicios.fotografia} onChange={(e) => setServicios({...servicios, fotografia: e.target.checked})} />
              <span>Fotografía en el evento</span>
            </label>

            <label className="checkbox-item-row">
              <input type="checkbox" checked={servicios.redes} onChange={(e) => setServicios({...servicios, redes: e.target.checked})} />
              <span>Publicación en Redes</span>
            </label>

            {/* Servicios adicionales (filas dinámicas) */}
            <div className="extra-services-list">
              <label className="section-subtitle-label">Otros servicios requeridos</label>
              {serviciosExtra.map((servicio, index) => (
                <div key={index} className="dynamic-input-row">
                  <input
                    type="text"
                    placeholder="Especifica otro servicio requerido..."
                    value={servicio}
                    onChange={(e) => handleChangeServicioExtra(index, e.target.value)}
                  />
                  {index === 0 ? (
                    <button type="button" className="btn-dyn-add" onClick={handleAddServicioExtra}>＋</button>
                  ) : (
                    <button type="button" className="btn-dyn-remove" onClick={() => handleRemoveServicioExtra(index)}>✕</button>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* BOTONES INFERIORES DE NAVEGACIÓN */}
        <div className="form-navigation-actions">
          <button type="button" className="btn-cancelar-ficha" onClick={alCancelar}>
            Cancelar
          </button>
          <button type="submit" className="btn-submit-ficha-revision">
            {textoBoton}
          </button>
        </div>

      </form>
    </div>
  );
};

export default FichaEventoEtapa1;
