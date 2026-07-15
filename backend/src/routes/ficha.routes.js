const express = require('express');
const router = express.Router();
const fichaController = require('../controllers/ficha.controller');

// Rutas de fichas (eventos / actividades académicas)
router.get('/', fichaController.listar);              // GET    /api/fichas
router.post('/', fichaController.crear);              // POST   /api/fichas
router.patch('/:id/validar', fichaController.validar);// PATCH  /api/fichas/:id/validar
router.put('/:id/informe', fichaController.guardarInforme); // PUT /api/fichas/:id/informe
router.put('/:id', fichaController.actualizar);       // PUT    /api/fichas/:id
router.delete('/:id', fichaController.eliminar);      // DELETE /api/fichas/:id

module.exports = router;
