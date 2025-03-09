const bcrypt = require('bcryptjs');
const Usuario = require('../models/usuarioModel');

/**
 * Registra un nuevo usuario en la base de datos.
 * Verifica que los datos sean correctos y encripta la contraseña antes de almacenarla.
 * @param {Object} req - Objeto de la solicitud HTTP, que contiene los datos del usuario en `req.body`.
 * @param {Object} res - Objeto de la respuesta HTTP, utilizado para enviar la respuesta.
 * @returns {void} Responde al cliente con un mensaje de éxito o error.
 */
const registrarUsuario = async (req, res) => {
  const data = req.body;

  // Verificar que todos los datos requeridos estén presentes
  if (!data.usr_cedula || !data.usr_primer_nombre || !data.usr_primer_apellido || !data.usr_correo || !data.usr_contrasena || !data.tip_usr_id || !data.cen_id) {
    return res.status(400).json({ respuesta: false, mensaje: 'Faltan datos requeridos.' });
  }

  try {
    // Verificar si el usuario ya existe por cédula
    const usuarioPorCedula = await Usuario.buscarPorId(data.usr_cedula);
    if (usuarioPorCedula.length > 0) {
      return res.status(400).json({ respuesta: false, mensaje: 'El usuario ya existe con la cédula proporcionada.' });
    }

    // Verificar si el usuario ya existe por correo electrónico
    const usuarioPorCorreo = await Usuario.buscarPorCorreo(data.usr_correo);
    if (usuarioPorCorreo.length > 0) {
      return res.status(400).json({ respuesta: false, mensaje: 'El usuario ya existe con el correo proporcionado.' });
    }

    // Verificar si el usuario ya existe por teléfono
    const usuarioPorTelefono = await Usuario.buscarPorTelefono(data.usr_telefono);
    if (usuarioPorTelefono.length > 0) {
      return res.status(400).json({ respuesta: false, mensaje: 'El usuario ya existe con el teléfono proporcionado.' });
    }

    // Encriptar la contraseña
    data.usr_contrasena = bcrypt.hashSync(data.usr_contrasena, 10);

    // Crear usuario
    await Usuario.crear(data);
    res.json({ respuesta: true, mensaje: '¡Usuario registrado con éxito!' });
  } catch (err) {
    // Se mantiene el mensaje de error, pero se elimina el console.log
    res.status(500).json({ respuesta: false, mensaje: `Error al registrar el usuario: ${err.message}` });
  }
};


/**
 * Actualiza la información de un usuario existente.
 * Un usuario solo puede actualizar su propia información a menos que sea administrador.
 * @param {Object} req - Objeto de la solicitud HTTP, contiene los datos del usuario en `req.body` y el usuario autenticado en `req.user`.
 * @param {Object} res - Objeto de la respuesta HTTP, utilizado para enviar la respuesta.
 * @returns {void} Responde al cliente con un mensaje de éxito o error.
 */
const actualizarUsuario = async (req, res) => {
  const data = req.body;
  const userId = req.user.usr_cedula;
  const userRole = req.user.tip_usr_id;

  // Verificar que el usuario tenga permiso para actualizar la información
  if (userRole !== 1 && data.usr_cedula !== userId) {
    return res.status(403).json({ respuesta: false, mensaje: 'Acceso denegado. No puede actualizar la información de otro usuario.' });
  }

  try {
    // Si se proporciona una nueva contraseña, se encripta
    if (data.usr_contrasena) {
      data.usr_contrasena = bcrypt.hashSync(data.usr_contrasena, 10);
    }

    // Actualizar la información del usuario
    await Usuario.actualizar(data);
    res.json({ respuesta: true, mensaje: '¡Usuario actualizado con éxito!' });
  } catch (err) {
    // Se elimina el console.log y se devuelve el error al cliente
    res.status(500).json({ respuesta: false, mensaje: 'Error al actualizar el usuario.' });
  }
};

/**
 * Elimina un usuario de la base de datos.
 * @param {Object} req - Objeto de la solicitud HTTP, contiene el `usr_cedula` del usuario a eliminar en `req.params`.
 * @param {Object} res - Objeto de la respuesta HTTP, utilizado para enviar la respuesta.
 * @returns {void} Responde al cliente con un mensaje de éxito o error.
 */
const eliminarUsuario = async (req, res) => {
  const usr_cedula = req.params.usr_cedula;

  try {
    // Eliminar el usuario de la base de datos
    const result = await Usuario.eliminar(usr_cedula);
    if (result.affectedRows === 0) {
      return res.status(404).json({ respuesta: false, mensaje: 'Usuario no encontrado.' });
    }
    res.json({ respuesta: true, mensaje: '¡Usuario eliminado con éxito!' });
  } catch (err) {
    // Se elimina el console.log y se devuelve el error al cliente
    res.status(500).json({ respuesta: false, mensaje: 'Error al eliminar el usuario.' });
  }
};


/**
 * Obtiene un usuario por su cédula.
 * @param {Object} req - Objeto de la solicitud HTTP, contiene el parámetro `usr_cedula` en `req.params`.
 * @param {Object} res - Objeto de la respuesta HTTP, utilizado para enviar la respuesta.
 * @returns {void} Responde al cliente con el usuario o un mensaje de error.
 */
const obtenerUsuario = async (req, res) => {
  const usr_cedula = req.params.usr_cedula;

  try {
    const results = await Usuario.buscarPorId(usr_cedula);
    if (results.length === 0) {
      return res.status(404).json({ respuesta: false, mensaje: 'Usuario no encontrado.' });
    }
    res.json({ respuesta: true, mensaje: '¡Usuario obtenido con éxito!', data: results[0] });
  } catch (err) {
    res.status(500).json({ respuesta: false, mensaje: 'Error al obtener el usuario.' });
  }
};

/**
 * Obtiene la lista de todos los usuarios.
 * @param {Object} req - Objeto de la solicitud HTTP.
 * @param {Object} res - Objeto de la respuesta HTTP, utilizado para enviar la respuesta.
 * @returns {void} Responde al cliente con la lista de usuarios o un mensaje de error.
 */
const obtenerTodosUsuarios = async (req, res) => {
  try {
    const results = await Usuario.buscarTodos();
    res.json({ respuesta: true, mensaje: '¡Usuarios obtenidos con éxito!', data: results });
  } catch (err) {
    res.status(500).json({ respuesta: false, mensaje: 'Error al obtener los usuarios.' });
  }
};

/**
 * Obtiene una lista de usuarios filtrada por su tipo.
 * @param {Object} req - Objeto de la solicitud HTTP, contiene el parámetro `tip_usr_id` en `req.params`.
 * @param {Object} res - Objeto de la respuesta HTTP, utilizado para enviar la respuesta.
 * @returns {void} Responde al cliente con los usuarios filtrados por tipo o un mensaje de error.
 */
const obtenerUsuariosPorTipo = async (req, res) => {
  const tip_usr_id = req.params.tip_usr_id;

  try {
    const results = await Usuario.buscarPorTipo(tip_usr_id);
    res.json({ respuesta: true, mensaje: '¡Usuarios obtenidos por tipo con éxito!', data: results });
  } catch (err) {
    res.status(500).json({ respuesta: false, mensaje: 'Error al obtener los usuarios por tipo.' });
  }
};

module.exports = {
  registrarUsuario,
  actualizarUsuario,
  eliminarUsuario,
  obtenerUsuario,
  obtenerTodosUsuarios,
  obtenerUsuariosPorTipo
};
