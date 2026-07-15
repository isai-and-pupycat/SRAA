import { useState, useEffect } from 'react';
import './Constancias.css';
import { obtenerConstancias } from '../services/constanciasService';
import { generarConstanciaPDF } from '../utils/generarConstanciaPDF';

/*
 * "Mis Constancias" del docente: repositorio de los reconocimientos que el
 * coordinador le emitió desde "Crear Constancia". Se cargan del backend
 * filtrando por el docente que inició sesión, y cada tarjeta descarga el
 * PDF oficial (regenerado con los datos guardados).
 *
 * Estructura de cada constancia (backend):
 * { id, titulo, tipo, rol, fecha, descripcion, destinatario, destinatario_id }
 */
const Constancias = ({ usuario = null }) => {
  const [constancias, setConstancias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [anio, setAnio] = useState('todos');

  // Carga SOLO las constancias del docente actual (por id; si no, por nombre).
  useEffect(() => {
    // Sin usuario identificable no se muestra ninguna (nunca las de todos).
    if (!usuario?.id && !usuario?.nombre) {
      setConstancias([]);
      setCargando(false);
      return;
    }
    const filtros = usuario?.id
      ? { destinatario_id: usuario.id }
      : { destinatario: usuario.nombre };
    setCargando(true);
    obtenerConstancias(filtros)
      .then(setConstancias)
      .catch((error) => {
        console.error('No se pudieron cargar las constancias:', error);
        setConstancias([]);
      })
      .finally(() => setCargando(false));
  }, [usuario]);

  // Años únicos, extraídos del final del texto de cada fecha (ej: "...2026").
  const anios = [
    ...new Set(
      constancias
        .map((c) => (String(c.fecha || '').match(/\d{4}/) || [])[0])
        .filter(Boolean)
    ),
  ].sort().reverse();

  // Filtrado por texto (título/descripción) y por año de emisión.
  const constanciasFiltradas = constancias.filter((c) => {
    const texto = busqueda.trim().toLowerCase();
    const coincideTexto =
      texto === '' ||
      (c.titulo || '').toLowerCase().includes(texto) ||
      (c.descripcion || '').toLowerCase().includes(texto);
    const coincideAnio = anio === 'todos' || String(c.fecha || '').includes(anio);
    return coincideTexto && coincideAnio;
  });

  // Descarga el PDF oficial regenerándolo con los datos guardados.
  const descargar = (c) => {
    generarConstanciaPDF({
      tipo: c.tipo || 'Constancia',
      evento: c.titulo || '',
      fecha: c.fecha || '',
      texto: c.descripcion || '',
      destinatarios: [c.destinatario || usuario?.nombre || ''],
    });
  };

  return (
    <div className="constancias-workspace">
      {/* ENCABEZADO */}
      <div className="constancias-header">
        <h2>Mis Constancias Oficiales</h2>
        <p>Repositorio digital de todos tus reconocimientos y certificados validados por la Coordinación.</p>
      </div>

      {/* BARRA DE FILTROS */}
      <div className="constancias-toolbar">
        <div className="constancias-busqueda">
          <span className="icono-busqueda">🔍</span>
          <input
            type="text"
            placeholder="Buscar por nombre del evento"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className="constancias-filtro-anio">
          <label htmlFor="filtro-anio">Año de Emisión</label>
          <select
            id="filtro-anio"
            value={anio}
            onChange={(e) => setAnio(e.target.value)}
          >
            <option value="todos">Todos</option>
            {anios.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* REJILLA DE TARJETAS */}
      {cargando ? (
        <div className="constancias-vacio">Cargando tus constancias…</div>
      ) : constanciasFiltradas.length === 0 ? (
        <div className="constancias-vacio">
          Aún no tienes constancias emitidas. Cuando la Coordinación te emita una, aparecerá aquí.
        </div>
      ) : (
        <div className="constancias-grid">
          {constanciasFiltradas.map((constancia) => (
            <article className="constancia-card" key={constancia.id}>
              {/* Cabecera azul con el nombre del evento */}
              <header className="constancia-card-head">
                {constancia.tipo && (
                  <span className="constancia-tipo-badge">{constancia.tipo}</span>
                )}
                <h3>{constancia.titulo}</h3>
              </header>

              {/* Cuerpo con detalles */}
              <div className="constancia-card-body">
                {constancia.descripcion && (
                  <p className="constancia-descripcion">{constancia.descripcion}</p>
                )}

                <div className="constancia-meta">
                  <p>
                    <span className="meta-label">Emitida:</span> {constancia.fecha}
                  </p>
                  {constancia.rol && (
                    <p>
                      <span className="meta-label">Rol:</span> {constancia.rol}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  className="btn-descargar-pdf"
                  onClick={() => descargar(constancia)}
                >
                  ⬇ Descargar PDF
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default Constancias;
