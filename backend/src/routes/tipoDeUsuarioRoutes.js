const express = require('express');
const router = express.Router();
const tipoDeUsuarioController = require('../controllers/tipoDeUsuarioController');
const auth = require('../middleware/auth');

/**
 * @route GET /
 * @description Obtiene todos los tipos de usuario registrados
 * @access Administrador
 */
router.get('/', auth(['Administrador']), tipoDeUsuarioController.getTiposUsuario);

module.exports = router;
