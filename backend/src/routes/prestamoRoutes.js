const express = require('express');
const router = express.Router();
const prestamoController = require('../controllers/prestamoController');
const auth = require('../middleware/auth');

// Rutas para préstamos
router.post('/crear', auth(['Administrador', 'Instructor']), prestamoController.crearPrestamo); // Permitir a Instructores crear préstamos
router.put('/actualizar', auth(['Administrador', 'Instructor']), prestamoController.actualizarPrestamo);
router.delete('/:pre_id', auth(['Administrador', 'Instructor']), prestamoController.eliminarPrestamo);
router.get('/', auth(['Administrador', 'Instructor', 'Almacen']), prestamoController.obtenerTodosPrestamos);
router.get('/:pre_id', auth(['Administrador', 'Instructor', 'Almacen']), prestamoController.obtenerPrestamoPorId);

module.exports = router;

