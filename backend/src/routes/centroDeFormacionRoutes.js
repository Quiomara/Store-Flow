const express = require('express');
const router = express.Router();
const centroDeFormacionController = require('../controllers/centroDeFormacionController');
const auth = require('../middleware/auth');

/**
 * @route GET /
 * @description Obtiene la lista de todos los centros de formación
 * @access Administrador, Instructor
 */
router.get('/', auth(['Administrador', 'Instructor']), centroDeFormacionController.getCentros);

/**
 * @route GET /:id
 * @description Obtiene un centro de formación por su ID
 * @access Administrador, Instructor
 */
router.get('/:id', auth(['Administrador', 'Instructor']), centroDeFormacionController.obtenerCentroDeFormacionPorID);

module.exports = router;
