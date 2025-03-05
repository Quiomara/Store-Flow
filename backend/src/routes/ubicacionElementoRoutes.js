const express = require('express');
const router = express.Router();
const ubicacionElementoController = require('../controllers/ubicacionElementoController');
const auth = require('../middleware/auth');

/**
 * @route POST /crear
 * @description Crea una nueva ubicación de elemento
 * @access Administrador, Almacén
 */
router.post('/crear', auth(['Administrador', 'Almacén']), ubicacionElementoController.crearUbicacionElemento);

/**
 * @route PUT /actualizar
 * @description Actualiza una ubicación de elemento existente
 * @access Administrador, Almacén
 */
router.put('/actualizar', auth(['Administrador', 'Almacén']), ubicacionElementoController.actualizarUbicacionElemento);

/**
 * @route DELETE /:ubi_ele_id
 * @description Elimina una ubicación de elemento por su ID
 * @access Administrador, Almacén
 */
router.delete('/:ubi_ele_id', auth(['Administrador', 'Almacén']), ubicacionElementoController.eliminarUbicacionElemento);

/**
 * @route GET /
 * @description Obtiene todas las ubicaciones de elementos
 * @access Administrador, Almacén
 */
router.get('/', auth(['Administrador', 'Almacén']), ubicacionElementoController.obtenerTodosUbicacionElementos);

/**
 * @route GET /:ubi_ele_id
 * @description Obtiene una ubicación de elemento por su ID
 * @access Administrador, Almacén
 */
router.get('/:ubi_ele_id', auth(['Administrador', 'Almacén']), ubicacionElementoController.obtenerUbicacionElementoPorId);

module.exports = router;
