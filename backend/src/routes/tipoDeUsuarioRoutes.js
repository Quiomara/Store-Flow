const express = require('express');
const router = express.Router();
const tipoDeUsuarioController = require('../controllers/tipoDeUsuarioController');
const auth = require('../middleware/auth');

// Rutas para tipos de usuario
router.get('/', auth(['Administrador']), tipoDeUsuarioController.getTiposUsuario); // Ajusta aquí si es necesario

module.exports = router;
