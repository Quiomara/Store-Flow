const mysql = require('mysql2/promise');
const dbConfig = require('../config/db'); // Cambia esto si antes decía dbConfig

async function dbTransaction(callback) {
    const connection = await mysql.createConnection(dbConfig);
    await connection.beginTransaction();

    try {
        const result = await callback(connection);
        await connection.commit();
        return result;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        await connection.end();
    }
}

module.exports = dbTransaction;
