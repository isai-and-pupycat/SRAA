const { Pool } = require('pg');
require('dotenv').config();

/*
 * Conexión a PostgreSQL.
 * - En la NUBE (Railway/Render): usa DATABASE_URL (cadena de conexión completa).
 * - En LOCAL: usa las variables DB_USER, DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT del .env.
 *
 * SSL: se activa automáticamente cuando hay DATABASE_URL (la nube lo requiere).
 *      Si tu proveedor NO usa SSL, define DB_SSL=false para desactivarlo.
 */
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
    })
  : new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: process.env.DB_PORT,
    });

// Probar conexión
pool.query('SELECT NOW()', (err) => {
  if (err) {
    console.error('❌ Error al conectar a la base de datos:', err.message);
  } else {
    console.log('✅ Conexión exitosa a la base de datos SQL');
  }
});

module.exports = pool;
