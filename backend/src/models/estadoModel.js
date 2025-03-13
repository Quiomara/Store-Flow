const db = require('../config/db');

/**
 * Módulo para gestionar operaciones CRUD sobre los estados.
 * @module Estado
 */
const Estado = {
  /**
   * Obtiene todos los estados.
   *
   * Realiza una consulta a la base de datos para obtener todos los registros de estados.
   *
   * @async
   * @function obtenerTodos
   * @returns {Promise<Array>} Lista de todos los estados.
   */
  obtenerTodos: async () => {
    const query = 'SELECT * FROM Estados';
    const [results] = await db.query(query);
    return results;
  },

  /**
   * Obtiene un estado por su ID.
   *
   * Realiza una consulta a la base de datos para obtener el estado que coincide con el ID proporcionado.
   *
   * @async
   * @function obtenerPorId
   * @param {number} est_id - ID del estado.
   * @returns {Promise<Object|null>} Estado encontrado o null si no existe.
   */
  obtenerPorId: async (est_id) => {
    const query = 'SELECT * FROM Estados WHERE est_id = ?';
    const [results] = await db.query(query, [est_id]);
    return results.length > 0 ? results[0] : null;
  },

  /**
   * Crea un nuevo estado.
   *
   * Inserta un nuevo registro en la tabla de estados utilizando los datos proporcionados.
   *
   * @async
   * @function crear
   * @param {Object} data - Datos del estado a crear.
   * @param {string} data.est_nombre - Nombre del estado.
   * @returns {Promise<Object>} Resultado de la operación de inserción.
   */
  crear: async (data) => {
    const query = 'INSERT INTO Estados (est_nombre) VALUES (?)';
    const values = [data.est_nombre];
    const [result] = await db.query(query, values);
    return result;
  },

  /**
   * Actualiza un estado existente.
   *
   * Actualiza el nombre de un estado identificado por su ID.
   *
   * @async
   * @function actualizar
   * @param {Object} data - Datos del estado a actualizar.
   * @param {number} data.est_id - ID del estado a actualizar.
   * @param {string} data.est_nombre - Nuevo nombre del estado.
   * @returns {Promise<Object>} Resultado de la operación de actualización.
   */
  actualizar: async (data) => {
    const query = 'UPDATE Estados SET est_nombre = ? WHERE est_id = ?';
    const values = [data.est_nombre, data.est_id];
    const [result] = await db.query(query, values);
    return result;
  },

  /**
   * Elimina un estado por su ID.
   *
   * Borra el estado identificado por el ID proporcionado de la base de datos.
   *
   * @async
   * @function eliminar
   * @param {number} est_id - ID del estado a eliminar.
   * @returns {Promise<Object>} Resultado de la operación de eliminación.
   */
  eliminar: async (est_id) => {
    const query = 'DELETE FROM Estados WHERE est_id = ?';
    const [result] = await db.query(query, [est_id]);
    return result;
  }
};

module.exports = Estado;
