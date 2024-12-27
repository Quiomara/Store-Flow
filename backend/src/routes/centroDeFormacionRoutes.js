const express = require('express');
const router = express.Router();
const centroDeFormacionController = require('../controllers/centroDeFormacionController');
const auth = require('../middleware/auth');

// Rutas para centros de formación
router.get('/', auth(['Administrador']), centroDeFormacionController.getCentros);
router.get('/:id', auth(['Administrador']), centroDeFormacionController.obtenerCentroDeFormacionPorID);

module.exports = router;
