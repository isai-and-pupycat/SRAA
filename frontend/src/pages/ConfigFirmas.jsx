import { useState, useEffect } from 'react';
import './AprobacionEventos.css';
import './AdminCrud.css';
import { obtenerConfig, guardarConfig } from '../services/configService';

/*
 * Configuración de las firmas institucionales que aparecen en los documentos
 * (Ficha Técnica). Solo accesible desde el panel del coordinador.
 */
const CAMPOS = [
  { clave: 'autoriza_nombre', etiqueta: 'AUTORIZA — Nombre', placeholder: 'MTRO. JULIO MANUEL CEN CAN' },
  { clave: 'autoriza_cargo', etiqueta: 'AUTORIZA — Cargo', placeholder: 'Coordinador de las Ingenierías' },
  { clave: 'vobo_nombre', etiqueta: 'Vo.Bo. — Nombre', placeholder: 'MTRA. MARÍA DE LOS ÁNGELES DÍAZ MARTÍN' },
  { clave: 'vobo_cargo', etiqueta: 'Vo.Bo. — Cargo', placeholder: 'Secretaría Académica de la UPB' },
];

const ConfigFirmas = () => {
  const [valores, setValores] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    obtenerConfig()
      .then(setValores)
      .catch((error) => console.error('No se pudo cargar la configuración:', error));
  }, []);

  const cambiar = (clave, valor) => {
    setValores((prev) => ({ ...prev, [clave]: valor }));
    setMensaje('');
  };

  const guardar = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setMensaje('');
    try {
      const soloFirmas = {};
      CAMPOS.forEach((c) => {
        soloFirmas[c.clave] = valores[c.clave] || '';
      });
      const actualizado = await guardarConfig(soloFirmas);
      setValores(actualizado);
      setMensaje('✔ Firmas guardadas. Los próximos documentos las usarán.');
    } catch (error) {
      console.error('Error al guardar firmas:', error);
      setMensaje('✕ No se pudo guardar. Revisa que el backend esté encendido.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="ap-workspace">
      <div className="ap-title-section">
        <h1>Firmas de Documentos</h1>
        <p className="adm-subtitulo">
          Define quién <strong>Autoriza</strong> y da el <strong>Vo.Bo.</strong> en la Ficha Técnica.
          Estos datos varían, así que solo el coordinador los administra aquí.
        </p>
      </div>

      <div className="ap-tabla-card" style={{ padding: '24px', maxWidth: '640px' }}>
        <form onSubmit={guardar} className="adm-form">
          {CAMPOS.map((campo) => (
            <div className="adm-field" key={campo.clave}>
              <label>{campo.etiqueta}</label>
              <input
                type="text"
                value={valores[campo.clave] ?? ''}
                placeholder={campo.placeholder}
                onChange={(e) => cambiar(campo.clave, e.target.value)}
              />
            </div>
          ))}

          {mensaje && (
            <p style={{ margin: '4px 0 0', fontSize: '0.85rem', fontWeight: 600, color: mensaje.startsWith('✔') ? '#15803d' : '#b91c1c' }}>
              {mensaje}
            </p>
          )}

          <div className="adm-form-actions">
            <button type="submit" className="adm-btn-guardar" disabled={guardando}>
              {guardando ? 'Guardando…' : 'Guardar firmas'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConfigFirmas;
