const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importar la conexión de la DB para que se ejecute al arrancar
require('./config/db'); 

const app = express();

// Middlewares
app.use(cors());
// Límite amplio: los informes incluyen fotos en base64 (evidencia fotográfica).
app.use(express.json({ limit: '25mb' }));

// Importar Rutas
const authRoutes = require('./routes/auth.routes');
const fichaRoutes = require('./routes/ficha.routes');
const catalogoRoutes = require('./routes/catalogo.routes');
const usuarioRoutes = require('./routes/usuario.routes');
const configRoutes = require('./routes/config.routes');
const constanciaRoutes = require('./routes/constancia.routes');
const fichaTecnicaRoutes = require('./routes/fichaTecnica.routes');

// Vincular Rutas
app.use('/api/auth', authRoutes);
app.use('/api/fichas', fichaRoutes);
app.use('/api/catalogos', catalogoRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/config', configRoutes);
app.use('/api/constancias', constanciaRoutes);
app.use('/api/fichas-tecnicas', fichaTecnicaRoutes);

// Ruta de prueba inicial
app.get('/api/status', (req, res) => {
    res.json({ status: 'Servidor SRAA en línea' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});