const mysql = require('mysql2/promise');

/**
 * Crea un pool de conexiones a la base de datos MySQL.
 * Esto permite manejar múltiples conexiones de manera eficiente.
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
 */
(async () => {
  try {
    const connection = await db.getConnection();
    connection.release(); // Liberar la conexión después de verificarla
  } catch (err) {
    console.error('Error conectando a la base de datos:', err.stack);
  }
})();

module.exports = db;
