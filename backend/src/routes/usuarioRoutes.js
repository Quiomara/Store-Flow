// Para las rutas de usuarios.
const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const auth = require('../middleware/auth');

// Rutas para usuarios
router.post('/registrar', auth(['Administrador']), usuarioController.registrarUsuario);
router.put('/actualizar', auth(['Administrador', 'Instructor', 'Almacen']), usuarioController.actualizarUsuario);
router.get('/:usr_cedula', auth(['Administrador']), usuarioController.obtenerUsuario);
router.delete('/:usr_cedula', auth(['Administrador']), usuarioController.eliminarUsuario);
router.get('/', auth(['Administrador']), usuarioController.obtenerTodosUsuarios);
router.get('/tipo/:tip_usr_id', auth(['Administrador']), usuarioController.obtenerUsuariosPorTipo);

module.exports = router;

