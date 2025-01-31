const db = require('../config/db');

const PrestamoElemento = {
  crear: async (data) => {
    const query = `INSERT INTO prestamoselementos (ele_id, pre_id, pre_ele_cantidad_prestado) VALUES (?, ?, ?)`;
    const values = [data.ele_id, data.pre_id, data.pre_ele_cantidad_prestado];

    console.log("Intentando insertar en prestamoselementos:", { query, values });

    try {
      const [results] = await db.query(query, values);
      console.log("Inserción exitosa en prestamoselementos:", results);
      return results;
    } catch (err) {
      console.error("Error en la inserción en prestamoselementos:", err);
      throw err;
    }
  },

  // Método para actualizar la cantidad prestada
  actualizarCantidadElemento: async (pre_id, ele_id, cantidad) => {
    const query = `UPDATE PrestamosElementos SET pre_ele_cantidad_prestado = ? WHERE pre_id = ? AND ele_id = ?`;
    try {
      const [results] = await db.query(query, [cantidad, pre_id, ele_id]);
      return results;
    } catch (err) {
      console.error("Error al actualizar la cantidad del elemento:", err);
      throw err;
    }
  },

  eliminar: async (pre_ele_id) => {
    const query = `DELETE FROM prestamoselementos WHERE pre_ele_id = ?`;
    try {
      const [results] = await db.query(query, [pre_ele_id]);
      return results;
    } catch (err) {
      console.error("Error al eliminar el préstamo de elemento:", err);
      throw err;
    }
  },

  eliminarPorPrestamoId: async (pre_id) => {
    const query = `DELETE FROM prestamoselementos WHERE pre_id = ?`;
    try {
      const [results] = await db.query(query, [pre_id]);
      return results;
    } catch (err) {
      console.error("Error al eliminar los préstamos de elementos por pre_id:", err);
      throw err;
    }
  },

  obtenerTodos: async () => {
    const query = `SELECT * FROM prestamoselementos`;
    try {
      const [rows] = await db.query(query);
      return rows;
    } catch (err) {
      console.error("Error al obtener todos los préstamos de elementos:", err);
      throw err;
    }
  },

  obtenerPorId: async (pre_ele_id) => {
    const query = `SELECT * FROM prestamoselementos WHERE pre_ele_id = ?`;
    try {
      const [rows] = await db.query(query, [pre_ele_id]);
      return rows;
    } catch (err) {
      console.error("Error al obtener el préstamo de elemento por ID:", err);
      throw err;
    }
  },

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
    try {
      const [rows] = await db.query(query, [pre_id]);
      return rows;
    } catch (err) {
      console.error("Error al obtener los préstamos de elementos por pre_id:", err);
      throw err;
    }
  }
};

module.exports = PrestamoElemento;