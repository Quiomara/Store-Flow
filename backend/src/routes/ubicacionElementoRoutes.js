const express = require('express');
const router = express.Router();
const ubicacionElementoController = require('../controllers/ubicacionElementoController');
const auth = require('../middleware/auth');

// Rutas para ubicaciones de elementos
router.post('/crear', auth(['Administrador']), ubicacionElementoController.crearUbicacionElemento);
router.put('/actualizar', auth(['Administrador']), ubicacionElementoController.actualizarUbicacionElemento);
router.delete('/:ubi_ele_id', auth(['Administrador']), ubicacionElementoController.eliminarUbicacionElemento);
router.get('/', auth(['Administrador', 'Instructor', 'Almacen']), ubicacionElementoController.obtenerTodosUbicacionElementos);
router.get('/:ubi_ele_id', auth(['Administrador', 'Instructor', 'Almacen']), ubicacionElementoController.obtenerUbicacionElementoPorId);

module.exports = router;
