const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  const { matricula, contrasena } = req.body;

  try {
    // 1. Buscar al usuario en la base de datos
    const userQuery = await pool.query('SELECT * FROM usuarios WHERE matricula = $1', [matricula]);
    
    if (userQuery.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const usuario = userQuery.rows[0];

    // 2. Verificar contraseña
    const isMatch = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!isMatch) {
      return res.status(400).json({ message: 'Contraseña incorrecta' });
    }

    // 3. Generar Token JWT
    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol },
      process.env.JWT_SECRET || 'secretatoken',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login exitoso',
      token,
      usuario: { matricula: usuario.matricula, nombre: usuario.nombre, rol: usuario.rol }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};