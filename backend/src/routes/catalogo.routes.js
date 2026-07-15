const express = require('express');
const router = express.Router();
const catalogoController = require('../controllers/catalogo.controller');

// Catálogos genéricos de Administración (ciclos, carreras, asignaturas, cuatrimestres...)
router.get('/:tipo', catalogoController.listar);          // GET    /api/catalogos/:tipo
router.post('/:tipo', catalogoController.crear);          // POST   /api/catalogos/:tipo
router.put('/:tipo/:id', catalogoController.actualizar);  // PUT    /api/catalogos/:tipo/:id
router.delete('/:tipo/:id', catalogoController.eliminar); // DELETE /api/catalogos/:tipo/:id

module.exports = router;
