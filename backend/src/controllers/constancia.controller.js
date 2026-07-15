const pool = require('../config/db');

/*
 * Constancias / Reconocimientos emitidos a los docentes.
 * El coordinador las genera en "Crear Constancia"; cada docente ve las suyas
 * en "Mis Constancias". Todo se persiste en la tabla `constancias`.
 */

// Da forma a una fila para el frontend.
const aRegistro = (row) => ({
  id: row.id,
  titulo: row.titulo,
  tipo: row.tipo || 'Constancia',
  rol: row.rol || '',
  fecha: row.fecha || '',
  descripcion: row.descripcion || '',
  destinatario: row.destinatario || '',
  destinatario_id: row.destinatario_id || null,
  emitida_por: row.emitida_por || '',
  para_profesores: row.para_profesores || 'No',
  es_invitado: !!row.es_invitado,
});

// ==========================================
//  LISTAR constancias
//  Filtros opcionales: ?destinatario_id=  o  ?destinatario=
// ==========================================
exports.listar = async (req, res) => {
  const { destinatario_id, destinatario } = req.query;
  try {
    let q = 'SELECT * FROM constancias';
    const params = [];
    if (destinatario_id) {
      params.push(destinatario_id);
      q += ` WHERE destinatario_id = $${params.length}`;
    } else if (destinatario) {
      // Coincidencia EXACTA (sin distinguir mayúsculas) para no mezclar docentes.
      params.push(destinatario);
      q += ` WHERE LOWER(destinatario) = LOWER($${params.length})`;
    }
    q += ' ORDER BY id DESC';
    const r = await pool.query(q, params);
    res.json(r.rows.map(aRegistro));
  } catch (error) {
    console.error('Error al listar constancias:', error);
    res.status(500).json({ message: 'Error al obtener las constancias' });
  }
};

// ==========================================
//  CREAR una constancia
// ==========================================
exports.crear = async (req, res) => {
  const b = req.body || {};
  if (!b.titulo || !b.titulo.trim()) {
    return res.status(400).json({ message: 'El evento / reconocimiento es obligatorio' });
  }
  try {
    const r = await pool.query(
      `INSERT INTO constancias
         (titulo, tipo, rol, fecha, descripcion, destinatario, destinatario_id, emitida_por, para_profesores, es_invitado)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        b.titulo,
        b.tipo || 'Constancia',
        b.rol || null,
        b.fecha || null,
        b.descripcion || null,
        b.destinatario || null,
        b.destinatario_id || null,
        b.emitida_por || null,
        b.para_profesores || 'No',
        !!b.es_invitado,
      ]
    );
    res.status(201).json(aRegistro(r.rows[0]));
  } catch (error) {
    console.error('Error al crear constancia:', error);
    res.status(500).json({ message: 'Error al crear la constancia' });
  }
};

// ==========================================
//  ACTUALIZAR una constancia
// ==========================================
exports.actualizar = async (req, res) => {
  const { id } = req.params;
  const b = req.body || {};
  try {
    const r = await pool.query(
      `UPDATE constancias SET
          titulo          = COALESCE($1, titulo),
          tipo            = COALESCE($2, tipo),
          rol             = COALESCE($3, rol),
          fecha           = COALESCE($4, fecha),
          descripcion     = COALESCE($5, descripcion),
          para_profesores = COALESCE($6, para_profesores),
          destinatario    = COALESCE($7, destinatario)
        WHERE id = $8
      RETURNING *`,
      [b.titulo || null, b.tipo || null, b.rol ?? null, b.fecha || null, b.descripcion ?? null, b.para_profesores || null, b.destinatario || null, id]
    );
    if (r.rows.length === 0) return res.status(404).json({ message: 'Constancia no encontrada' });
    res.json(aRegistro(r.rows[0]));
  } catch (error) {
    console.error('Error al actualizar constancia:', error);
    res.status(500).json({ message: 'Error al actualizar la constancia' });
  }
};

// ==========================================
//  ELIMINAR una constancia
// ==========================================
exports.eliminar = async (req, res) => {
  const { id } = req.params;
  try {
    const r = await pool.query('DELETE FROM constancias WHERE id = $1 RETURNING id', [id]);
    if (r.rows.length === 0) return res.status(404).json({ message: 'Constancia no encontrada' });
    res.json({ id: Number(id) });
  } catch (error) {
    console.error('Error al eliminar constancia:', error);
    res.status(500).json({ message: 'Error al eliminar la constancia' });
  }
};
