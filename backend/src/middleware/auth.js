const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Middleware de autenticación y autorización
const auth = (requiredRoles = []) => {
  return async (req, res, next) => {
    // Verificar si se proporcionó el token en el encabezado
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ respuesta: false, mensaje: 'Acceso denegado. Token no proporcionado.' });
    }

    // Extraer el token del encabezado
    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ respuesta: false, mensaje: 'Acceso denegado. Token no proporcionado.' });
    }

    try {
      // Verificar y decodificar el token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // Almacenar la información del usuario en la solicitud
      console.log('Token decodificado:', decoded); // Depuración: Imprime el token decodificado

      // Verificar el rol del usuario en la base de datos
      const query = `SELECT tip_usr_id, tip_usr_nombre FROM TipoUsuarios WHERE tip_usr_id = ?`;
      const [results] = await db.query(query, [req.user.tip_usr_id]); // Usar async/await
      console.log('Resultados de la consulta:', results); // Depuración: Imprime los resultados de la consulta

      // Si no se encuentra el usuario en la base de datos
      if (results.length === 0) {
        return res.status(403).json({ respuesta: false, mensaje: 'Acceso denegado. Usuario no válido.' });
      }

      const userType = results[0].tip_usr_nombre; // Nombre del tipo de usuario
      const userId = results[0].tip_usr_id; // ID del tipo de usuario
      console.log(`Tipo de usuario: ${userType} (ID: ${userId})`); // Depuración: Imprime el tipo de usuario y su ID

      // Verificar si el rol del usuario está en la lista de roles requeridos o si su ID está permitido
      if (requiredRoles.length > 0 && !requiredRoles.includes(userType) && ![1, 2, 3].includes(userId)) {
        console.error(`Acceso denegado. Permisos insuficientes para el rol de ${userType}.`);
        return res.status(403).json({ respuesta: false, mensaje: `Acceso denegado. Permisos insuficientes para el rol de ${userType}.` });
      }

      // Si todo está bien, continuar con la siguiente función middleware
      console.log('Autenticación y autorización completadas correctamente.');
      next();
    } catch (error) {
      console.error('Error en el middleware de autenticación:', error.stack); // Depuración de error

      // Manejar errores específicos de JWT
      if (error.name === 'JsonWebTokenError') {
        return res.status(400).json({ respuesta: false, mensaje: 'Token no válido.' });
      }

      // Manejar errores de expiración del token
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ respuesta: false, mensaje: 'Token expirado. Inicie sesión nuevamente.' });
      }

      // Manejar otros errores
      res.status(500).json({ respuesta: false, mensaje: 'Error interno del servidor.' });
    }
  };
};

module.exports = auth;