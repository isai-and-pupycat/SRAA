const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ==========================================
// 1. INICIAR SESIÓN (LOGIN)
// ==========================================
exports.login = async (req, res) => {
  const { correo, contrasena } = req.body;

  try {
    // Buscar al usuario en la base de datos por su correo
    const userQuery = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
    
    if (userQuery.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const usuario = userQuery.rows[0];

    // Verificar si la contraseña coincide usando bcrypt
    const isMatch = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!isMatch) {
      return res.status(400).json({ message: 'Contraseña incorrecta' });
    }

    // Generar Token JWT seguro
    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol },
      process.env.JWT_SECRET || 'secretatoken',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login exitoso',
      token,
      usuario: { correo: usuario.correo, nombre: usuario.nombre, rol: usuario.rol }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor al iniciar sesión' });
  }
};

// ==========================================
// 2. REGISTRAR NUEVO USUARIO
// ==========================================
exports.registrar = async (req, res) => {
  const { nombre, correo, contrasena, rol } = req.body;

  try {
    // Verificar si el correo ya está registrado en el SRAA
    const existeUsuario = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
    if (existeUsuario.rows.length > 0) {
      return res.status(400).json({ message: 'El correo ya está registrado' });
    }

    // Encriptar la contraseña antes de guardarla en la DB
    const salt = await bcrypt.genSalt(10);
    const contrasenaEncriptada = await bcrypt.hash(contrasena, salt);

    // Insertar el nuevo registro en PostgreSQL
    const nuevoUsuario = await pool.query(
      'INSERT INTO usuarios (nombre, correo, contrasena, rol) VALUES ($1, $2, $3, $4) RETURNING id, nombre, correo, rol',
      [nombre, correo, contrasenaEncriptada, rol || 'docente'] // Por defecto asignamos rol 'docente' si no se envía
    );

    res.status(201).json({
      message: 'Usuario registrado con éxito',
      usuario: nuevoUsuario.rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor al registrar usuario' });
  }
};