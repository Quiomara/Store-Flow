const db = require('../config/db');

const Estado = {
  /**
   * Obtiene todos los estados.
   * @returns {Promise<Array>} Lista de todos los estados.
   */
  obtenerTodos: async () => {
    const query = 'SELECT * FROM Estados';
    const [results] = await db.query(query);
    return results;
  },

  /**
   * Obtiene un estado por su ID.
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
