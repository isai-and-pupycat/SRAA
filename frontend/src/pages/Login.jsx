import { useState } from 'react';
import { loginUser } from '../services/authService';
import '../App.css';
import '../Login.css';

const Login = ({ alIngresar, alIrAEnlaces, alIrARegistro }) => {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMensaje('');

    try {
      const data = await loginUser({ correo, contrasena });
      setMensaje(`Bienvenido, ${data.usuario.nombre}. ${data.message}`);

      setTimeout(() => {
        alIngresar(data.usuario);
      }, 1500);
    } catch (err) {
      setError(err.message || 'Error al iniciar sesion');
    }
  };

  return (
    <div className="sraa-login-full-page">
      <div className="login-container">
        <h2>SRAA</h2>
        <p>Sistema de Registro de Actividades de Clase</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Correo Institucional</label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="usuario@upb.edu.mx"
              required
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              placeholder="********"
              required
            />
          </div>

          <button type="submit" className="btn-ingresar">
            Ingresar al Sistema
          </button>

          <button
            type="button"
            className="btn-enlaces-externo"
            onClick={alIrAEnlaces}
          >
            Portal de Enlaces Institucionales
          </button>

          <button
            type="button"
            className="registro-link-login"
            onClick={alIrARegistro}
          >
            ¿No tienes cuenta? Crear cuenta
          </button>
        </form>

        {error && <div className="mensaje error">{error}</div>}
        {mensaje && <div className="mensaje exito">{mensaje}</div>}
      </div>
    </div>
  );
};

export default Login;
