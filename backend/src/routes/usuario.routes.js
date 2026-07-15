const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuario.controller');

router.get('/', usuarioController.listar);                 // GET    /api/usuarios[?rol=docente]
router.post('/', usuarioController.crear);                 // POST   /api/usuarios
router.put('/:id', usuarioController.actualizar);          // PUT    /api/usuarios/:id
router.patch('/:id/estatus', usuarioController.cambiarEstatus); // PATCH /api/usuarios/:id/estatus
router.delete('/:id', usuarioController.eliminar);         // DELETE /api/usuarios/:id

module.exports = router;
