const db = require('../config/db');

const Elemento = {
  crear: (data, callback) => {
    const query = `INSERT INTO Elementos (ele_nombre, ele_cantidad, ele_imagen, ubi_ele_id) VALUES (?, ?, ?, ?)`;
    const values = [data.ele_nombre, data.ele_cantidad, data.ele_imagen, data.ubi_ele_id];
    db.query(query, values, callback);
  },

  actualizar: (data, callback) => {
    const query = `UPDATE Elementos SET ele_nombre = ?, ele_cantidad = ?, ele_imagen = ?, ubi_ele_id = ? WHERE ele_id = ?`;
    const values = [data.ele_nombre, data.ele_cantidad, data.ele_imagen, data.ubi_ele_id, data.ele_id];
    db.query(query, values, callback);
  },

  eliminar: (ele_id, callback) => {
    const query = `DELETE FROM Elementos WHERE ele_id = ?`;
    db.query(query, [ele_id], callback);
  },

  obtenerTodos: (callback) => {
    const query = `SELECT * FROM Elementos`;
    db.query(query, callback);
  },

  obtenerPorId: (ele_id, callback) => {
    const query = `SELECT * FROM Elementos WHERE ele_id = ?`;
    db.query(query, [ele_id], callback);
  }
};

module.exports = Elemento;
