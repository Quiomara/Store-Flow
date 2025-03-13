/**
 * Rutas para la gestión de elementos en el sistema.
 * @module elementoRoutes
 */

const express = require('express');
const router = express.Router();
const elementoController = require('../controllers/elementoController');
const auth = require('../middleware/auth');

/**
 * @route POST /crear
 * @description Crea un nuevo elemento en el sistema.
 * @access Administrador, Almacén
 */
router.post('/crear', auth(['Administrador', 'Almacén']), elementoController.crearElemento);

/**
 * @route PUT /actualizar
 * @description Actualiza los datos de un elemento existente.
 * @access Administrador, Almacén
 */
router.put('/actualizar', auth(['Administrador', 'Almacén']), elementoController.actualizarElemento);

/**
 * @route DELETE /:ele_id
 * @description Elimina un elemento por su ID.
 * @access Administrador, Almacén
 */
router.delete('/:ele_id', auth(['Administrador', 'Almacén']), elementoController.eliminarElemento);

/**
 * @route GET /
 * @description Obtiene la lista de todos los elementos registrados.
 * @access Administrador, Instructor, Almacén
 */
router.get('/', auth(['Administrador', 'Instructor', 'Almacén']), elementoController.obtenerTodosElementos);

/**
 * @route GET /:ele_id
 * @description Obtiene un elemento específico por su ID.
 * @access Administrador, Instructor, Almacén
 */
router.get('/:ele_id', auth(['Administrador', 'Instructor', 'Almacén']), elementoController.obtenerElementoPorId);

/**
 * @route PUT /actualizarCantidadPrestado
 * @description Actualiza la cantidad prestada de un elemento.
 * @access Instructor, Almacén
 */
router.put('/actualizarCantidadPrestado', auth(['Instructor', 'Almacén']), elementoController.actualizarCantidadPrestado);

/**
 * @route PUT /actualizar-stock
 * @description Actualiza el stock de un elemento en el inventario.
 * @access Administrador, Almacén
 */
router.put('/actualizar-stock', auth(['Administrador','Instructor','Almacén']), elementoController.actualizarStock);

module.exports = router;
