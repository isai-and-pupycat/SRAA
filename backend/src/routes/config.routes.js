const express = require('express');
const router = express.Router();
const configController = require('../controllers/config.controller');

router.get('/', configController.obtener);   // GET /api/config
router.put('/', configController.guardar);   // PUT /api/config

module.exports = router;
