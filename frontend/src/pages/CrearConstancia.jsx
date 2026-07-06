import { useState } from 'react';
import './CrearConstancia.css';

/*
 * Datos por defecto (reemplazables por props desde el backend).
 * - eventos: actividades YA validadas/concluidas, elegibles para constancia.
 * - docentes: usuarios del sistema que pueden ser destinatarios.
 */
const EVENTOS_DEFAULT = [
  { id: 1, nombre: 'Muestra académica ARTMOSFERA 2025' },
  { id: 2, nombre: 'Conmemora UPB el Día de las Madres' },
  { id: 3, nombre: 'Laboratorio de Redes Cisco' },
];

const DOCENTES_DEFAULT = [
  { id: 1, nombre: 'Ing. Isai Rosas Canto' },
  { id: 2, nombre: 'Mtr. Erick Koyoc Pech' },
  { id: 3, nombre: 'Lic. Elena Zapata' },
  { id: 4, nombre: 'Mtro. Fabián Johanan' },
  { id: 5, nombre: 'Lic. Oscar Enrique' },
];

// Iniciales para el avatar del chip, ignorando el título (Ing., Mtr., Lic.).
const getIniciales = (nombre) => {
  const partes = nombre.split(' ').filter((p) => !p.endsWith('.'));
  return partes.slice(0, 2).map((p) => p[0]).join('').toUpperCase();
};

const CrearConstancia = ({
  eventos = EVENTOS_DEFAULT,
  docentes = DOCENTES_DEFAULT,
  alGenerar = () => {},
  alVisualizar = () => {},
}) => {
  // Estado único con todos los campos del formulario
  const [form, setForm] = useState({
    evento: '',
    tipoReconocimiento: 'Docente Responsable',
    fechaExpedicion: '2026-06-04',
    textoPersonalizado:
      'Por su destacada labor como docente responsable en la muestra académica ARTMOSFERA 2025.',
  });
  // Ids de los docentes seleccionados como destinatarios
  const [destinatarios, setDestinatarios] = useState([1, 2]);
  const [mensaje, setMensaje] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Docentes ya seleccionados (objetos completos) y los aún disponibles
  const seleccionados = docentes.filter((d) => destinatarios.includes(d.id));
  const disponibles = docentes.filter((d) => !destinatarios.includes(d.id));

  const agregarDestinatario = (e) => {
    const id = Number(e.target.value);
    if (id && !destinatarios.includes(id)) {
      setDestinatarios((prev) => [...prev, id]);
    }
  };
  const quitarDestinatario = (id) => {
    setDestinatarios((prev) => prev.filter((d) => d !== id));
  };

  const handleGenerar = (e) => {
    e.preventDefault();
    setMensaje('');

    // Validaciones mínimas antes de "enviar"
    if (!form.evento) {
      setMensaje('⚠️ Selecciona una actividad autorizada.');
      return;
    }
    if (destinatarios.length === 0) {
      setMensaje('⚠️ Selecciona al menos un docente destinatario.');
      return;
    }

    const payload = { ...form, destinatarios };
    // Simulación del envío (aquí conectarás tu API real)
    console.log('Generando y enviando constancia al portal:', payload);
    alGenerar(payload);
    setMensaje(
      `✅ Constancia generada y enviada a ${destinatarios.length} docente(s). Se adjuntó a su apartado "Mis Constancias".`
    );
  };

  const handleVisualizar = () => {
    console.log('Vista previa de la constancia:', { ...form, destinatarios });
    alVisualizar({ ...form, destinatarios });
  };

  return (
    <div className="crc-workspace">
      {/* ENCABEZADO */}
      <div className="crc-title-section">
        <h1>Crear Constancia</h1>
        <p>Selecciona los perfiles de los docentes involucrados para emitir sus documentos y mandarlos a su portal.</p>
      </div>

      {/* CARD DEL FORMULARIO */}
      <form className="crc-card" onSubmit={handleGenerar}>
        {/* Cabecera del card: título + botón visualizar */}
        <div className="crc-card-head">
          <h2>Parámetros de Emisión</h2>
          <button type="button" className="crc-btn-visualizar" onClick={handleVisualizar}>
            Visualizar constancia
          </button>
        </div>

        {mensaje && <div className="crc-alert">{mensaje}</div>}

        {/* Evento / Actividad Autorizada */}
        <div className="crc-field">
          <label htmlFor="crc-evento">Evento / Actividad Autorizada</label>
          <select
            id="crc-evento"
            name="evento"
            value={form.evento}
            onChange={handleChange}
          >
            <option value="">Seleccione una actividad concluida...</option>
            {eventos.map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Tipo de Reconocimiento + Fecha de Expedición */}
        <div className="crc-row-2">
          <div className="crc-field">
            <label htmlFor="crc-tipo">Tipo de Reconocimiento</label>
            <input
              id="crc-tipo"
              type="text"
              name="tipoReconocimiento"
              value={form.tipoReconocimiento}
              onChange={handleChange}
              placeholder="Ej. Docente Responsable"
            />
          </div>
          <div className="crc-field">
            <label htmlFor="crc-fecha">Fecha de Expedición</label>
            <input
              id="crc-fecha"
              type="date"
              name="fechaExpedicion"
              value={form.fechaExpedicion}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Texto Personalizado */}
        <div className="crc-field">
          <label htmlFor="crc-texto">Texto Personalizado (Cuerpo del diploma)</label>
          <textarea
            id="crc-texto"
            name="textoPersonalizado"
            rows="4"
            value={form.textoPersonalizado}
            onChange={handleChange}
          />
        </div>

        {/* Destinatarios (chips) */}
        <div className="crc-field">
          <label>Destinatarios (Docentes en el sistema)</label>
          <div className="crc-chips-box">
            {seleccionados.map((d) => (
              <span className="crc-chip" key={d.id}>
                <span className="crc-chip-avatar">{getIniciales(d.nombre)}</span>
                <span className="crc-chip-nombre">{d.nombre}</span>
                <button
                  type="button"
                  className="crc-chip-remove"
                  onClick={() => quitarDestinatario(d.id)}
                  aria-label={`Quitar ${d.nombre}`}
                >
                  ✕
                </button>
              </span>
            ))}

            {disponibles.length > 0 && (
              <select className="crc-chip-add" value="" onChange={agregarDestinatario}>
                <option value="">+ Agregar docente...</option>
                {disponibles.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nombre}
                  </option>
                ))}
              </select>
            )}
          </div>
          <span className="crc-hint">
            La constancia se adjuntará directamente al apartado &quot;Mis Constancias&quot; de cada usuario.
          </span>
        </div>

        {/* Botón principal */}
        <button type="submit" className="crc-btn-generar">
          Generar y Enviar al Portal
        </button>
      </form>
    </div>
  );
};

export default CrearConstancia;
