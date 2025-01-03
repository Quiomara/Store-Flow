const express = require('express');
const router = express.Router();
const prestamoController = require('../controllers/prestamoController');
const auth = require('../middleware/authenticateToken');

router.post('/crear', auth, prestamoController.crearPrestamo);
router.put('/actualizar', auth, prestamoController.actualizarPrestamo);
router.delete('/:pre_id', auth, prestamoController.eliminarPrestamo);
router.get('/', auth, prestamoController.obtenerTodosPrestamos);
router.get('/:pre_id', auth, prestamoController.obtenerPrestamoPorId);

module.exports = router;
