const mysql = require('mysql2/promise');

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'StoreFlowDB',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Verificar la conexión
(async () => {
  try {
    const connection = await db.getConnection();
    console.log('Conexión a la base de datos verificada correctamente.');
    connection.release();
  } catch (err) {
    console.error('Error conectando a la base de datos:', err.stack);
  }
})();

module.exports = db;
