const db = require('../config/db');

const PrestamoElemento = {
  /**
   * Crea un nuevo préstamo de elemento en la base de datos.
   * @param {Object} data - Datos del préstamo.
   * @param {number} data.ele_id - ID del elemento prestado.
   * @param {number} data.pre_id - ID del préstamo.
   * @param {number} data.pre_ele_cantidad_prestado - Cantidad de elementos prestados.
   * @returns {Promise<Object>} Resultado de la inserción.
   */
  crear: async (data) => {
    const query = `INSERT INTO prestamoselementos (ele_id, pre_id, pre_ele_cantidad_prestado) VALUES (?, ?, ?)`;
    const values = [data.ele_id, data.pre_id, data.pre_ele_cantidad_prestado];
    const [results] = await db.query(query, values);
    return results;
  },

  /**
   * Actualiza la cantidad prestada de un elemento en un préstamo.
   * @param {number} pre_id - ID del préstamo.
   * @param {number} ele_id - ID del elemento.
   * @param {number} cantidad - Nueva cantidad prestada.
   * @returns {Promise<Object>} Resultado de la actualización.
   */
  actualizarCantidadElemento: async (pre_id, ele_id, cantidad) => {
    const query = `UPDATE PrestamosElementos SET pre_ele_cantidad_prestado = ? WHERE pre_id = ? AND ele_id = ?`;
    const [results] = await db.query(query, [cantidad, pre_id, ele_id]);
    return results;
  },

  /**
   * Elimina un préstamo de elemento por su ID.
   * @param {number} pre_ele_id - ID del préstamo de elemento a eliminar.
   * @returns {Promise<Object>} Resultado de la eliminación.
   */
  eliminar: async (pre_ele_id) => {
    const query = `DELETE FROM prestamoselementos WHERE pre_ele_id = ?`;
    const [results] = await db.query(query, [pre_ele_id]);
    return results;
  },

  /**
   * Elimina todos los préstamos de elementos asociados a un préstamo.
   * @param {number} pre_id - ID del préstamo.
   * @returns {Promise<Object>} Resultado de la eliminación.
   */
  eliminarPorPrestamoId: async (pre_id) => {
    const query = `DELETE FROM prestamoselementos WHERE pre_id = ?`;
    const [results] = await db.query(query, [pre_id]);
    return results;
  },

  /**
   * Obtiene todos los préstamos de elementos.
   * @returns {Promise<Array>} Lista de todos los préstamos de elementos.
   */
  obtenerTodos: async () => {
    const query = `SELECT * FROM prestamoselementos`;
    const [rows] = await db.query(query);
    return rows;
  },

  /**
   * Obtiene un préstamo de elemento por su ID.
   * @param {number} pre_ele_id - ID del préstamo de elemento.
   * @returns {Promise<Object|null>} Datos del préstamo de elemento o null si no existe.
   */
  obtenerPorId: async (pre_ele_id) => {
    const query = `SELECT * FROM prestamoselementos WHERE pre_ele_id = ?`;
    const [rows] = await db.query(query, [pre_ele_id]);
    return rows[0] || null;
  },

  /**
   * Obtiene todos los elementos prestados en un préstamo específico.
   * @param {number} pre_id - ID del préstamo.
   * @returns {Promise<Array>} Lista de elementos prestados en el préstamo.
   */
  obtenerPorPrestamoId: async (pre_id) => {
    const query = `
      SELECT 
        pe.pre_id, 
        pe.ele_id, 
        pe.pre_ele_cantidad_prestado, 
        ele.ele_nombre AS nombre
      FROM 
        prestamoselementos pe
      JOIN 
        Elementos ele ON pe.ele_id = ele.ele_id
      WHERE 
        pe.pre_id = ?
    `;
    const [rows] = await db.query(query, [pre_id]);
    return rows;
  }
};

module.exports = PrestamoElemento;
