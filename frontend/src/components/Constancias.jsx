import { useState } from 'react';
import './Constancias.css';

/*
 * Datos de ejemplo. Si no se recibe la prop `constancias`, el componente
 * renderiza estos registros para poder visualizarse de inmediato.
 *
 * Estructura de cada constancia:
 * {
 *   id: number,
 *   titulo: string,
 *   descripcion?: string,   // opcional: detalle bajo el título
 *   fecha: string,          // fecha de emisión, ej: '15 de Octubre, 2026'
 *   rol: string             // rol del docente en el evento
 * }
 */
const CONSTANCIAS_EJEMPLO = [
  {
    id: 1,
    titulo: 'Hackatón Come Datos',
    descripcion: 'Participación Hackatón Come Datos 2025',
    fecha: '15 de Octubre, 2026',
    rol: 'Asesor de Equipo (Dataflow)',
  },
  {
    id: 2,
    titulo: 'Taller de mantenimiento',
    descripcion: 'Taller de mantenimiento de dispositivos',
    fecha: '20 de Junio, 2026',
    rol: 'Maestro',
  },
  {
    id: 3,
    titulo: 'Laboratorio de Redes Cisco',
    descripcion: 'Certificación en configuración de redes empresariales',
    fecha: '08 de Marzo, 2026',
    rol: 'Instructor Certificado',
  },
];

const Constancias = ({ constancias = CONSTANCIAS_EJEMPLO, alDescargar = () => {} }) => {
  const [busqueda, setBusqueda] = useState('');
  const [anio, setAnio] = useState('todos');

  // Años únicos, extraídos del final del texto de cada fecha (ej: "...2026").
  const anios = [
    ...new Set(
      constancias
        .map((c) => (c.fecha.match(/\d{4}/) || [])[0])
        .filter(Boolean)
    ),
  ].sort().reverse();

  // Filtrado por texto (título/descripción) y por año de emisión.
  const constanciasFiltradas = constancias.filter((c) => {
    const texto = busqueda.trim().toLowerCase();
    const coincideTexto =
      texto === '' ||
      c.titulo.toLowerCase().includes(texto) ||
      (c.descripcion || '').toLowerCase().includes(texto);
    const coincideAnio = anio === 'todos' || c.fecha.includes(anio);
    return coincideTexto && coincideAnio;
  });

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
      {constanciasFiltradas.length === 0 ? (
        <div className="constancias-vacio">
          No se encontraron constancias para el filtro seleccionado.
        </div>
      ) : (
        <div className="constancias-grid">
          {constanciasFiltradas.map((constancia) => (
            <article className="constancia-card" key={constancia.id}>
              {/* Cabecera azul con el nombre del evento */}
              <header className="constancia-card-head">
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
                  <p>
                    <span className="meta-label">Rol:</span> {constancia.rol}
                  </p>
                </div>

                <button
                  type="button"
                  className="btn-descargar-pdf"
                  onClick={() => alDescargar(constancia.id)}
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
