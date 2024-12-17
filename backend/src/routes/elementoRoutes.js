const express = require('express');
const router = express.Router();
const elementoController = require('../controllers/elementoController');
const auth = require('../middleware/auth');

// Rutas para elementos
router.post('/crear', auth(['Administrador']), elementoController.crearElemento);
router.put('/actualizar', auth(['Administrador']), elementoController.actualizarElemento);
router.delete('/:ele_id', auth(['Administrador']), elementoController.eliminarElemento);
router.get('/', auth(['Administrador', 'Instructor', 'Almacen']), elementoController.obtenerTodosElementos);
router.get('/:ele_id', auth(['Administrador', 'Instructor', 'Almacen']), elementoController.obtenerElementoPorId);

module.exports = router;
