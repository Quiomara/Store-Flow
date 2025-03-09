const express = require('express');
const router = express.Router();
const prestamoController = require('../controllers/prestamoController');
const auth = require('../middleware/auth');

/**
 * @route POST /crear
 * @description Crea un nuevo préstamo
 * @access Administrador, Instructor
 */
router.post('/crear', auth(['Administrador', 'Instructor']), prestamoController.crearPrestamo);

/**
 * @route PUT /actualizar
 * @description Actualiza los datos de un préstamo existente
 * @access Administrador, Instructor
 */
router.put('/actualizar', auth(['Administrador', 'Instructor']), prestamoController.actualizarPrestamo);

/**
 * @route DELETE /:pre_id
 * @description Elimina un préstamo por su ID
 * @access Administrador, Almacén
 */
router.delete('/:pre_id', auth(['Administrador', 'Almacén']), prestamoController.eliminarPrestamo);

/**
 * @route GET /
 * @description Obtiene todos los préstamos registrados
 * @access Administrador, Almacén
 */
router.get('/', auth(['Administrador', 'Almacén']), prestamoController.obtenerTodosPrestamos);

/**
 * @route GET /:pre_id
 * @description Obtiene un préstamo específico por su ID
 * @access Administrador, Instructor, Almacén
 */
router.get('/:pre_id', auth(['Administrador', 'Instructor', 'Almacén']), prestamoController.obtenerPrestamoPorId);

/**
 * @route GET /usuario/:usr_cedula
 * @description Obtiene todos los préstamos de un usuario por su cédula
 * @access Administrador, Instructor, Almacén
 */
router.get('/usuario/:usr_cedula', auth(['Administrador', 'Instructor', 'Almacén']), prestamoController.obtenerPrestamosPorCedula);

/**
 * @route GET /:pre_id/detalles
 * @description Obtiene los elementos asociados a un préstamo específico
 * @access Administrador, Instructor, Almacén
 */
router.get('/:pre_id/detalles', auth(['Administrador', 'Instructor', 'Almacén']), prestamoController.obtenerElementoPrestamos);

/**
 * @route PUT /actualizar-cantidad
 * @description Actualiza la cantidad de elementos en un préstamo
 * @access Administrador, Instructor
 */
router.put('/actualizar-cantidad', auth(['Administrador', 'Instructor']), prestamoController.actualizarCantidadElemento);

/**
 * @route PUT /:pre_id/actualizar-estado
 * @description Actualiza el estado de un préstamo y guarda el historial de cambios
 * @access Instructor, Almacén
 */
router.put('/:pre_id/actualizar-estado', auth(['Instructor', 'Almacén']), prestamoController.actualizarEstadoPrestamo);

/**
 * @route PUT /cancelar/:pre_id
 * @description Cancela un préstamo en estado "Creado"
 * @access Instructor
 */
router.put('/cancelar/:pre_id', auth(['Instructor']), prestamoController.cancelarPrestamo);

/**
 * @route GET /:pre_id/historial-estado
 * @description Obtiene el historial de estados de un préstamo
 * @access Instructor, Almacén
 */
router.get('/:pre_id/historial-estado', auth(['Instructor', 'Almacén']), prestamoController.obtenerHistorialEstado);


router.put('/entregar/:pre_id', auth(['Almacén']), prestamoController.entregarPrestamo);


module.exports = router;
