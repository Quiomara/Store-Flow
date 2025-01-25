const express = require('express');
const router = express.Router();
const prestamoController = require('../controllers/prestamoController');
const auth = require('../middleware/auth');

// Rutas para préstamos
router.post('/crear', auth(['Administrador', 'Instructor']), prestamoController.crearPrestamo);
router.put('/actualizar', auth(['Administrador', 'Instructor']), prestamoController.actualizarPrestamo);
router.delete('/:pre_id', auth(['Administrador', 'Almacen']), prestamoController.eliminarPrestamo);
router.get('/', auth(['Administrador', 'Almacen']), prestamoController.obtenerTodosPrestamos);
router.get('/:pre_id', auth(['Administrador', 'Instructor', 'Almacen']), prestamoController.obtenerPrestamoPorId);
router.get('/usuario/:usr_cedula', auth(['Administrador', 'Instructor', 'Almacen']), prestamoController.obtenerPrestamosPorCedula); // Añadir auth con roles
router.get('/:pre_id/detalles', auth(['Administrador', 'Instructor', 'Almacen']), prestamoController.obtenerElementoPrestamos);

module.exports = router;
