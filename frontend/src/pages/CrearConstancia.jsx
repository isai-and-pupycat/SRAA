import { useState, useEffect } from 'react';
import './CrearConstancia.css';
import { generarConstanciaPDF } from '../utils/generarConstanciaPDF';
import { obtenerUsuarios } from '../services/usuariosService';
import { crearConstancia } from '../services/constanciasService';

// Iniciales para el avatar del chip, ignorando el título (Ing., Mtr., Lic.).
const getIniciales = (nombre) => {
  const partes = nombre.split(' ').filter((p) => !p.endsWith('.'));
  return partes.slice(0, 2).map((p) => p[0]).join('').toUpperCase();
};

const CrearConstancia = ({
  emisor = '',
  alGenerar = () => {},
  alVisualizar = () => {},
}) => {
  // Estado único con todos los campos del formulario
  const [form, setForm] = useState({
    evento: '',
    tipoReconocimiento: 'Constancia',
    fechaExpedicion: '2026-06-04',
    paraProfesores: 'No',
    invitados: '',
    textoPersonalizado:
      'Por su destacada labor como docente responsable en la muestra académica ARTMOSFERA 2025.',
  });
  // Usuarios reales del sistema (destinatarios posibles de la constancia).
  const [docentes, setDocentes] = useState([]);
  // Ids de los docentes seleccionados como destinatarios
  const [destinatarios, setDestinatarios] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Carga TODOS los usuarios aprobados (estatus activo), sin importar el rol.
  useEffect(() => {
    obtenerUsuarios()
      .then((lista) => {
        const activos = lista.filter((u) => u.estatus === 'activo');
        setDocentes(activos.map((u) => ({ id: u.id, nombre: u.nombre })));
      })
      .catch(() => setDocentes([]));
  }, []);

  // Logo del documento: null = logo oficial de la UPB; dataURL = imagen subida.
  const [logoPersonalizado, setLogoPersonalizado] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Carga una imagen elegida por el usuario y la guarda como dataURL.
  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setLogoPersonalizado(reader.result);
    reader.readAsDataURL(file);
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

  // Invitados/visitantes externos: se separan por coma o por salto de línea.
  const invitados = form.invitados
    .split(/[\n,]+/)
    .map((n) => n.trim())
    .filter(Boolean);

  // Todos los que reciben documento: docentes del sistema + invitados externos.
  const todosDestinatarios = [...seleccionados.map((d) => d.nombre), ...invitados];

  // Arma los datos que necesita el generador del PDF (nombres de los destinatarios).
  const construirDatosPDF = () => ({
    tipo: form.tipoReconocimiento,
    evento: form.evento.trim(),
    fecha: form.fechaExpedicion,
    texto: form.textoPersonalizado,
    destinatarios: todosDestinatarios,
    logo: logoPersonalizado, // null = usa el logo oficial de la UPB
  });

  const handleGenerar = async (e) => {
    e.preventDefault();
    setMensaje('');

    // Validaciones mínimas antes de "enviar"
    if (!form.evento.trim()) {
      setMensaje('⚠️ Escribe el nombre de la actividad o evento.');
      return;
    }
    if (todosDestinatarios.length === 0) {
      setMensaje('⚠️ Agrega al menos un docente o invitado destinatario.');
      return;
    }

    const tituloEvento = form.evento.trim();

    setEnviando(true);
    generarConstanciaPDF(construirDatosPDF()); // descarga el PDF (una página por destinatario)

    // Guarda una constancia por docente (aparece en su "Mis Constancias") y una
    // por invitado externo (queda en el registro de constancias emitidas).
    const comun = {
      titulo: tituloEvento,
      tipo: form.tipoReconocimiento,
      fecha: form.fechaExpedicion,
      descripcion: form.textoPersonalizado,
      para_profesores: form.paraProfesores,
      emitida_por: emisor,
    };
    try {
      await Promise.all([
        ...seleccionados.map((d) =>
          crearConstancia({ ...comun, destinatario: d.nombre, destinatario_id: d.id, es_invitado: false })
        ),
        ...invitados.map((nombre) =>
          crearConstancia({ ...comun, destinatario: nombre, destinatario_id: null, es_invitado: true })
        ),
      ]);
      setMensaje(
        `✅ ${form.tipoReconocimiento} emitida para ${todosDestinatarios.length} destinatario(s). Los docentes ya la ven en su "Mis Constancias" y se descargó el PDF oficial.`
      );
      alGenerar({ ...form, destinatarios });
    } catch {
      setMensaje(
        '⚠️ Se generó el PDF, pero no se pudo guardar en el portal. Revisa que el backend esté encendido.'
      );
    } finally {
      setEnviando(false);
    }
  };

  const handleVisualizar = () => {
    if (!form.evento.trim() || todosDestinatarios.length === 0) {
      setMensaje('⚠️ Escribe una actividad y agrega al menos un destinatario para visualizar.');
      return;
    }
    generarConstanciaPDF(construirDatosPDF(), { preview: true }); // vista previa en pestaña nueva
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
          <input
            id="crc-evento"
            type="text"
            name="evento"
            value={form.evento}
            onChange={handleChange}
            placeholder="Escribe el nombre del evento o actividad..."
          />
        </div>

        {/* Logo del documento */}
        <div className="crc-field">
          <label>Logo del documento</label>
          <div className="crc-logo-row">
            <div className="crc-logo-preview">
              <img
                src={logoPersonalizado || '/img/logo-vertical-blanco@2x.png'}
                alt="Vista previa del logo"
              />
            </div>
            <div className="crc-logo-actions">
              <label className="crc-btn-logo">
                📁 Subir imagen
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  style={{ display: 'none' }}
                />
              </label>
              {logoPersonalizado && (
                <button
                  type="button"
                  className="crc-btn-logo-reset"
                  onClick={() => setLogoPersonalizado(null)}
                >
                  Usar logo de la UPB
                </button>
              )}
            </div>
          </div>
          <span className="crc-hint">
            {logoPersonalizado
              ? 'Se usará la imagen que subiste. Puedes volver al logo oficial cuando quieras.'
              : 'Se usará el logo oficial de la UPB. Sube una imagen para reemplazarlo.'}
          </span>
        </div>

        {/* Tipo de Reconocimiento + Fecha de Expedición */}
        <div className="crc-row-2">
          <div className="crc-field">
            <label htmlFor="crc-tipo">Tipo de Reconocimiento</label>
            <select
              id="crc-tipo"
              name="tipoReconocimiento"
              value={form.tipoReconocimiento}
              onChange={handleChange}
            >
              <option value="Constancia">Constancia</option>
              <option value="Reconocimiento">Reconocimiento</option>
              <option value="Diploma">Diploma</option>
            </select>
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

        {/* ¿Es para profesores? + Invitados especiales */}
        <div className="crc-row-2">
          <div className="crc-field">
            <label htmlFor="crc-profesores">¿Es para profesores?</label>
            <select
              id="crc-profesores"
              name="paraProfesores"
              value={form.paraProfesores}
              onChange={(e) => {
                const value = e.target.value;
                // Si es para profesores, no aplican invitados externos: se limpia.
                setForm((prev) => ({
                  ...prev,
                  paraProfesores: value,
                  invitados: value === 'Sí' ? '' : prev.invitados,
                }));
              }}
            >
              <option value="No">No</option>
              <option value="Sí">Sí</option>
            </select>
          </div>
          <div className="crc-field">
            <label htmlFor="crc-invitados">Visitantes o invitados especiales</label>
            <input
              id="crc-invitados"
              type="text"
              name="invitados"
              value={form.invitados}
              onChange={handleChange}
              disabled={form.paraProfesores === 'Sí'}
              placeholder={
                form.paraProfesores === 'Sí'
                  ? 'No aplica: la constancia es para profesores'
                  : 'Nombres separados por coma...'
              }
            />
            <span className="crc-hint">
              Externos que no están en el sistema. Cada uno recibe su propio documento.
            </span>
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
        <button type="submit" className="crc-btn-generar" disabled={enviando}>
          {enviando ? 'Enviando…' : 'Enviar'}
        </button>
      </form>
    </div>
  );
};

export default CrearConstancia;
