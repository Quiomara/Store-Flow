const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Función para normalizar texto (elimina tildes y pasa a minúsculas)
const normalizeText = (text) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

// Middleware de autenticación y autorización
const auth = (requiredRoles = []) => {
  return async (req, res, next) => {
    console.log('🔑 Iniciando autenticación y autorización...');

    // Verificar si se proporcionó el token en el encabezado
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('❌ Acceso denegado. Token no proporcionado.');
      return res.status(401).json({ respuesta: false, mensaje: 'Acceso denegado. Token no proporcionado.' });
    }

    // Extraer el token del encabezado
    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      console.error('❌ Acceso denegado. Token vacío.');
      return res.status(401).json({ respuesta: false, mensaje: 'Acceso denegado. Token vacío.' });
    }

    try {
      // Verificar y decodificar el token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      console.log('✅ Token decodificado:', decoded);

      // Verificar el rol del usuario en la base de datos
      const query = `SELECT tip_usr_id, tip_usr_nombre FROM TipoUsuarios WHERE tip_usr_id = ?`;
      const [results] = await db.query(query, [req.user.tip_usr_id]);
      console.log('🔍 Resultados de la consulta a la BD:', results);

      // Si no se encuentra el usuario en la base de datos
      if (results.length === 0) {
        console.error('❌ Acceso denegado. Usuario no válido.');
        return res.status(403).json({ respuesta: false, mensaje: 'Acceso denegado. Usuario no válido.' });
      }

      // Normalizar nombres antes de comparar
      const userType = normalizeText(results[0].tip_usr_nombre.trim());
      const userId = results[0].tip_usr_id;
      const normalizedRoles = requiredRoles.map(r => normalizeText(r.trim()));

      console.log(`👤 Tipo de usuario: '${userType}' (ID: ${userId})`);
      console.log(`🔹 Roles requeridos para esta acción: ${normalizedRoles.join(', ')}`);

      // Verificar si el rol del usuario está en la lista de roles requeridos
      if (normalizedRoles.length > 0 && !normalizedRoles.includes(userType)) {
        console.error(`🚫 Acceso denegado. Usuario '${userType}' (ID: ${userId}) no tiene permisos.`);
        return res.status(403).json({ 
          respuesta: false, 
          mensaje: `Acceso denegado. Permisos insuficientes para el rol de ${userType}.`
        });
      }

      // Si todo está bien, continuar con la siguiente función middleware
      console.log('✅ Autenticación y autorización completadas correctamente.');
      next();
    } catch (error) {
      console.error('❌ Error en el middleware de autenticación:', error.stack);

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
