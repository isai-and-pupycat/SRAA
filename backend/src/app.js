const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importar la conexión de la DB para que se ejecute al arrancar
require('./config/db'); 

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Importar Rutas
const authRoutes = require('./routes/auth.routes');

// Vincular Rutas
app.use('/api/auth', authRoutes);

// Ruta de prueba inicial
app.get('/api/status', (req, res) => {
    res.json({ status: 'Servidor SRAA en línea' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});