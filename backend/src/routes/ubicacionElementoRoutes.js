const express = require('express');
const router = express.Router();
const ubicacionElementoController = require('../controllers/ubicacionElementoController');
const auth = require('../middleware/auth');

// Rutas para ubicaciones de elementos
router.post('/crear', auth(['Administrador', 'Almacen']), ubicacionElementoController.crearUbicacionElemento);
router.put('/actualizar', auth(['Administrador', 'Almacen']), ubicacionElementoController.actualizarUbicacionElemento);
router.delete('/:ubi_ele_id', auth(['Administrador', 'Almacen']), ubicacionElementoController.eliminarUbicacionElemento);
router.get('/', auth(['Administrador', 'Almacen']), ubicacionElementoController.obtenerTodosUbicacionElementos);
router.get('/:ubi_ele_id', auth(['Administrador', 'Almacen']), ubicacionElementoController.obtenerUbicacionElementoPorId);

module.exports = router;
