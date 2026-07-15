const pool = require('../config/db');

// Prefijo institucional fijo del folio (Coordinación de Ingenierías).
const PREFIJO = 'UPB-CING';

/*
 * Calcula el PRÓXIMO folio (sin insertar). Lee el cuatrimestre marcado como
 * "Activo" para obtener el ciclo, y el último correlativo de ese año+ciclo.
 * Lanza { status, message } si algo falta. Devuelve { anio, ciclo, correlativo, folio }.
 */
async function calcularProximoFolio() {
  // Ciclo automático: número del cuatrimestre ACTIVO del catálogo.
  const cuatri = await pool.query(
    `SELECT datos
       FROM catalogos
      WHERE tipo = 'cuatrimestres' AND LOWER(datos->>'estado') = 'activo'
      ORDER BY id DESC
      LIMIT 1`
  );
  if (cuatri.rows.length === 0) {
    throw { status: 400, message: 'No hay un cuatrimestre activo. Marca uno como "Activo" en Administración → Cuatrimestres.' };
  }
  const cicloNum = Number(cuatri.rows[0].datos.numero);
  if (![1, 2, 3].includes(cicloNum)) {
    throw { status: 400, message: 'El cuatrimestre activo tiene un número inválido (debe ser 1, 2 o 3).' };
  }

  // El año se calcula en el servidor (no se confía en el cliente).
  const anio = new Date().getFullYear();

  // Último correlativo para este año + ciclo.
  const ultimo = await pool.query(
    `SELECT correlativo
       FROM fichas_tecnicas
      WHERE anio = $1 AND ciclo = $2
      ORDER BY correlativo DESC
      LIMIT 1`,
    [anio, cicloNum]
  );

  // Si hay registro previo → +1; si no (cambió el año o el ciclo) → reinicia en 1.
  const correlativo = ultimo.rows.length > 0 ? ultimo.rows[0].correlativo + 1 : 1;
  const folio = `${PREFIJO}-${anio}-${cicloNum}-${String(correlativo).padStart(3, '0')}`;

  return { anio, ciclo: cicloNum, correlativo, folio };
}

/*
 * REGISTRAR una Ficha Técnica con folio correlativo automático.
 *
 * El folio tiene la forma  UPB-CING-2026-1-001  y su correlativo (los 3
 * últimos dígitos) se reinicia a 001 cada vez que cambia el año o el ciclo.
 * El ciclo (1, 2 o 3) YA NO se pasa a mano: se toma del cuatrimestre marcado
 * como "Activo" en Administración → Cuatrimestres.
 * Entrada esperada en req.body: { titulo, descripcion }.
 */
exports.crear = async (req, res) => {
  const { titulo, descripcion } = req.body || {};

  if (!titulo || !titulo.trim()) {
    return res.status(400).json({ message: 'El título es obligatorio.' });
  }

  try {
    const { anio, ciclo, correlativo, folio } = await calcularProximoFolio();

    // --- Inserción final (guarda anio, ciclo y correlativo por separado) ---
    const insertado = await pool.query(
      `INSERT INTO fichas_tecnicas (folio, anio, ciclo, correlativo, titulo, descripcion)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [folio, anio, ciclo, correlativo, titulo.trim(), descripcion || null]
    );

    return res.status(201).json(insertado.rows[0]);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ message: error.message });
    // Si dos peticiones chocaran en el mismo correlativo, el UNIQUE del folio
    // lo impide (23505); se informa para poder reintentar.
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Folio duplicado, intenta de nuevo.' });
    }
    console.error('Error al registrar la ficha técnica:', error);
    return res.status(500).json({ message: 'Error al registrar la ficha técnica.' });
  }
};

// VISTA PREVIA del próximo folio (no inserta nada). Para mostrarlo en la Etapa 1.
exports.siguiente = async (_req, res) => {
  try {
    const preview = await calcularProximoFolio();
    return res.json(preview);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ message: error.message });
    console.error('Error al calcular el próximo folio:', error);
    return res.status(500).json({ message: 'Error al calcular el próximo folio.' });
  }
};

// LISTAR las fichas técnicas registradas (útil para consultar los folios).
exports.listar = async (_req, res) => {
  try {
    const r = await pool.query('SELECT * FROM fichas_tecnicas ORDER BY id DESC');
    res.json(r.rows);
  } catch (error) {
    console.error('Error al listar fichas técnicas:', error);
    res.status(500).json({ message: 'Error al obtener las fichas técnicas.' });
  }
};
