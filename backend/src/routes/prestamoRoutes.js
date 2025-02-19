const express = require('express');
const router = express.Router();
const prestamoController = require('../controllers/prestamoController');
const auth = require('../middleware/auth');

// Rutas para préstamos
router.post('/crear', auth(['Administrador', 'Instructor']), prestamoController.crearPrestamo);
router.put('/actualizar', auth(['Administrador', 'Instructor']), prestamoController.actualizarPrestamo);
router.delete('/:pre_id', auth(['Administrador', 'Almacén']), prestamoController.eliminarPrestamo);
router.get('/', auth(['Administrador', 'Almacén']), prestamoController.obtenerTodosPrestamos);
router.get('/:pre_id', auth(['Administrador', 'Instructor', 'Almacén']), prestamoController.obtenerPrestamoPorId);
router.get('/usuario/:usr_cedula', auth(['Administrador', 'Instructor', 'Almacén']), prestamoController.obtenerPrestamosPorCedula);
router.get('/:pre_id/detalles', auth(['Administrador', 'Instructor', 'Almacén']), prestamoController.obtenerElementoPrestamos);

// Nueva ruta para actualizar la cantidad de elementos en un préstamo
router.put('/actualizar-cantidad', auth(['Administrador', 'Instructor']), prestamoController.actualizarCantidadElemento);
router.put('/:pre_id/actualizar-estado', auth(['Almacén']), prestamoController.actualizarEstadoPrestamo);

module.exports = router;
