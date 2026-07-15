const express = require('express');
const router = express.Router();
const fichaTecnicaController = require('../controllers/fichaTecnica.controller');

// Fichas Técnicas con folio correlativo (UPB-CING-2026-1-001).
router.get('/siguiente', fichaTecnicaController.siguiente); // GET  /api/fichas-tecnicas/siguiente (vista previa)
router.post('/', fichaTecnicaController.crear);             // POST /api/fichas-tecnicas
router.get('/', fichaTecnicaController.listar);             // GET  /api/fichas-tecnicas

module.exports = router;
