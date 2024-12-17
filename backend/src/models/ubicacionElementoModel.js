const db = require('../config/db');

const UbicacionElemento = {
  crear: (data, callback) => {
    const query = `INSERT INTO UbicacionElementos (ubi_nombre) VALUES (?)`;
    db.query(query, [data.ubi_nombre], callback);
  },

  actualizar: (data, callback) => {
    const query = `UPDATE UbicacionElementos SET ubi_nombre = ? WHERE ubi_ele_id = ?`;
    db.query(query, [data.ubi_nombre, data.ubi_ele_id], callback);
  },

  eliminar: (ubi_ele_id, callback) => {
    const query = `DELETE FROM UbicacionElementos WHERE ubi_ele_id = ?`;
    db.query(query, [ubi_ele_id], callback);
  },

  obtenerTodos: (callback) => {
    const query = `SELECT * FROM UbicacionElementos`;
    db.query(query, callback);
  },

  obtenerPorId: (ubi_ele_id, callback) => {
    const query = `SELECT * FROM UbicacionElementos WHERE ubi_ele_id = ?`;
    db.query(query, [ubi_ele_id], callback);
  }
};

module.exports = UbicacionElemento;
