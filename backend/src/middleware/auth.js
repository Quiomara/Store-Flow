const jwt = require('jsonwebtoken');
const db = require('../config/db');

const normalizeText = (text) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const auth = (requiredRoles = []) => {
  return async (req, res, next) => {
    console.log('🔑 Iniciando autenticación y autorización...');

    // Verificar si el token está en los headers
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('❌ Acceso denegado. Token no proporcionado.');
      return res.status(401).json({ respuesta: false, mensaje: 'Acceso denegado. Token no proporcionado.' });
    }

    // Extraer el token
    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      console.error('❌ Acceso denegado. Token vacío.');
      return res.status(401).json({ respuesta: false, mensaje: 'Acceso denegado. Token vacío.' });
    }

    try {
      // 🔍 Decodificar sin verificar para depuración
      console.log('📜 Decodificando token...');
      const decodedRaw = jwt.decode(token, { complete: true });
      console.log('🧐 Token decodificado sin verificar:', decodedRaw);

      // ✅ Verificar el token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      console.log('✅ Token validado:', decoded);

      if (!decoded.tip_usr_id) {
        console.error('❌ Error: El token no contiene tip_usr_id.');
        return res.status(403).json({ respuesta: false, mensaje: 'Token inválido: falta tip_usr_id.' });
      }

      // 🔍 Consultar en la base de datos
      console.log('🔍 Buscando usuario en la base de datos...');
      const query = `SELECT tip_usr_id, tip_usr_nombre FROM TipoUsuarios WHERE tip_usr_id = ?`;
      const [results] = await db.query(query, [req.user.tip_usr_id]);

      console.log('📊 Resultados de la consulta a la BD:', results, 'Tipo:', typeof results);

      if (!Array.isArray(results)) {
        console.error('❌ Error: La consulta no devolvió un array.');
        return res.status(500).json({ respuesta: false, mensaje: 'Error al consultar la base de datos.' });
      }

      if (results.length === 0) {
        console.error('❌ Usuario no encontrado en la base de datos.');
        return res.status(403).json({ respuesta: false, mensaje: 'Acceso denegado. Usuario no válido.' });
      }

      // 📝 Normalización del rol
      const userType = normalizeText(results[0].tip_usr_nombre.trim());
      console.log(`👤 Rol del usuario antes de normalizar: '${results[0].tip_usr_nombre}'`);
      console.log(`🎭 Rol del usuario normalizado: '${userType}'`);

      const normalizedRoles = requiredRoles.map(r => normalizeText(r.trim()));

      console.log(`🔹 Roles requeridos: ${normalizedRoles.join(', ')}`);

      if (normalizedRoles.length > 0 && !normalizedRoles.includes(userType)) {
        console.error(`🚫 Usuario '${userType}' no tiene permisos.`);
        return res.status(403).json({
          respuesta: false,
          mensaje: `Acceso denegado. Permisos insuficientes para el rol de ${userType}.`
        });
      }

      console.log('✅ Autenticación y autorización completadas correctamente.');
      next();
    } catch (error) {
      console.error('❌ Error en autenticación:', error);

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
