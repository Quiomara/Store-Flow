// Rutas de autenticación
const express = require('express');
const router = express.Router();
const { login, forgotPassword, resetPassword } = require('../controllers/authController');

/**
 * @route POST /login
 * @description Maneja la autenticación de usuarios
 * @access Público
 */
router.post('/login', login);

/**
 * @route POST /forgot-password
 * @description Inicia el proceso de recuperación de contraseña
 * @access Público
 */
router.post('/forgot-password', forgotPassword);

/**
 * @route POST /reset-password
 * @description Permite a los usuarios restablecer su contraseña mediante un token válido
 * @access Público
 */
router.post('/reset-password', resetPassword);

module.exports = router;
