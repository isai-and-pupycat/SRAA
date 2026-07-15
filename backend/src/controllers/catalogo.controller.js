const pool = require('../config/db');

// Catálogos permitidos (módulos de Administración).
const TIPOS_VALIDOS = ['ciclos', 'carreras', 'asignaturas', 'cuatrimestres', 'usuarios'];
const esTipoValido = (tipo) => TIPOS_VALIDOS.includes(tipo);

// Une el id de la fila con sus datos JSON (forma que espera el frontend).
const aRegistro = (row) => ({ id: row.id, ...row.datos });

// Quita el id del cuerpo (el id lo maneja la base de datos, no los datos).
const limpiar = (body) => {
  const datos = { ...(body || {}) };
  delete datos.id;
  return datos;
};

// ==========================================
//  LISTAR un catálogo (por tipo)
// ==========================================
exports.listar = async (req, res) => {
  const { tipo } = req.params;
  if (!esTipoValido(tipo)) return res.status(400).json({ message: 'Tipo de catálogo no válido' });
  try {
    const r = await pool.query('SELECT id, datos FROM catalogos WHERE tipo = $1 ORDER BY id ASC', [tipo]);
    res.json(r.rows.map(aRegistro));
  } catch (error) {
    console.error('Error al listar catálogo:', error);
    res.status(500).json({ message: 'Error al obtener el catálogo' });
  }
};

// ==========================================
//  CREAR un registro en un catálogo
// ==========================================
exports.crear = async (req, res) => {
  const { tipo } = req.params;
  if (!esTipoValido(tipo)) return res.status(400).json({ message: 'Tipo de catálogo no válido' });
  try {
    const datos = limpiar(req.body);
    const r = await pool.query(
      'INSERT INTO catalogos (tipo, datos) VALUES ($1, $2) RETURNING id, datos',
      [tipo, JSON.stringify(datos)]
    );
    res.status(201).json(aRegistro(r.rows[0]));
  } catch (error) {
    console.error('Error al crear en catálogo:', error);
    res.status(500).json({ message: 'Error al crear el registro' });
  }
};

// ==========================================
//  ACTUALIZAR un registro de un catálogo
// ==========================================
exports.actualizar = async (req, res) => {
  const { tipo, id } = req.params;
  if (!esTipoValido(tipo)) return res.status(400).json({ message: 'Tipo de catálogo no válido' });
  try {
    const datos = limpiar(req.body);
    const r = await pool.query(
      'UPDATE catalogos SET datos = $1 WHERE id = $2 AND tipo = $3 RETURNING id, datos',
      [JSON.stringify(datos), id, tipo]
    );
    if (r.rows.length === 0) return res.status(404).json({ message: 'Registro no encontrado' });
    res.json(aRegistro(r.rows[0]));
  } catch (error) {
    console.error('Error al actualizar catálogo:', error);
    res.status(500).json({ message: 'Error al actualizar el registro' });
  }
};

// ==========================================
//  ELIMINAR un registro de un catálogo
// ==========================================
exports.eliminar = async (req, res) => {
  const { tipo, id } = req.params;
  if (!esTipoValido(tipo)) return res.status(400).json({ message: 'Tipo de catálogo no válido' });
  try {
    const r = await pool.query('DELETE FROM catalogos WHERE id = $1 AND tipo = $2 RETURNING id', [id, tipo]);
    if (r.rows.length === 0) return res.status(404).json({ message: 'Registro no encontrado' });
    res.json({ id: Number(id) });
  } catch (error) {
    console.error('Error al eliminar de catálogo:', error);
    res.status(500).json({ message: 'Error al eliminar el registro' });
  }
};
