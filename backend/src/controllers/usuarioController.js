// Para manejar las operaciones CRUD de usuarios.
const bcrypt = require('bcryptjs');
const Usuario = require('../models/usuarioModel');

const registrarUsuario = (req, res) => {
  const data = req.body;
  data.usr_contrasena = bcrypt.hashSync(data.usr_contrasena, 10);

  Usuario.crear(data, (err, results) => {
    if (err) {
      console.error('Error al registrar el usuario:', err.stack);
      return res.status(500).json({ respuesta: false, mensaje: 'Error al registrar el usuario.' });
    }
    res.json({ respuesta: true, mensaje: '¡Usuario registrado con éxito!' });
  });
};

const actualizarUsuario = (req, res) => {
  const data = req.body;
  const userId = req.user.usr_cedula;
  const userRole = req.user.tip_usr_id;

  if (userRole !== 1 && data.usr_cedula !== userId) {
    return res.status(403).json({ respuesta: false, mensaje: 'Acceso denegado. No puede actualizar la información de otro usuario.' });
  }

  if (data.usr_contrasena) {
    data.usr_contrasena = bcrypt.hashSync(data.usr_contrasena, 10);
  }

  Usuario.actualizar(data, (err, results) => {
    if (err) {
      console.error('Error al actualizar el usuario:', err.stack);
      return res.status(500).json({ respuesta: false, mensaje: 'Error al actualizar el usuario.' });
    }
    res.json({ respuesta: true, mensaje: '¡Usuario actualizado con éxito!' });
  });
};

const eliminarUsuario = (req, res) => {
  const usr_cedula = req.params.usr_cedula;

  Usuario.eliminar(usr_cedula, (err, results) => {
    if (err) {
      console.error('Error al eliminar el usuario:', err.stack);
      return res.status(500).json({ respuesta: false, mensaje: 'Error al eliminar el usuario.' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ respuesta: false, mensaje: 'Usuario no encontrado.' });
    }

    res.json({ respuesta: true, mensaje: '¡Usuario eliminado con éxito!' });
  });
};

const obtenerUsuario = (req, res) => {
  const usr_cedula = req.params.usr_cedula;

  Usuario.obtenerPorCedula(usr_cedula, (err, results) => {
    if (err) {
      console.error('Error al obtener el usuario:', err.stack);
      return res.status(500).json({ respuesta: false, mensaje: 'Error al obtener el usuario.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ respuesta: false, mensaje: 'Usuario no encontrado.' });
    }

    res.json({ respuesta: true, mensaje: '¡Usuario obtenido con éxito!', data: results[0] });
  });
};

const obtenerTodosUsuarios = (req, res) => {
  Usuario.obtenerTodos((err, results) => {
    if (err) {
      console.error('Error al obtener los usuarios:', err.stack);
      return res.status(500).json({ respuesta: false, mensaje: 'Error al obtener los usuarios.' });
    }
    res.json({ respuesta: true, mensaje: '¡Usuarios obtenidos con éxito!', data: results });
  });
};

const obtenerUsuariosPorTipo = (req, res) => {
  const tip_usr_id = req.params.tip_usr_id;

  Usuario.obtenerPorTipo(tip_usr_id, (err, results) => {
    if (err) {
      console.error('Error al obtener los usuarios por tipo:', err.stack);
      return res.status(500).json({ respuesta: false, mensaje: 'Error al obtener los usuarios por tipo.' });
    }
    res.json({ respuesta: true, mensaje: '¡Usuarios obtenidos por tipo con éxito!', data: results });
  });
};

module.exports = {
  registrarUsuario,
  actualizarUsuario,
  eliminarUsuario,
  obtenerUsuario,
  obtenerTodosUsuarios,
  obtenerUsuariosPorTipo
};
