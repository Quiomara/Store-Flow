const db = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sendResetEmail = require('../config/mailer');
require('dotenv').config(); // Cargar variables de entorno desde .env

/**
 * Controlador para manejar el inicio de sesión del usuario.
 *
 * Este controlador valida que se hayan proporcionado el correo y la contraseña.
 * Busca al usuario en la base de datos, verifica la contraseña y genera un token JWT
 * que incluye la cédula del usuario y el tipo de usuario.
 *
 * @async
 * @function login
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} req.body - Datos enviados en la solicitud.
 * @param {string} req.body.correo - Correo electrónico del usuario.
 * @param {string} req.body.contrasena - Contraseña del usuario.
 * @param {Object} res - Objeto de respuesta HTTP.
 */
const login = async (req, res) => {
  const { correo, contrasena } = req.body;

  try {
    if (!correo || !contrasena) {
      return res.status(400).send({ error: 'Correo y contraseña son necesarios.' });
    }

    // Buscar usuario en la base de datos
    const [results] = await db.query('SELECT * FROM Usuarios WHERE usr_correo = ?', [correo]);

    if (results.length === 0) {
      return res.status(404).send({ error: 'Usuario no registrado. Por favor contacta con un administrador.' });
    }

    const user = results[0];

    // Comparar la contraseña ingresada con la almacenada en la base de datos
    const validPassword = bcrypt.compareSync(contrasena, user.usr_contrasena);
    if (!validPassword) {
      return res.status(400).send({ error: 'Usuario o contraseña incorrectos.' });
    }

    // Generar un token JWT con la cédula y tipo de usuario
    const token = jwt.sign(
      { usr_cedula: user.usr_cedula, tip_usr_id: user.tip_usr_id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Obtener el tipo de usuario
    const [typeResults] = await db.query('SELECT tip_usr_nombre FROM TipoUsuarios WHERE tip_usr_id = ?', [user.tip_usr_id]);

    if (typeResults.length === 0) {
      return res.status(400).send({ error: 'Tipo de usuario no encontrado.' });
    }

    const userType = typeResults[0].tip_usr_nombre;
    res.send({ token, userType, cedula: user.usr_cedula });
  } catch (error) {
    res.status(500).send({ error: 'Error en el servidor.' });
  }
};

/**
 * Controlador para manejar la recuperación de contraseñas.
 *
 * Este controlador verifica si el usuario está registrado en la base de datos,
 * genera un token de restablecimiento de contraseña junto con su fecha de expiración,
 * actualiza la base de datos y envía un correo electrónico con el enlace para restablecer la contraseña.
 *
 * @async
 * @function forgotPassword
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} req.body - Datos enviados en la solicitud.
 * @param {string} req.body.correo - Correo electrónico del usuario.
 * @param {Object} res - Objeto de respuesta HTTP.
 */
const forgotPassword = async (req, res) => {
  const { correo } = req.body;

  try {
    const [results] = await db.query('SELECT * FROM Usuarios WHERE usr_correo = ?', [correo]);

    if (results.length === 0) {
      return res.status(404).send({ error: 'Usuario no registrado. Por favor contacta con un administrador.' });
    }

    // Generar un token de restablecimiento de contraseña y su fecha de expiración (1 hora)
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hora en milisegundos
      .toISOString()
      .slice(0, 19)
      .replace('T', ' ');

    await db.query(
      'UPDATE Usuarios SET reset_token = ?, reset_token_expiry = ? WHERE usr_correo = ?',
      [resetToken, resetTokenExpiry, correo]
    );

    await sendResetEmail(correo, resetToken);
    res.send({
      message: `Se ha enviado un enlace de restablecimiento a ${correo}.`,
    });
  } catch (error) {
    res.status(500).send({ error: 'Error en el servidor.' });
  }
};

/**
 * Controlador para manejar el restablecimiento de contraseñas.
 *
 * Este controlador verifica que se hayan proporcionado un token y una nueva contraseña,
 * valida el token y la fecha de expiración, actualiza la contraseña en la base de datos y
 * elimina el token de restablecimiento.
 *
 * @async
 * @function resetPassword
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} req.body - Datos enviados en la solicitud.
 * @param {string} req.body.token - Token de restablecimiento de contraseña.
 * @param {string} req.body.newPassword - Nueva contraseña para el usuario.
 * @param {Object} res - Objeto de respuesta HTTP.
 */
const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    if (!token || !newPassword) {
      return res.status(400).send({ message: 'Token y nueva contraseña son necesarios.' });
    }

    // Obtener la fecha y hora actual en formato compatible con MySQL
    const currentTimestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // Buscar el usuario con el token y verificar que no haya expirado
    const [results] = await db.query(
      'SELECT * FROM Usuarios WHERE reset_token = ? AND reset_token_expiry > ?',
      [token, currentTimestamp]
    );

    if (results.length === 0) {
      return res.status(400).send({ message: 'Token inválido o ha expirado.' });
    }

    const user = results[0];
    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    // Actualizar la contraseña y eliminar el token de restablecimiento
    await db.query(
      'UPDATE Usuarios SET usr_contrasena = ?, reset_token = NULL, reset_token_expiry = NULL WHERE usr_cedula = ?',
      [hashedPassword, user.usr_cedula]
    );

    res.send({ message: 'Contraseña restablecida con éxito' });
  } catch (error) {
    res.status(500).send({ error: 'Error en el servidor.' });
  }
};

module.exports = { login, forgotPassword, resetPassword };
