const express = require('express');
const router = express.Router();
const elementoController = require('../controllers/elementoController');
const auth = require('../middleware/auth');

// Rutas para elementos
router.post('/crear', auth(['Administrador', 'Almacén']), elementoController.crearElemento);
router.put('/actualizar', auth(['Administrador', 'Almacén']), elementoController.actualizarElemento);
router.delete('/:ele_id', auth(['Administrador', 'Almacén']), elementoController.eliminarElemento);
router.get('/', auth(['Administrador', 'Instructor', 'Almacén']), elementoController.obtenerTodosElementos);
router.get('/:ele_id', auth(['Administrador', 'Instructor', 'Almacén']), elementoController.obtenerElementoPorId);
router.put('/actualizarCantidadPrestado', auth(['Instructor', 'Almacén']), elementoController.actualizarCantidadPrestado);
router.put('/actualizar-stock', auth(['Administrador', 'Almacén']), elementoController.actualizarStock);

module.exports = router;