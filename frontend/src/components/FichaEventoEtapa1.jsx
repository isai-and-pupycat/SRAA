import { useState } from 'react';
import './FichaEvento.css';

const FichaEventoEtapa1 = ({ alAvanzar, alCancelar }) => {
  // Estados para inputs convencionales
  const [programa, setPrograma] = useState("Ingenieria en Tecnologias de la Informacion e Innovacion Digital");
  const [lugar, setLugar] = useState("Laboratorio de Computo / Auditorio UPB");
  const [nombreActividad, setNombreActividad] = useState("Participacion Hackaton Come Datos 2025");
  const [fechaInicio, setFechaInicio] = useState("2026-06-16");
  const [fechaFin, setFechaFin] = useState("2026-06-17");
  const [horaInicio, setHoraInicio] = useState("09:00");
  const [horaFin, setHoraFin] = useState("14:00");
  const [tipoEvento, setTipoEvento] = useState("Academico");
  const [objetivo, setObjetivo] = useState("Fomentar el desarrollo de soluciones tecnológicas innovadoras mediante el uso de análisis de datos abiertos, permitiendo a los estudiantes de la universidad aplicar competencias clave de ingeniería en escenarios del entorno real gubernamental.");
  const [departamento, setDepartamento] = useState("");
  const [requerimientos, setRequerimientos] = useState("Extensiones\nMesas\nLimpieza");

  // Estados para arreglos dinámicos (+ / x)
  const [carreras, setCarreras] = useState([""]);
  const [docentes, setDocentes] = useState([""]);
  
  // Control de Invitados Especiales (Lógica Condicional)
  const [requiereInvitados, setRequiereInvitados] = useState("si");
  const [invitados, setInvitados] = useState([{ nombre: "", cargo: "" }]);

  // Checkboxes de Servicios Requeridos
  const [servicios, setServicios] = useState({
    diseno: true,
    fotografia: true,
    redes: true
  });

  // Funciones manejadoras para campos dinámicos
  const handleAddCarrera = () => setCarreras([...carreras, ""]);
  const handleRemoveCarrera = (index) => setCarreras(carreras.filter((_, i) => i !== index));
  
  const handleAddDocente = () => setDocentes([...docentes, ""]);
  const handleRemoveDocente = (index) => setDocentes(docentes.filter((_, i) => i !== index));

  const handleAddInvitado = () => setInvitados([...invitados, { nombre: "", cargo: "" }]);
  const handleRemoveInvitado = (index) => setInvitados(invitados.filter((_, i) => i !== index));

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Enviando datos de la Etapa 1 para revisión...", {
      programa, lugar, nombreActividad, carreras, fechaInicio, fechaFin,
      horaInicio, horaFin, tipoEvento, objetivo, docentes, requiereInvitados,
      invitados, requerimientos, departamento, servicios
    });
    alAvanzar(); // Pasa a la Etapa 2
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
      </div>

      {/* FORMULARIO PRINCIPAL */}
      <form onSubmit={handleSubmit} className="ficha-evento-form-grid">
        
        {/* FILA 1: PROGRAMA Y LUGAR */}
        <div className="form-row-two-columns">
          <div className="form-field-group">
            <label>Programa Educativo</label>
            <select value={programa} onChange={(e) => setPrograma(e.target.value)}>
              <option value="Ingenieria en Tecnologias de la Informacion e Innovacion Digital">
                Ingenieria en Tecnologias de la Informacion e Innovacion Digital
              </option>
            </select>
          </div>
          <div className="form-field-group">
            <label>Lugar del Evento</label>
            <input type="text" value={lugar} onChange={(e) => setLugar(e.target.value)} />
          </div>
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
              <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
              <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
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

        {/* FILA 4: TIPO DE EVENTO */}
        <div className="form-field-group full-width-field">
          <label>Tipo de Evento</label>
          <select value={tipoEvento} onChange={(e) => setTipoEvento(e.target.value)}>
            <option value="Academico">Academico</option>
            <option value="Cultural">Cultural</option>
            <option value="Deportivo">Deportivo</option>
          </select>
        </div>

        {/* FILA 5: OBJETIVO TEXTAREA */}
        <div className="form-field-group full-width-field">
          <label>Objetivo</label>
          <textarea rows="4" value={objetivo} onChange={(e) => setObjetivo(e.target.value)} />
        </div>

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
                <option value="isai">Ing. Isai Rosas Canto</option>
                <option value="julio">Mtro. Julio Cen</option>
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

        {/* BLOQUE INFERIOR: REQUERIMIENTOS Y SERVICIOS (image_733f3b.png) */}
        <div className="lower-requirements-card">
          
          <div className="form-field-group">
            <label>Requerimientos solicitados</label>
            <textarea rows="3" value={requerimientos} onChange={(e) => setRequerimientos(e.target.value)} />
          </div>

          <div className="form-field-group">
            <label>Área de Departamento que lo solicita</label>
            <input type="text" placeholder="Ej. Direccion de Division de Ingenierias" value={departamento} onChange={(e) => setDepartamento(e.target.value)} />
          </div>

          <div className="services-checkboxes-section">
            <label className="section-subtitle-label">Servicios Requeridos</label>
            
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
          </div>

        </div>

        {/* BOTONES INFERIORES DE NAVEGACIÓN */}
        <div className="form-navigation-actions">
          <button type="button" className="btn-cancelar-ficha" onClick={alCancelar}>
            Cancelar
          </button>
          <button type="submit" className="btn-submit-ficha-revision">
            Siguiente: Etapa 
          </button>
        </div>

      </form>
    </div>
  );
};

export default FichaEventoEtapa1;
