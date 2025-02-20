const db = require('../config/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const sendResetEmail = require('../config/mailer');
require('dotenv').config(); // Asegúrate de cargar las variables de entorno

/**
 * Controlador para manejar el inicio de sesión del usuario.
 * @param {Object} req - Objeto de solicitud.
 * @param {Object} res - Objeto de respuesta.
 */
const login = async (req, res) => {
  const { correo, contrasena } = req.body;

  try {
    // Verificar que el correo y la contraseña se proporcionaron
    if (!correo || !contrasena) {
      return res.status(400).send({ error: 'Correo y contraseña son necesarios.' });
    }

    // Consultar la base de datos para verificar si el usuario existe
    const [results] = await db.query('SELECT * FROM Usuarios WHERE usr_correo = ?', [correo]);

    // Verificar si el usuario no está registrado
    if (results.length === 0) {
      return res.status(404).send({ error: 'Usuario no registrado. Por favor contacta con un administrador.' });
    }

    const user = results[0];

    // Verificar la contraseña
    const validPassword = bcrypt.compareSync(contrasena, user.usr_contrasena);

    if (!validPassword) {
      return res.status(400).send({ error: 'Usuario o contraseña incorrectos.' });
    }

    // Generar token JWT
    const token = jwt.sign({ usr_cedula: user.usr_cedula, tip_usr_id: user.tip_usr_id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Obtener el tipo de usuario
    const [typeResults] = await db.query('SELECT tip_usr_nombre FROM TipoUsuarios WHERE tip_usr_id = ?', [user.tip_usr_id]);

    if (typeResults.length === 0) {
      return res.status(400).send({ error: 'Tipo de usuario no encontrado.' });
    }

    const userType = typeResults[0].tip_usr_nombre;
    res.send({ token, userType, cedula: user.usr_cedula }); // Incluir la cédula en la respuesta
  } catch (error) {
    console.error('Error en el servidor:', error);
    res.status(500).send({ error: 'Error en el servidor.' });
  }
};

/**
 * Controlador para manejar la recuperación de contraseñas.
 * @param {Object} req - Objeto de solicitud.
 * @param {Object} res - Objeto de respuesta.
 */
const forgotPassword = async (req, res) => {
  const { correo } = req.body;

  try {
    const [results] = await db.query('SELECT * FROM Usuarios WHERE usr_correo = ?', [correo]);

    if (results.length === 0) {
      return res.status(404).send({ error: 'Usuario no registrado. Por favor contacta con un administrador.' });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hora en milisegundos
      .toISOString()
      .slice(0, 19)
      .replace('T', ' '); // Convertir a formato MySQL (YYYY-MM-DD HH:MM:SS)

    await db.query(
      'UPDATE Usuarios SET reset_token = ?, reset_token_expiry = ? WHERE usr_correo = ?',
      [resetToken, resetTokenExpiry, correo]
    );

    await sendResetEmail(correo, resetToken);
    res.send({ 
      message: `Ve a tu correo ${correo} y haz clic en el enlace de restablecimiento de contraseña que se te ha enviado.`,
      token: resetToken // ← Incluir el token en la respuesta para depuración
    });
  } catch (error) {
    console.error('Error en el servidor:', error);
    res.status(500).send({ error: 'Error en el servidor.' });
  }
};

/**
 * Controlador para manejar el restablecimiento de contraseñas.
 * @param {Object} req - Objeto de solicitud.
 * @param {Object} res - Objeto de respuesta.
 */
const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    if (!token || !newPassword) {
      return res.status(400).send({ message: 'Token y nueva contraseña son necesarios.' });
    }

    // Obtener la fecha actual en formato MySQL (YYYY-MM-DD HH:MM:SS)
    const currentTimestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');

    const [results] = await db.query(
      'SELECT * FROM Usuarios WHERE reset_token = ? AND reset_token_expiry > ?',
      [token, currentTimestamp] // Comparar con fecha actual
    );

    if (results.length === 0) {
      return res.status(400).send({ message: 'Token inválido o ha expirado.' });
    }

    const user = results[0];
    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    await db.query(
      'UPDATE Usuarios SET usr_contrasena = ?, reset_token = NULL, reset_token_expiry = NULL WHERE usr_cedula = ?',
      [hashedPassword, user.usr_cedula]
    );

    res.send({ message: 'Contraseña restablecida con éxito' });
  } catch (error) {
    console.error('Error en el servidor:', error);
    res.status(500).send({ error: 'Error en el servidor.' });
  }
};

module.exports = { login, forgotPassword, resetPassword };