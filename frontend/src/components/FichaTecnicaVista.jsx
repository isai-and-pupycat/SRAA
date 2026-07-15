import { generarFichaPDF } from '../utils/generarFichaPDF';
import './FichaTecnicaVista.css';

// Mapas para traducir los valores de los <select> a texto legible.
const MAPA_DOCENTES = {
  isai: 'Ing. Isai Rosas Canto',
  julio: 'Mtro. Julio Cen',
};
const MAPA_CARRERAS = {
  '7A': 'ITIIID 7° A',
  '10A': 'ITIIID 10° A',
};

const etiquetaEstado = (estado) => {
  const mapa = {
    validado: 'Validado',
    pendiente: 'Pendiente',
    incompleto: 'Incompleto',
    'en-validacion': 'En validación',
    finalizado: 'Finalizado',
  };
  return mapa[estado] || estado;
};

const FichaTecnicaVista = ({ ficha, alVolver = () => {} }) => {
  if (!ficha) return null;

  // Datos completos de la Etapa 1 (si la ficha fue creada con ellos).
  const t = ficha.tecnica || {};

  const servicios = t.servicios || {};
  const serviciosActivos = [
    servicios.diseno && 'Diseño de promocional',
    servicios.fotografia && 'Fotografía en el evento',
    servicios.redes && 'Publicación en redes',
    ...(t.serviciosExtra || []).filter(Boolean),
  ].filter(Boolean);

  const docentes = (t.docentes || [])
    .filter(Boolean)
    .map((d) => MAPA_DOCENTES[d] || d);

  const carreras = (t.carreras || [])
    .filter(Boolean)
    .map((c) => MAPA_CARRERAS[c] || c);

  const invitados = (t.invitados || []).filter((i) => i.nombre);

  return (
    <div className="ftv-workspace">
      {/* ENCABEZADO */}
      <div className="ftv-header">
        <div className="ftv-header-acciones">
          <button type="button" className="ftv-volver" onClick={alVolver}>
            ← Volver al listado
          </button>
          <button type="button" className="ftv-descargar" onClick={() => generarFichaPDF(ficha)}>
            ⬇ Descargar Ficha Técnica (PDF)
          </button>
        </div>
        <div className="ftv-header-titulo">
          <h1>Ficha Técnica</h1>
          <span className="ftv-folio">Folio: <strong>{ficha.folio || 'N/D'}</strong></span>
        </div>
      </div>

      {/* ESTADO DE LAS ETAPAS */}
      <div className="ftv-estados">
        <span className={`ftv-badge ftv-badge-${ficha.etapa1}`}>Etapa 1: {etiquetaEstado(ficha.etapa1)}</span>
        <span className={`ftv-badge ftv-badge-${ficha.etapa2?.estado}`}>Etapa 2: {etiquetaEstado(ficha.etapa2?.estado)}</span>
        <span className={`ftv-badge ftv-badge-${ficha.etapa3?.estado}`}>Etapa 3: {etiquetaEstado(ficha.etapa3?.estado)}</span>
      </div>

      {/* DATOS GENERALES */}
      <section className="ftv-card">
        <h2>Datos Generales</h2>
        <div className="ftv-grid">
          <div className="ftv-field"><span className="ftv-label">Nombre de la Actividad</span><span className="ftv-value">{ficha.nombre}</span></div>
          <div className="ftv-field"><span className="ftv-label">Programa Educativo</span><span className="ftv-value">{t.programa || ficha.carrera}</span></div>
          <div className="ftv-field"><span className="ftv-label">Lugar del Evento</span><span className="ftv-value">{t.lugar || 'N/D'}</span></div>
          <div className="ftv-field"><span className="ftv-label">Tipo de Evento</span><span className="ftv-value">{t.tipoEvento || 'N/D'}</span></div>
          <div className="ftv-field"><span className="ftv-label">Fecha</span><span className="ftv-value">{ficha.fecha}</span></div>
          <div className="ftv-field"><span className="ftv-label">Horario</span><span className="ftv-value">{ficha.hora}</span></div>
          <div className="ftv-field"><span className="ftv-label">Carrera / Grupo</span><span className="ftv-value">{carreras.length ? carreras.join(', ') : 'N/D'}</span></div>
          <div className="ftv-field"><span className="ftv-label">Área que solicita</span><span className="ftv-value">{t.departamento || 'N/D'}</span></div>
        </div>
      </section>

      {/* OBJETIVO */}
      <section className="ftv-card">
        <h2>Objetivo</h2>
        <p className="ftv-parrafo">{t.objetivo || 'Sin objetivo registrado.'}</p>
      </section>

      {/* RESPONSABLES E INVITADOS */}
      <section className="ftv-card">
        <h2>Responsables e Invitados</h2>
        <div className="ftv-subseccion">
          <span className="ftv-label">Docentes Responsables</span>
          {docentes.length ? (
            <ul className="ftv-lista">{docentes.map((d, i) => <li key={i}>{d}</li>)}</ul>
          ) : (
            <p className="ftv-vacio">No se registraron docentes.</p>
          )}
        </div>
        <div className="ftv-subseccion">
          <span className="ftv-label">Invitados Especiales</span>
          {invitados.length ? (
            <ul className="ftv-lista">{invitados.map((inv, i) => <li key={i}>{inv.nombre}{inv.cargo ? ` — ${inv.cargo}` : ''}</li>)}</ul>
          ) : (
            <p className="ftv-vacio">No se registraron invitados.</p>
          )}
        </div>
      </section>

      {/* REQUERIMIENTOS Y SERVICIOS */}
      <section className="ftv-card">
        <h2>Requerimientos y Servicios</h2>
        <div className="ftv-subseccion">
          <span className="ftv-label">Requerimientos</span>
          <p className="ftv-parrafo">{t.requerimientos || 'Sin requerimientos registrados.'}</p>
        </div>
        <div className="ftv-subseccion">
          <span className="ftv-label">Servicios Requeridos</span>
          {serviciosActivos.length ? (
            <ul className="ftv-lista">{serviciosActivos.map((s, i) => <li key={i}>{s}</li>)}</ul>
          ) : (
            <p className="ftv-vacio">No se solicitaron servicios.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default FichaTecnicaVista;
