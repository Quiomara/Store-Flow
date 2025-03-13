/**
 * Rutas para la gestión de usuarios.
 * @module usuarioRoutes
 */
const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const auth = require('../middleware/auth');

/**
 * @route POST /registrar
 * @description Registra un nuevo usuario en el sistema.
 * @access Administrador
 */
router.post('/registrar', auth(['Administrador']), usuarioController.registrarUsuario);

/**
 * @route PUT /actualizar
 * @description Actualiza la información de un usuario existente.
 * @access Administrador, Instructor, Almacén
 */
router.put('/actualizar', auth(['Administrador', 'Instructor', 'Almacén']), usuarioController.actualizarUsuario);

/**
 * @route GET /:usr_cedula
 * @description Obtiene la información de un usuario por su cédula.
 * @access Administrador
 */
router.get('/:usr_cedula', auth(['Administrador']), usuarioController.obtenerUsuario);

/**
 * @route DELETE /:usr_cedula
 * @description Elimina un usuario del sistema por su cédula.
 * @access Administrador
 */
router.delete('/:usr_cedula', auth(['Administrador']), usuarioController.eliminarUsuario);

/**
 * @route GET /
 * @description Obtiene la lista de todos los usuarios.
 * @access Administrador
 */
router.get('/', auth(['Administrador']), usuarioController.obtenerTodosUsuarios);

/**
 * @route GET /tipo/:tip_usr_id
 * @description Obtiene una lista de usuarios filtrados por tipo de usuario.
 * @access Administrador
 */
router.get('/tipo/:tip_usr_id', auth(['Administrador']), usuarioController.obtenerUsuariosPorTipo);

module.exports = router;
