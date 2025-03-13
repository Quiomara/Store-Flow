const jwt = require('jsonwebtoken');
const db = require('../config/db');

/**
 * Normaliza el texto eliminando tildes y convirtiéndolo a minúsculas.
 *
 * @param {string} text - Texto a normalizar.
 * @returns {string} Texto normalizado.
 */
const normalizeText = (text) => text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/**
 * Middleware de autenticación y autorización.
 *
 * Este middleware verifica que el usuario tenga un token JWT válido en el header "Authorization".
 * Además, consulta en la base de datos el rol del usuario y, si se especifican roles requeridos,
 * compara el rol del usuario con la lista de roles permitidos para autorizar el acceso al recurso.
 *
 * @param {string[]} [requiredRoles=[]] - Lista de roles permitidos para acceder al recurso.
 * @returns {Function} Middleware de autenticación.
 */
const auth = (requiredRoles = []) => {
  return async (req, res, next) => {
    // Verificar si el token está en los headers
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ respuesta: false, mensaje: 'Acceso denegado. Token no proporcionado.' });
    }

    // Extraer el token
    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ respuesta: false, mensaje: 'Acceso denegado. Token vacío.' });
    }

    try {
      // Verificar el token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      if (!decoded.tip_usr_id) {
        return res.status(403).json({ respuesta: false, mensaje: 'Token inválido: falta tip_usr_id.' });
      }

      // Consultar en la base de datos el rol del usuario
      const query = `SELECT tip_usr_id, tip_usr_nombre FROM TipoUsuarios WHERE tip_usr_id = ?`;
      const [results] = await db.query(query, [req.user.tip_usr_id]);

      if (!Array.isArray(results) || results.length === 0) {
        return res.status(403).json({ respuesta: false, mensaje: 'Acceso denegado. Usuario no válido.' });
      }

      // Normalizar el rol del usuario y compararlo con los roles requeridos
      const userType = normalizeText(results[0].tip_usr_nombre.trim());
      const normalizedRoles = requiredRoles.map(r => normalizeText(r.trim()));

      if (normalizedRoles.length > 0 && !normalizedRoles.includes(userType)) {
        return res.status(403).json({
          respuesta: false,
          mensaje: `Acceso denegado. Permisos insuficientes para el rol de ${userType}.`
        });
      }

      next();
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        return res.status(400).json({ respuesta: false, mensaje: 'Token no válido.' });
      }

      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ respuesta: false, mensaje: 'Token expirado. Inicie sesión nuevamente.' });
      }

      res.status(500).json({ respuesta: false, mensaje: 'Error interno del servidor.' });
    }
  };
};

module.exports = auth;
