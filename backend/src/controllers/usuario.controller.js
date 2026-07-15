const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const { aFront, aDb } = require('../config/roles');

// Fecha dd/mm/aaaa a partir de un timestamp.
const fechaCorta = (ts) => {
  if (!ts) return '';
  const d = new Date(ts);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()}`;
};

// Da forma a una fila para el frontend (sin exponer la contraseña).
const aRegistro = (row) => ({
  id: row.id,
  nombre: row.nombre,
  correo: row.correo,
  rol: aFront(row.rol_nombre),
  estatus: row.estatus,
  programa: row.programa || '',
  matricula: row.matricula || '',
  fechaRegistro: fechaCorta(row.creado_en),
});

const SELECT_BASE = `
  SELECT u.id, u.nombre, u.correo, u.matricula, u.estatus, u.programa, u.creado_en,
         r.nombre AS rol_nombre
    FROM usuarios u
    LEFT JOIN roles r ON r.id = u.rol`;

// ==========================================
//  LISTAR usuarios (opcional: ?rol=docente)
// ==========================================
exports.listar = async (req, res) => {
  const { rol } = req.query;
  try {
    let q = `${SELECT_BASE}`;
    const params = [];
    if (rol) {
      params.push(aDb(rol));
      q += ` WHERE r.nombre = $1`;
    }
    q += ' ORDER BY u.id ASC';
    const result = await pool.query(q, params);
    res.json(result.rows.map(aRegistro));
  } catch (error) {
    console.error('Error al listar usuarios:', error);
    res.status(500).json({ message: 'Error al obtener los usuarios' });
  }
};

// ==========================================
//  CREAR usuario
// ==========================================
exports.crear = async (req, res) => {
  const { nombre, correo, contrasena, rol, estatus, programa, matricula } = req.body;

  if (!nombre || !correo) {
    return res.status(400).json({ message: 'Nombre y correo son obligatorios' });
  }

  try {
    const existe = await pool.query('SELECT id FROM usuarios WHERE correo = $1', [correo]);
    if (existe.rows.length > 0) {
      return res.status(400).json({ message: 'El correo ya está registrado' });
    }

    // Contraseña: si no se envía, se usa una temporal institucional.
    const passPlano = contrasena && contrasena.trim() ? contrasena : 'Upb2026';
    const hash = await bcrypt.hash(passPlano, await bcrypt.genSalt(10));

    const insert = await pool.query(
      `INSERT INTO usuarios (nombre, correo, contrasena, rol, estatus, programa, matricula)
       VALUES ($1, $2, $3, (SELECT id FROM roles WHERE nombre = $4), $5, $6, $7)
       RETURNING id`,
      [nombre, correo, hash, aDb(rol), estatus || 'activo', programa || null, matricula || null]
    );

    const nuevo = await pool.query(`${SELECT_BASE} WHERE u.id = $1`, [insert.rows[0].id]);
    res.status(201).json(aRegistro(nuevo.rows[0]));
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ message: 'Error al crear el usuario' });
  }
};

// ==========================================
//  ACTUALIZAR usuario (la contraseña solo si se envía)
// ==========================================
exports.actualizar = async (req, res) => {
  const { id } = req.params;
  const { nombre, correo, contrasena, rol, estatus, programa } = req.body;

  try {
    let hash = null;
    if (contrasena && contrasena.trim()) {
      hash = await bcrypt.hash(contrasena, await bcrypt.genSalt(10));
    }

    const result = await pool.query(
      `UPDATE usuarios SET
          nombre     = COALESCE($1, nombre),
          correo     = COALESCE($2, correo),
          rol        = COALESCE((SELECT id FROM roles WHERE nombre = $3), rol),
          estatus    = COALESCE($4, estatus),
          programa   = COALESCE($5, programa),
          contrasena = COALESCE($6, contrasena)
        WHERE id = $7
      RETURNING id`,
      [
        nombre || null,
        correo || null,
        rol ? aDb(rol) : null,
        estatus || null,
        programa ?? null,
        hash,
        id,
      ]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });

    const actualizado = await pool.query(`${SELECT_BASE} WHERE u.id = $1`, [id]);
    res.json(aRegistro(actualizado.rows[0]));
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ message: 'Error al actualizar el usuario' });
  }
};

// ==========================================
//  CAMBIAR ESTATUS (aprobar / baja / reactivar)
// ==========================================
exports.cambiarEstatus = async (req, res) => {
  const { id } = req.params;
  const { estatus } = req.body;
  if (!['activo', 'pendiente', 'inactivo'].includes(estatus)) {
    return res.status(400).json({ message: 'Estatus no válido' });
  }
  try {
    const result = await pool.query(
      `UPDATE usuarios SET estatus = $1 WHERE id = $2 RETURNING id`,
      [estatus, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
    const actualizado = await pool.query(`${SELECT_BASE} WHERE u.id = $1`, [id]);
    res.json(aRegistro(actualizado.rows[0]));
  } catch (error) {
    console.error('Error al cambiar estatus:', error);
    res.status(500).json({ message: 'Error al cambiar el estatus' });
  }
};

// ==========================================
//  ELIMINAR usuario
// ==========================================
exports.eliminar = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM usuarios WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json({ id: Number(id) });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ message: 'Error al eliminar el usuario' });
  }
};
