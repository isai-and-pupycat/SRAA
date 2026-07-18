import { useState } from 'react';
import './FichaEventoEtapa3.css';

// Convierte un archivo (File) a dataURL base64 para guardarlo / incrustarlo en el PDF.
const archivoADataURL = (file) =>
  new Promise((resolve) => {
    if (!file) return resolve(null);
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(file);
  });

const FichaEventoEtapa3 = ({
  ficha,
  folio,
  alGuardarInforme,
  alFinalizar,
  alRetroceder,
  textoBoton = 'Enviar',
}) => {
  // Datos previos del informe (si se está reeditando una ficha ya finalizada).
  const previo = ficha?.etapa3 || {};
  const folioActivo = ficha?.folio || folio;

  // Estados para los textos descriptivos del Informe de Actividades.
  const [descripcion, setDescripcion] = useState(previo.descripcion || '');

  const [logroImpacto, setLogroImpacto] = useState(previo.logro || '');

  // Beneficiarios: dato del Informe de Actividades (ej. "80 alumnos")
  const [beneficiarios, setBeneficiarios] = useState(previo.beneficiarios || '');

  // Responsables: se toman de la Etapa 1 (Docentes Responsables), no se recapturan.
  const responsablesEtapa1 = (ficha?.tecnica?.docentes || []).filter((r) => r && r.trim());

  // Se guarda mientras la ficha viaja al backend.
  const [guardando, setGuardando] = useState(false);

  // Estados para almacenar la información de los archivos
  const [archivoAsistencia, setArchivoAsistencia] = useState(null);
  const [archivoEvidencia, setArchivoEvidencia] = useState(null);

  // Descripción (pie de figura) de cada imagen. Precargadas al reeditar.
  const [descAsistencia, setDescAsistencia] = useState(previo.fotos?.[0]?.titulo || '');
  const [descEvidencia, setDescEvidencia] = useState(previo.fotos?.[1]?.titulo || '');

  const handleFileChange = (e, target) => {
    const file = e.target.files[0];
    if (!file) return;

    if (target === 'asistencia') {
      setArchivoAsistencia(file);
    } else if (target === 'evidencia') {
      setArchivoEvidencia(file);
    }
  };

  const handleSubmitFinal = async (e) => {
    e.preventDefault();

    // Convierte las fotos a base64 y usa la descripción escrita como pie de figura.
    const tituloAsist = descAsistencia.trim() || 'Asistentes del evento';
    const tituloEvid = descEvidencia.trim() || 'Evidencia del evento';
    const fotos = [];

    const dataAsistencia = await archivoADataURL(archivoAsistencia);
    if (dataAsistencia) {
      fotos.push({ tipo: 'asistencia', titulo: tituloAsist, datos: dataAsistencia });
    } else if (previo.fotos?.[0]) {
      // Sin nueva imagen: conserva la anterior pero actualiza su descripción.
      fotos.push({ ...previo.fotos[0], tipo: 'asistencia', titulo: tituloAsist });
    }

    const dataEvidencia = await archivoADataURL(archivoEvidencia);
    if (dataEvidencia) {
      fotos.push({ tipo: 'evidencia', titulo: tituloEvid, datos: dataEvidencia });
    } else if (previo.fotos?.[1]) {
      fotos.push({ ...previo.fotos[1], tipo: 'evidencia', titulo: tituloEvid });
    }

    const fotosFinales = fotos;

    const datosInforme = {
      descripcion,
      logro: logroImpacto,
      // Responsables heredados de la Etapa 1 (o los que ya tenía el informe).
      responsables: responsablesEtapa1.length ? responsablesEtapa1 : (previo.responsables || []),
      beneficiarios,
      lugar: ficha?.tecnica?.lugar || '',
      fotos: fotosFinales,
    };

    // Flujo real (docente desde el Listado): guarda el informe en el backend.
    if (alGuardarInforme && ficha?.id) {
      try {
        setGuardando(true);
        await alGuardarInforme(ficha.id, datosInforme);
      } finally {
        setGuardando(false);
      }
      return;
    }

    // Flujo legado (creación directa sin ficha asociada): solo finaliza.
    if (alFinalizar) alFinalizar();
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

        {/* ENCABEZADO DEL INFORME + FOLIO ENLAZADO */}
        <div className="final-informe-header">
          <h3 className="final-section-title">Informe de Actividades</h3>
          {folioActivo && (
            <span className="final-folio">Folio: <strong>{folioActivo}</strong></span>
          )}
        </div>

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

        {/* CAMPO: BENEFICIARIOS / NÚMERO (dato del Informe de Actividades) */}
        <div className="final-field-group">
          <label className="final-input-label">Beneficiarios / número</label>
          <input
            type="number"
            min="0"
            className="final-input"
            placeholder="Ej. 80"
            value={beneficiarios}
            onChange={(e) => setBeneficiarios(e.target.value)}
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
          {/* Descripción / pie de la Figura 01 */}
          <input
            type="text"
            className="final-input"
            placeholder="Descripción de la imagen (pie de Figura 01)"
            value={descAsistencia}
            onChange={(e) => setDescAsistencia(e.target.value)}
            style={{ marginTop: '8px' }}
          />
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
          {/* Descripción / pie de la Figura 02 */}
          <input
            type="text"
            className="final-input"
            placeholder="Descripción de la imagen (pie de Figura 02)"
            value={descEvidencia}
            onChange={(e) => setDescEvidencia(e.target.value)}
            style={{ marginTop: '8px' }}
          />
        </div>

        {/* ACCIONES DE NAVEGACIÓN DEL FORMULARIO */}
        <div className="stage3-footer-navigation">
          <button type="button" className="btn-nav-back" onClick={alRetroceder}>Atrás</button>
          <button type="submit" className="btn-submit-finalize-form" disabled={guardando}>
            {guardando ? 'GUARDANDO…' : textoBoton}
          </button>
        </div>

      </form>
    </div>
  );
};

export default FichaEventoEtapa3;
