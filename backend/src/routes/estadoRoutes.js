const express = require('express');
const router = express.Router();
const estadoController = require('../controllers/estadoController');

router.get('/', estadoController.obtenerTodosEstados);
router.get('/:est_id', estadoController.obtenerEstadoPorId);
router.post('/crear', estadoController.crearEstado);
router.put('/actualizar', estadoController.actualizarEstado);
router.delete('/eliminar/:est_id', estadoController.eliminarEstado);

module.exports = router;
