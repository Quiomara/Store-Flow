const db = require('../config/db');

/**
 * Módulo para gestionar operaciones CRUD sobre ubicaciones de elementos.
 * @module UbicacionElemento
 */
const UbicacionElemento = {
  /**
   * Crea una nueva ubicación de elemento en la base de datos.
   *
   * Inserta un nuevo registro en la tabla "UbicacionElementos" utilizando el nombre proporcionado.
   *
   * @async
   * @function crear
   * @param {Object} data - Datos de la ubicación.
   * @param {string} data.ubi_nombre - Nombre de la ubicación.
   * @returns {Promise<Object>} Resultado de la inserción.
   */
  crear: async (data) => {
    const query = `INSERT INTO UbicacionElementos (ubi_nombre) VALUES (?)`;
    const [result] = await db.query(query, [data.ubi_nombre]);
    return result;
  },

  /**
   * Actualiza el nombre de una ubicación de elemento existente.
   *
   * Modifica el nombre de la ubicación en la tabla "UbicacionElementos" identificada por su ID.
   *
   * @async
   * @function actualizar
   * @param {Object} data - Datos de la ubicación a actualizar.
   * @param {string} data.ubi_nombre - Nuevo nombre de la ubicación.
   * @param {number} data.ubi_ele_id - ID de la ubicación a actualizar.
   * @returns {Promise<Object>} Resultado de la actualización.
   */
  actualizar: async (data) => {
    const query = 'UPDATE UbicacionElementos SET ubi_nombre = ? WHERE ubi_ele_id = ?';
    const [result] = await db.query(query, [data.ubi_nombre, data.ubi_ele_id]);
    return result;
  },

  /**
   * Elimina una ubicación de elemento por su ID.
   *
   * Borra el registro de la tabla "UbicacionElementos" que coincide con el ID proporcionado.
   *
   * @async
   * @function eliminar
   * @param {number} ubi_ele_id - ID de la ubicación a eliminar.
   * @returns {Promise<Object>} Resultado de la eliminación.
   */
  eliminar: async (ubi_ele_id) => {
    const query = `DELETE FROM UbicacionElementos WHERE ubi_ele_id = ?`;
    const [result] = await db.query(query, [ubi_ele_id]);
    return result;
  },

  /**
   * Obtiene todas las ubicaciones de elementos almacenadas en la base de datos.
   *
   * Realiza una consulta a la tabla "UbicacionElementos" y devuelve la lista completa de ubicaciones.
   *
   * @async
   * @function obtenerTodos
   * @returns {Promise<Array>} Lista de ubicaciones de elementos.
   */
  obtenerTodos: async () => {
    const query = `SELECT * FROM UbicacionElementos`;
    const [rows] = await db.query(query);
    return rows;
  },

  /**
   * Obtiene una ubicación de elemento por su ID.
   *
   * Realiza una consulta a la tabla "UbicacionElementos" para encontrar la ubicación que coincide con el ID proporcionado.
   *
   * @async
   * @function obtenerPorId
   * @param {number} ubi_ele_id - ID de la ubicación a buscar.
   * @returns {Promise<Array>} Resultado de la búsqueda.
   */
  obtenerPorId: async (ubi_ele_id) => {
    const query = `SELECT * FROM UbicacionElementos WHERE ubi_ele_id = ?`;
    const [rows] = await db.query(query, [ubi_ele_id]);
    return rows;
  }
};

module.exports = UbicacionElemento;
