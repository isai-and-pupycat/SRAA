import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Accesos from "./pages/Accesos"; // 👈 Importamos la pantalla de Erick
import Login from "./pages/Login";       // Tu pantalla de Login
import Dashboard from "./pages/Dashboard"; // Tu Dashboard del SRAC

function App() {
  return (
    <Router>
      <Routes>
        {/* 1. La raíz "/" ahora muestra primero los accesos institucionales */}
        <Route path="/" element={<Accesos />} />

        {/* 2. Tu Login funcional */}
        <Route path="/login" element={<Login />} />

        {/* 3. El panel de control del docente */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Redirección por si escriben cualquier otra ruta que no exista */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;