const express = require('express');
const router = express.Router();
const tipoDeUsuarioController = require('../controllers/tipoDeUsuarioController');
const auth = require('../middleware/auth');

// Rutas para tipos de usuario
router.get('/tipos-usuario', auth(['Administrador']), tipoDeUsuarioController.getTiposUsuario);

module.exports = router;
