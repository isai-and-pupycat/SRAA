import { useState } from 'react';
import { registerUser } from '../services/authService';
import '../App.css';
import '../Login.css';
import '../Registro.css';

const Registro = ({ alRegistrar = () => {}, alIrALogin = () => {} }) => {
  // Un solo useState con todos los datos del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    correo: '',
    contrasena: '',
    confirmarContrasena: '',
  });
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  // Manejador genérico: actualiza el campo según su atributo name
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');

    // Validación: las contraseñas deben coincidir antes de proceder
    if (formData.contrasena !== formData.confirmarContrasena) {
      setError('Las contraseñas no coinciden');
      return;
    }

    try {
      const data = await registerUser({
        nombre: formData.nombre,
        correo: formData.correo,
        contrasena: formData.contrasena,
      });
      setMensaje(data.message || 'Usuario registrado con éxito');

      // Damos un instante para mostrar el mensaje y avisamos al padre
      setTimeout(() => {
        alRegistrar(data.usuario);
      }, 1500);
    } catch (err) {
      setError(err.message || 'Error al registrar usuario');
    }
  };

  return (
    <div className="sraa-login-full-page">
      <div className="login-container">
        {/* ENCABEZADO CON LOGO UPB */}
        <div className="registro-header">
          <h2>SRAA</h2>
          <img
            src="/img/logo-horizontal-upb@2x.png"
            alt="Universidad Politécnica de Bacalar"
            className="registro-logo-upb"
          />
          <p>Sistema de Actividades Académicas</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre Completo</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Isai Rosas Canto"
              required
            />
          </div>

          <div className="form-group">
            <label>Correo Electrónico Institucional</label>
            <input
              type="email"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              placeholder="nombre.apellido@upb.edu.mx"
              required
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              name="contrasena"
              value={formData.contrasena}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <div className="form-group">
            <label>Confirmar Contraseña</label>
            <input
              type="password"
              name="confirmarContrasena"
              value={formData.confirmarContrasena}
              onChange={handleChange}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn-registro-submit">
            Registrarse
          </button>
        </form>

        {error && <div className="mensaje error">{error}</div>}
        {mensaje && <div className="mensaje exito">{mensaje}</div>}

        <button type="button" className="registro-link-login" onClick={alIrALogin}>
          ¿Ya tienes cuenta? Inicia sesión
        </button>
      </div>
    </div>
  );
};

export default Registro;
