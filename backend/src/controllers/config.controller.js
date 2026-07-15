const pool = require('../config/db');

// ==========================================
//  OBTENER toda la configuración (objeto clave→valor)
// ==========================================
exports.obtener = async (req, res) => {
  try {
    const r = await pool.query('SELECT clave, valor FROM configuracion');
    const config = {};
    r.rows.forEach((row) => {
      config[row.clave] = row.valor;
    });
    res.json(config);
  } catch (error) {
    console.error('Error al obtener configuración:', error);
    res.status(500).json({ message: 'Error al obtener la configuración' });
  }
};

// ==========================================
//  GUARDAR configuración (upsert de un objeto clave→valor)
// ==========================================
exports.guardar = async (req, res) => {
  const cambios = req.body || {};
  try {
    const claves = Object.keys(cambios);
    for (const clave of claves) {
      await pool.query(
        `INSERT INTO configuracion (clave, valor) VALUES ($1, $2)
         ON CONFLICT (clave) DO UPDATE SET valor = EXCLUDED.valor`,
        [clave, cambios[clave]]
      );
    }
    const r = await pool.query('SELECT clave, valor FROM configuracion');
    const config = {};
    r.rows.forEach((row) => {
      config[row.clave] = row.valor;
    });
    res.json(config);
  } catch (error) {
    console.error('Error al guardar configuración:', error);
    res.status(500).json({ message: 'Error al guardar la configuración' });
  }
};
