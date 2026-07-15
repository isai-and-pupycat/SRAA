/*
 * Inicializa la base de datos del SRAA.
 * Lee sql/schema.sql y lo ejecuta usando la conexión del .env.
 *
 *   Uso:  cd backend  →  node src/setup-db.js
 *
 * Crea las tablas (usuarios, fichas) y siembra los usuarios demo.
 * Es seguro correrlo varias veces (el script es idempotente).
 */
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const pool = require('./config/db');

const rutaSchema = path.join(__dirname, '..', 'sql', 'schema.sql');

// Crea un usuario coordinador por defecto si NO existe ninguno (para el primer
// arranque en la nube, donde la base viene vacía). En local no hace nada si ya
// hay un coordinador. Credenciales: admin@upb.edu.mx / Admin2026
const sembrarCoordinador = async () => {
  const yaHay = await pool.query(
    `SELECT 1 FROM usuarios u JOIN roles r ON r.id = u.rol
      WHERE r.nombre = 'Coordinador' LIMIT 1`
  );
  if (yaHay.rows.length > 0) return;

  const hash = await bcrypt.hash('Admin2026', 10);
  await pool.query(
    `INSERT INTO usuarios (nombre, correo, contrasena, rol, estatus)
     VALUES ($1, $2, $3, (SELECT id FROM roles WHERE nombre = 'Coordinador'), 'activo')
     ON CONFLICT (correo) DO NOTHING`,
    ['Coordinador UPB', 'admin@upb.edu.mx', hash]
  );
  console.log('👤 Coordinador por defecto creado → admin@upb.edu.mx / Admin2026');
};

(async () => {
  try {
    const sql = fs.readFileSync(rutaSchema, 'utf8');
    console.log('⏳ Ejecutando schema.sql...');
    await pool.query(sql);
    await sembrarCoordinador();
    console.log('✅ Base de datos lista: tablas creadas y datos base sembrados.');
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error.message);
  } finally {
    await pool.end();
    process.exit(0);
  }
})();
