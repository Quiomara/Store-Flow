const express = require('express');
const router = express.Router();
const ubicacionElementoController = require('../controllers/ubicacionElementoController');
const auth = require('../middleware/auth');

// Rutas para ubicaciones de elementos
router.post('/crear', auth(['Administrador', 'Almacén']), ubicacionElementoController.crearUbicacionElemento);
router.put('/actualizar', auth(['Administrador', 'Almacén']), ubicacionElementoController.actualizarUbicacionElemento);
router.delete('/:ubi_ele_id', auth(['Administrador', 'Almacén']), ubicacionElementoController.eliminarUbicacionElemento);
router.get('/', auth(['Administrador', 'Almacén']), ubicacionElementoController.obtenerTodosUbicacionElementos);
router.get('/:ubi_ele_id', auth(['Administrador', 'Almacén']), ubicacionElementoController.obtenerUbicacionElementoPorId);

module.exports = router;
