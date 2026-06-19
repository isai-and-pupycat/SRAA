const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Rutas de autenticación
router.post('/login', authController.login);
router.post('/registrar', authController.registrar); // <-- Nueva ruta agregada

module.exports = router;