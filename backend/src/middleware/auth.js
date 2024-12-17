// Para la autenticación y verificación de permisos.
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const auth = (requiredRoles) => {
  return (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ respuesta: false, mensaje: 'Acceso denegado. Token no proporcionado.' });
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ respuesta: false, mensaje: 'Acceso denegado. Token no proporcionado.' });
    }

    try {
      const decoded = jwt.verify(token, 'tu_clave_secreta'); // Reemplaza 'tu_clave_secreta' con tu clave secreta
      req.user = decoded;

      // Verificar el rol del usuario
      const query = `SELECT tip_usr_nombre FROM TipoUsuarios WHERE tip_usr_id = ?`;
      db.query(query, [req.user.tip_usr_id], (err, results) => {
        if (err || results.length === 0) {
          return res.status(403).json({ respuesta: false, mensaje: 'Acceso denegado. Usuario no válido.' });
        }

        const userType = results[0].tip_usr_nombre;
        console.log(`Tipo de usuario: ${userType}`); // Verificar que esto imprima 'Instructor' para tip_usr_id 2

        // Verificar si el rol de usuario está en la lista de roles requeridos
        if (requiredRoles && !requiredRoles.includes(userType)) {
          return res.status(403).json({ respuesta: false, mensaje: `Acceso denegado. Permisos insuficientes para el rol de ${userType}.` });
        }

        next();
      });
    } catch (ex) {
      res.status(400).json({ respuesta: false, mensaje: 'Token no válido.' });
    }
  };
};

module.exports = auth;



