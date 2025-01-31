const db = require('../config/db');

const UbicacionElemento = {
  crear: async (data) => {
    const query = `INSERT INTO UbicacionElementos (ubi_nombre) VALUES (?)`;
    const [result] = await db.query(query, [data.ubi_nombre]);
    return result;
  },

  actualizar: async (data) => {
    const query = 'UPDATE UbicacionElementos SET ubi_nombre = ? WHERE ubi_ele_id = ?';
    const [result] = await db.query(query, [data.ubi_nombre, data.ubi_ele_id]);
    return result;
  },

  eliminar: async (ubi_ele_id) => {
    const query = `DELETE FROM UbicacionElementos WHERE ubi_ele_id = ?`;
    const [result] = await db.query(query, [ubi_ele_id]);
    return result;
  },

  obtenerTodos: async () => {
    const query = `SELECT * FROM UbicacionElementos`;
    const [rows] = await db.query(query);
    return rows;
  },

  obtenerPorId: async (ubi_ele_id) => {
    const query = `SELECT * FROM UbicacionElementos WHERE ubi_ele_id = ?`;
    const [rows] = await db.query(query, [ubi_ele_id]);
    return rows;
  }
};

module.exports = UbicacionElemento;