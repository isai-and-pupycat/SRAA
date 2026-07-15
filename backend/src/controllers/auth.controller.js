const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { aFront } = require('../config/roles');

// ==========================================
// 1. INICIAR SESIÓN (LOGIN)
// ==========================================
exports.login = async (req, res) => {
  const { correo, contrasena } = req.body;

  try {
    // Buscar al usuario (con el nombre de su rol desde la tabla roles)
    const userQuery = await pool.query(
      `SELECT u.*, r.nombre AS rol_nombre
         FROM usuarios u
         LEFT JOIN roles r ON r.id = u.rol
        WHERE u.correo = $1`,
      [correo]
    );

    if (userQuery.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const usuario = userQuery.rows[0];

    // Verificar si la contraseña coincide usando bcrypt
    const isMatch = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!isMatch) {
      return res.status(400).json({ message: 'Contraseña incorrecta' });
    }

    // SEGURIDAD: solo los usuarios ACTIVOS pueden ingresar.
    if (usuario.estatus !== 'activo') {
      const motivo =
        usuario.estatus === 'pendiente'
          ? 'Tu cuenta está pendiente de aprobación por el coordinador.'
          : 'Tu cuenta está inactiva. Contacta al coordinador.';
      return res.status(403).json({ message: motivo });
    }

    const rolFront = aFront(usuario.rol_nombre);

    // Generar Token JWT seguro
    const token = jwt.sign(
      { id: usuario.id, rol: rolFront },
      process.env.JWT_SECRET || 'secretatoken',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login exitoso',
      token,
      usuario: {
        id: usuario.id,
        correo: usuario.correo,
        nombre: usuario.nombre,
        rol: rolFront,
        estatus: usuario.estatus,
      },
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
  const { nombre, correo, contrasena, programa } = req.body;

  try {
    // Verificar si el correo ya está registrado en el SRAA
    const existeUsuario = await pool.query('SELECT id FROM usuarios WHERE correo = $1', [correo]);
    if (existeUsuario.rows.length > 0) {
      return res.status(400).json({ message: 'El correo ya está registrado' });
    }

    // Encriptar la contraseña antes de guardarla en la DB
    const salt = await bcrypt.genSalt(10);
    const contrasenaEncriptada = await bcrypt.hash(contrasena, salt);

    // El auto-registro entra como PROFESOR (rol 2) y PENDIENTE de aprobación.
    // No podrá iniciar sesión hasta que el coordinador lo apruebe.
    await pool.query(
      `INSERT INTO usuarios (nombre, correo, contrasena, rol, estatus, programa)
       VALUES ($1, $2, $3, (SELECT id FROM roles WHERE nombre = 'Profesor'), 'pendiente', $4)`,
      [nombre, correo, contrasenaEncriptada, programa || null]
    );

    res.status(201).json({
      message: 'Registro exitoso. Tu cuenta quedó pendiente de aprobación por el coordinador.',
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor al registrar usuario' });
  }
};