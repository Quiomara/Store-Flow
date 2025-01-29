const express = require('express');
const router = express.Router();
const elementoController = require('../controllers/elementoController');
const auth = require('../middleware/auth');

// Rutas para elementos
router.post('/crear', auth(['Administrador', 'Instructor']), elementoController.crearElemento);
router.put('/actualizar', auth(['Administrador', 'Instructor']), elementoController.actualizarElemento);
router.delete('/:ele_id', auth(['Administrador', 'Instructor']), elementoController.eliminarElemento);
router.get('/', auth(['Administrador', 'Instructor', 'Almacen']), elementoController.obtenerTodosElementos);
router.get('/:ele_id', auth(['Administrador', 'Instructor', 'Almacen']), elementoController.obtenerElementoPorId);
router.put('/actualizarCantidadPrestado', auth(['Instructor', 'Almacen']), elementoController.actualizarCantidadPrestado);
router.put('/actualizar-stock', auth(['Administrador', 'Instructor', 'Almacen']), elementoController.actualizarStock);

module.exports = router;