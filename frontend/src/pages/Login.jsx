import React, { useState } from 'react';
import { loginUser } from '../services/authService';
import '../App.css'; // Asegúrate de que apunte a donde guardaste el CSS nuevo
import '../Login.css';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate(); 
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
      setMensaje(`¡${data.message}! Bienvenido, ${data.usuario.nombre}.`);
      // Aquí puedes redireccionar al panel principal más adelante
      // Espera 1.5 segundos para que el usuario alcance a ver el mensaje verde y redirige
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    }
  };

  return (
    <div className="login-container">
      <h2>SRAC</h2>
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
            placeholder="••••••••"
            required 
          />
        </div>

        <button type="submit" className="btn-ingresar">
          Ingresar al Sistema
        </button>
      </form>

      {/* Alerta de Error estilizada */}
      {error && (
        <div className="mensaje error">
          {error}
        </div>
      )}

      {/* Alerta de Éxito estilizada */}
      {mensaje && (
        <div className="mensaje exito">
          {mensaje}
        </div>
      )}
    </div>
  );
};

export default Login;