const db = require('../config/db');

const Elemento = {
  /**
   * Crea un nuevo elemento en la base de datos.
   * @param {Object} data - Datos del elemento a crear.
   * @throws {Error} Si el campo 'ele_nombre' no está presente.
   * @returns {Promise<Object>} Resultado de la inserción.
   */
  crear: async (data) => {
    if (!data.ele_nombre) {
      throw new Error("El campo 'ele_nombre' es obligatorio.");
    }
    const query = `
      INSERT INTO Elementos (ele_nombre, ele_cantidad_total, ele_cantidad_actual, ele_imagen, ubi_ele_id)
      VALUES (?, ?, ?, ?, ?)
    `;
    const values = [
      data.ele_nombre,
      data.ele_cantidad_total,
      data.ele_cantidad_actual || data.ele_cantidad_total,
      data.ele_imagen,
      data.ubi_ele_id
    ];
    const [result] = await db.query(query, values);
    return result;
  },

  /**
   * Actualiza un elemento existente en la base de datos.
   * @param {Object} data - Datos del elemento a actualizar.
   * @returns {Promise<Object>} Resultado de la actualización.
   */
  actualizar: async (data) => {
    const query = `
      UPDATE Elementos
      SET ele_nombre = ?, ele_cantidad_total = ?, ele_cantidad_actual = ?, ele_imagen = ?, ubi_ele_id = ?
      WHERE ele_id = ?
    `;
    const values = [
      data.ele_nombre,
      data.ele_cantidad_total,
      data.ele_cantidad_actual,
      data.ele_imagen,
      data.ubi_ele_id,
      data.ele_id
    ];
    const [result] = await db.query(query, values);
    return result;
  },

  /**
   * Actualiza el stock de un elemento.
   * @param {number} ele_id - ID del elemento a actualizar.
   * @param {number} cantidad - Cantidad a modificar en el stock.
   * @throws {Error} Si el elemento no existe.
   * @returns {Promise<Object>} Resultado de la actualización.
   */
  actualizarStock: async (ele_id, cantidad) => {
    const query = `UPDATE Elementos SET ele_cantidad_actual = ele_cantidad_actual + ? WHERE ele_id = ?`;
    const [result] = await db.query(query, [cantidad, ele_id]);
    if (result.affectedRows === 0) {
      throw new Error('No se encontró el elemento con el ID proporcionado.');
    }
    return result;
  },

  /**
   * Elimina un elemento de la base de datos.
   * @param {number} ele_id - ID del elemento a eliminar.
   * @returns {Promise<Object>} Resultado de la eliminación.
   */
  eliminar: async (ele_id) => {
    const query = `DELETE FROM Elementos WHERE ele_id = ?`;
    const [result] = await db.query(query, [ele_id]);
    return result;
  },

  /**
   * Obtiene todos los elementos con su ubicación.
   * @returns {Promise<Array>} Lista de elementos.
   */
  obtenerTodos: async () => {
    const query = `
      SELECT e.ele_id, e.ele_nombre, e.ele_cantidad_total, e.ele_cantidad_actual, e.ele_imagen, e.ubi_ele_id, u.ubi_nombre
      FROM Elementos e
      JOIN UbicacionElementos u ON e.ubi_ele_id = u.ubi_ele_id
    `;
    const [results] = await db.query(query);
    return results;
  },

  /**
   * Obtiene un elemento por su ID.
   * @param {number} ele_id - ID del elemento a obtener.
   * @returns {Promise<Object|null>} Elemento encontrado o null si no existe.
   */
  obtenerPorId: async (ele_id) => {
    const query = `
      SELECT e.ele_id, e.ele_nombre, e.ele_cantidad_total, e.ele_cantidad_actual, e.ele_imagen, e.ubi_ele_id, u.ubi_nombre
      FROM Elementos e
      JOIN UbicacionElementos u ON e.ubi_ele_id = u.ubi_ele_id
      WHERE e.ele_id = ?
    `;
    const [results] = await db.query(query, [ele_id]);
    return results[0] || null;
  },
};

module.exports = Elemento;