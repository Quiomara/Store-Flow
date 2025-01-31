const express = require('express');
const router = express.Router();
const estadoController = require('../controllers/estadoController');
const auth = require('../middleware/auth');

// Rutas para estados
router.get('/', auth(['Administrador', 'Instructor', 'Almacén']), estadoController.obtenerTodosEstados); // Comentamos el auth para probar
router.get('/:est_id', auth(['Administrador', 'Instructor', 'Almacén']), estadoController.obtenerEstadoPorId);
router.post('/crear', auth(['Administrador', 'Almacén']), estadoController.crearEstado);
router.put('/actualizar', auth(['Administrador', 'Almacén']), estadoController.actualizarEstado);
router.delete('/eliminar/:est_id', auth(['Administrador', 'Almacén']), estadoController.eliminarEstado);

module.exports = router;
