const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Middleware de autenticación
const auth = (requiredRoles) => {
  return async (req, res, next) => {
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ respuesta: false, mensaje: 'Acceso denegado. Token no proporcionado.' });
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ respuesta: false, mensaje: 'Acceso denegado. Token no proporcionado.' });
    }

    try {
      // Verificar el token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      console.log('Token decodificado:', decoded); // Depuración: Imprime el token decodificado

      // Verificar el rol del usuario en la base de datos
      const query = `SELECT tip_usr_id, tip_usr_nombre FROM TipoUsuarios WHERE tip_usr_id = ?`;
      const [results] = await db.query(query, [req.user.tip_usr_id]); // Usar async/await
      console.log('Resultados de la consulta:', results); // Depuración: Imprime los resultados de la consulta

      if (results.length === 0) {
        return res.status(403).json({ respuesta: false, mensaje: 'Acceso denegado. Usuario no válido.' });
      }

      const userType = results[0].tip_usr_nombre;
      const userId = results[0].tip_usr_id;
      console.log(`Tipo de usuario: ${userType} (ID: ${userId})`); // Depuración: Imprime el tipo de usuario y su ID

      // Verificar si el rol del usuario está en la lista de roles requeridos o si su ID está permitido
      if (requiredRoles && !requiredRoles.includes(userType) && ![1, 2, 3].includes(userId)) {
        console.error(`Acceso denegado. Permisos insuficientes para el rol de ${userType}.`);
        return res.status(403).json({ respuesta: false, mensaje: `Acceso denegado. Permisos insuficientes para el rol de ${userType}.` });
      }

      // Si todo está bien, continuar con la siguiente función middleware
      console.log('Autenticación y autorización completadas correctamente.');
      next();
    } catch (error) {
      console.error('Error en el middleware de autenticación:', error.stack); // Depuración de error
      if (error.name === 'JsonWebTokenError') {
        return res.status(400).json({ respuesta: false, mensaje: 'Token no válido.' });
      }
      res.status(500).json({ respuesta: false, mensaje: 'Error interno del servidor.' });
    }
  };
};

module.exports = auth;
