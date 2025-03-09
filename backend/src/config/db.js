const mysql = require('mysql2/promise');

/**
 * Crea un pool de conexiones a la base de datos MySQL.
 * Esto permite manejar múltiples conexiones de manera eficiente.
 * @param {string} host - La dirección del servidor de la base de datos.
 * @param {string} user - El usuario para la base de datos.
 * @param {string} password - La contraseña del usuario.
 * @param {string} database - El nombre de la base de datos.
 * @param {boolean} waitForConnections - Si se deben esperar las conexiones cuando se alcanza el límite.
 * @param {number} connectionLimit - El número máximo de conexiones simultáneas permitidas.
 * @param {number} queueLimit - El límite de conexiones en cola (0 = ilimitado).
 * @returns {mysql.Pool} El pool de conexiones a la base de datos.
 */
const db = mysql.createPool({
  host: 'localhost',      // Dirección del servidor de la base de datos
  user: 'root',           // Usuario de la base de datos
  password: '',           // Contraseña del usuario
  database: 'StoreFlowDB', // Nombre de la base de datos
  waitForConnections: true, // Esperar conexiones cuando se alcanza el límite
  connectionLimit: 10,     // Número máximo de conexiones simultáneas
  queueLimit: 0,           // Límite de conexiones en cola (0 = ilimitado)
});

/**
 * Verifica la conexión a la base de datos.
 * Intenta obtener una conexión y la libera inmediatamente si es exitosa.
 * @returns {Promise<void>} Retorna una promesa que resuelve si la conexión es exitosa.
 */
(async () => {
  try {
    console.log('✅ Conexión a la base de datos exitosa.')
    const connection = await db.getConnection();
    connection.release(); // Liberar la conexión después de verificarla
  } catch (err) {
    // Eliminar console.log y reemplazar con un mensaje de error más adecuado.
    console.error('Error conectando a la base de datos:', err.stack);
  }
})();

module.exports = db;
