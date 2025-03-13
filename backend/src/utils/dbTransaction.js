const mysql = require('mysql2/promise');
const dbConfig = require('../config/db'); // Importa la configuración de la base de datos

/**
 * Maneja una transacción de base de datos de manera segura.
 *
 * Esta función crea una conexión a la base de datos, inicia una transacción, 
 * ejecuta la función callback que contiene las operaciones de la transacción, 
 * y confirma la transacción si todo sale bien. En caso de error, revierte la transacción y lanza el error.
 *
 * @async
 * @function dbTransaction
 * @param {Function} callback - Función que contiene las operaciones de la transacción y recibe la conexión como argumento.
 * @returns {Promise<any>} Resultado de la transacción si es exitosa.
 * @throws {Error} Lanza un error si la transacción falla.
 */
async function dbTransaction(callback) {
    // Crea una conexión a la base de datos
    const connection = await mysql.createConnection(dbConfig);
    await connection.beginTransaction(); // Inicia la transacción

    try {
        const result = await callback(connection); // Ejecuta la función proporcionada con la conexión
        await connection.commit(); // Confirma la transacción si todo va bien
        return result;
    } catch (error) {
        await connection.rollback(); // Revierte la transacción en caso de error
        throw error;
    } finally {
        await connection.end(); // Cierra la conexión
    }
}

module.exports = dbTransaction;
