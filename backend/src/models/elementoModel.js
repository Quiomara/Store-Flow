const db = require('../config/db');

/**
 * Módulo para gestionar operaciones sobre Elementos.
 * @module Elemento
 */
const Elemento = {
  /**
   * Crea un nuevo elemento en la base de datos.
   *
   * Inserta un nuevo registro en la tabla "Elementos" utilizando los datos proporcionados.
   * Si no se incluye el campo `ele_nombre`, se lanza un error.
   *
   * @async
   * @function crear
   * @param {Object} data - Datos del elemento a crear.
   * @param {string} data.ele_nombre - Nombre del elemento.
   * @param {number} data.ele_cantidad_total - Cantidad total del elemento.
   * @param {number} [data.ele_cantidad_actual] - Cantidad actual del elemento; si no se proporciona, se utiliza `ele_cantidad_total`.
   * @param {string} data.ele_imagen - Ruta o URL de la imagen del elemento.
   * @param {number} data.ubi_ele_id - ID de la ubicación del elemento.
   * @returns {Promise<Object>} Resultado de la inserción en la base de datos.
   * @throws {Error} Si el campo 'ele_nombre' no está presente.
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
   *
   * Modifica los datos del elemento identificado por `ele_id` con la nueva información proporcionada.
   *
   * @async
   * @function actualizar
   * @param {Object} data - Datos del elemento a actualizar.
   * @param {string} data.ele_nombre - Nuevo nombre del elemento.
   * @param {number} data.ele_cantidad_total - Nueva cantidad total del elemento.
   * @param {number} data.ele_cantidad_actual - Nueva cantidad actual del elemento.
   * @param {string} data.ele_imagen - Nueva ruta o URL de la imagen del elemento.
   * @param {number} data.ubi_ele_id - Nuevo ID de la ubicación del elemento.
   * @param {number} data.ele_id - ID del elemento a actualizar.
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
   *
   * Incrementa o decrementa la cantidad actual del elemento en la base de datos.
   *
   * @async
   * @function actualizarStock
   * @param {number} ele_id - ID del elemento a actualizar.
   * @param {number} cantidad - Cantidad a modificar en el stock.
   *   Una cantidad positiva incrementa el stock; una cantidad negativa lo reduce.
   * @returns {Promise<Object>} Resultado de la actualización.
   * @throws {Error} Si no se encuentra el elemento con el ID proporcionado.
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
   *
   * Borra el registro de la tabla "Elementos" correspondiente al ID proporcionado.
   *
   * @async
   * @function eliminar
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
   *
   * Realiza una consulta que une la tabla "Elementos" con la tabla "UbicacionElementos"
   * para obtener detalles de cada elemento y su ubicación.
   *
   * @async
   * @function obtenerTodos
   * @returns {Promise<Array>} Lista de elementos con información de su ubicación.
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
   *
   * Realiza una consulta que une la tabla "Elementos" con la tabla "UbicacionElementos"
   * para obtener los detalles de un elemento específico identificado por su ID.
   *
   * @async
   * @function obtenerPorId
   * @param {number} ele_id - ID del elemento a obtener.
   * @returns {Promise<Object|null>} Objeto con los datos del elemento si se encuentra; de lo contrario, null.
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
