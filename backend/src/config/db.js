require('dotenv').config(); // Cargar variables de entorno
const mysql = require('mysql2/promise');

/**
 * @typedef {Object} DatabaseConfig
 * @property {string} host - La dirección del servidor de la base de datos.
 * @property {string} user - El usuario para la base de datos.
 * @property {string} password - La contraseña del usuario.
 * @property {string} database - El nombre de la base de datos.
 * @property {boolean} waitForConnections - Si se deben esperar las conexiones cuando se alcanza el límite.
 * @property {number} connectionLimit - El número máximo de conexiones simultáneas permitidas.
 * @property {number} queueLimit - El límite de conexiones en cola (0 = ilimitado).
 */

/**
 * Crea un pool de conexiones a la base de datos MySQL.
 * Esto permite manejar múltiples conexiones de manera eficiente.
 * 
 * @constant
 * @type {mysql.Pool}
 * @module db
 */
const db = mysql.createPool(/** @type {DatabaseConfig} */ ({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'StoreFlowDB',
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: Number(process.env.DB_QUEUE_LIMIT) || 0,
}));

/**
 * Verifica la conexión a la base de datos.
 * Intenta obtener una conexión y la libera inmediatamente si es exitosa.
 * 
 * @async
 * @function checkConnection
 * @returns {Promise<void>} Retorna una promesa que se resuelve si la conexión es exitosa.
 */
(async function checkConnection() {
  try {
    const connection = await db.getConnection();
    connection.release(); // Liberar la conexión después de verificarla
    console.log('✅ Conexión a la base de datos exitosa.');
  } catch (err) {
    console.error('❌ Error conectando a la base de datos:', err.stack);
  }
})();

module.exports = db;
