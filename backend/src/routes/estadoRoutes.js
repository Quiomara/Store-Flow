const express = require('express');
const router = express.Router();
const estadoController = require('../controllers/estadoController');
const auth = require('../middleware/auth');

// Rutas para estados
router.get('/', auth(['Administrador', 'Instructor', 'Almacen']), estadoController.obtenerTodosEstados); // Comentamos el auth para probar
router.get('/:est_id', auth(['Administrador', 'Instructor', 'Almacen']), estadoController.obtenerEstadoPorId);
router.post('/crear', auth(['Administrador', 'Almacen']), estadoController.crearEstado);
router.put('/actualizar', auth(['Administrador', 'Almacen']), estadoController.actualizarEstado);
router.delete('/eliminar/:est_id', auth(['Administrador', 'Almacen']), estadoController.eliminarEstado);

module.exports = router;
