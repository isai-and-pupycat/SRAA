const express = require('express');
const router = express.Router();
const constanciaController = require('../controllers/constancia.controller');

// Constancias / reconocimientos emitidos a los docentes.
router.get('/', constanciaController.listar);         // GET    /api/constancias?destinatario_id=
router.post('/', constanciaController.crear);         // POST   /api/constancias
router.put('/:id', constanciaController.actualizar);  // PUT    /api/constancias/:id
router.delete('/:id', constanciaController.eliminar); // DELETE /api/constancias/:id

module.exports = router;
