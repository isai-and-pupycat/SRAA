import { useState } from 'react';
import './FichaEventoEtapa3.css';

const FichaEventoEtapa3 = ({ alFinalizar, alRetroceder }) => {
  // Estados para los textos descriptivos de image_7ea45d.png
  const [descripcion, setDescripcion] = useState(
    'Se participó activamente en calidad de asesor técnico del equipo "Dataflow", integrado por estudiantes del programa educativo. Durante el desarrollo del Hackatón Come Datos 2025, el equipo se enfocó en el análisis, diseño e implementación de una plataforma web orientada al procesamiento de datos abiertos.'
  );
  
  const [logroImpacto, setLogroImpacto] = useState(
    'Se logró consolidar el prototipo funcional de la plataforma dentro de los tiempos estipulados por la convocatoria, obteniendo un reconocimiento destacado entre los proyectos finalistas.'
  );

  // Estados para almacenar la información de los archivos
  const [archivoAsistencia, setArchivoAsistencia] = useState(null);
  const [archivoEvidencia, setArchivoEvidencia] = useState(null);

  const handleFileChange = (e, target) => {
    const file = e.target.files[0];
    if (!file) return;

    if (target === 'asistencia') {
      setArchivoAsistencia(file);
    } else if (target === 'evidencia') {
      setArchivoEvidencia(file);
    }
  };

  const handleSubmitFinal = (e) => {
    e.preventDefault();
    console.log('¡Formulario Finalizado! Enviando Ficha completa al servidor...', {
      descripcion,
      logroImpacto,
      archivoAsistencia: archivoAsistencia?.name || 'No cargado',
      archivoEvidencia: archivoEvidencia?.name || 'No cargado'
    });
    alFinalizar(); // Ejecuta el guardado y regresa al inicio
  };

  return (
    <div className="sraa-stage3-workspace">
      
      {/* STEPPER DE AVANCE (image_7ea45d.png) */}
      <div className="form-stepper-container">
        <div className="step-item completed">
          <span className="step-number">✓</span>
          <span className="step-label">Etapa 1: Ficha Técnica</span>
        </div>
        <div className="step-line completed-line"></div>
        <div className="step-item completed">
          <span className="step-number">✓</span>
          <span className="step-label">Etapa 2: Estructura del Orden del Día</span>
        </div>
        <div className="step-line completed-line"></div>
        <div className="step-item active">
          <span className="step-number">3</span>
          <span className="step-label">Etapa 3: Cierre y Evidencias</span>
        </div>
      </div>

      {/* FORMULARIO FINAL */}
      <form onSubmit={handleSubmitFinal} className="ficha-final-form-flow">
        
        {/* CAMPO: DESCRIPCIÓN */}
        <div className="final-field-group">
          <label className="final-input-label">Descripción</label>
          <textarea 
            rows="5" 
            className="final-textarea"
            value={descripcion} 
            onChange={(e) => setDescripcion(e.target.value)}
          />
        </div>

        {/* CAMPO: LOGRO / IMPACTO */}
        <div className="final-field-group">
          <label className="final-input-label">Logro / Impacto</label>
          <textarea 
            rows="5" 
            className="final-textarea"
            value={logroImpacto} 
            onChange={(e) => setLogroImpacto(e.target.value)}
          />
        </div>

        {/* ZONA DE CARGA: LISTA DE ASISTENCIA */}
        <div className="final-field-group">
          <label className="final-input-label section-heading-label">Lista de asistencia</label>
          <label className="file-drop-zone-container">
            <input 
              type="file" 
              accept=".jpg,.jpeg,.png,.pdf" 
              className="hidden-file-input" 
              onChange={(e) => handleFileChange(e, 'asistencia')}
            />
            <div className="drop-zone-content">
              <span className="upload-cloud-icon">☁️</span>
              <p className="primary-drop-text">
                {archivoAsistencia ? `Archivo seleccionado: ${archivoAsistencia.name}` : 'Haz clic o arrastra las fotografías aquí Formatos soportados'}
              </p>
              <p className="secondary-drop-text">Formatos soportados: JPG, PNG, PDF.</p>
            </div>
          </label>
        </div>

        {/* ZONA DE CARGA: EVIDENCIA FOTOGRÁFICA */}
        <div className="final-field-group">
          <label className="final-input-label">Evidencia fotografica</label>
          <label className="file-drop-zone-container">
            <input 
              type="file" 
              accept=".jpg,.jpeg,.png" 
              className="hidden-file-input" 
              onChange={(e) => handleFileChange(e, 'evidencia')}
            />
            <div className="drop-zone-content">
              <span className="upload-cloud-icon">☁️</span>
              <p className="primary-drop-text">
                {archivoEvidencia ? `Archivo seleccionado: ${archivoEvidencia.name}` : 'Haz clic o arrastra las fotografías aquí'}
              </p>
              <p className="secondary-drop-text">Formatos soportados: JPG, PNG (Máx. 5MB por foto)</p>
            </div>
          </label>
        </div>

        {/* ACCIONES DE NAVEGACIÓN DEL FORMULARIO */}
        <div className="stage3-footer-navigation">
          <button type="button" className="btn-nav-back" onClick={alRetroceder}>Atrás</button>
          <button type="submit" className="btn-submit-finalize-form">
            ENVIAR PARA FINALIZAR
          </button>
        </div>

      </form>
    </div>
  );
};

export default FichaEventoEtapa3;
