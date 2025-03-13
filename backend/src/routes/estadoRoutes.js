/**
 * Rutas para la gestión de estados en el sistema.
 * @module estadoRoutes
 */
const express = require('express');
const router = express.Router();
const estadoController = require('../controllers/estadoController');
const auth = require('../middleware/auth');

/**
 * @route GET /
 * @description Obtiene todos los estados registrados en el sistema.
 * @access Administrador, Instructor, Almacén
 */
router.get('/', auth(['Administrador', 'Instructor', 'Almacén']), estadoController.obtenerTodosEstados);

/**
 * @route GET /:est_id
 * @description Obtiene un estado específico por su ID.
 * @access Administrador, Instructor, Almacén
 */
router.get('/:est_id', auth(['Administrador', 'Instructor', 'Almacén']), estadoController.obtenerEstadoPorId);

/**
 * @route POST /crear
 * @description Crea un nuevo estado.
 * @access Administrador, Almacén
 */
router.post('/crear', auth(['Administrador', 'Almacén']), estadoController.crearEstado);

/**
 * @route PUT /actualizar
 * @description Actualiza los datos de un estado existente.
 * @access Administrador, Almacén
 */
router.put('/actualizar', auth(['Administrador', 'Almacén']), estadoController.actualizarEstado);

/**
 * @route DELETE /eliminar/:est_id
 * @description Elimina un estado por su ID.
 * @access Administrador, Almacén
 */
router.delete('/eliminar/:est_id', auth(['Administrador', 'Almacén']), estadoController.eliminarEstado);

module.exports = router;
