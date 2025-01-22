const db = require('../config/db');

const PrestamoElemento = {
  crear: (data, callback) => {
    const query = `INSERT INTO prestamoselementos (ele_id, pre_id, pre_ele_cantidad_prestado) VALUES (?, ?, ?)`;
    const values = [data.ele_id, data.pre_id, data.pre_ele_cantidad_prestado];
    console.log('Intentando insertar en prestamoselementos:', { query, values });
    db.query(query, values, (err, results) => {
      if (err) {
        console.error('Error al insertar en prestamoselementos:', err.stack);
      } else {
        console.log('Inserción exitosa en prestamoselementos:', results);
      }
      callback(err, results);
    });
  },

  actualizar: (data, callback) => {
    const query = `UPDATE prestamoselementos SET ele_id = ?, pre_id = ?, pre_ele_cantidad_prestado = ? WHERE pre_ele_id = ?`;
    const values = [data.ele_id, data.pre_id, data.pre_ele_cantidad_prestado, data.pre_ele_id];
    db.query(query, values, callback);
  },

  eliminar: (pre_ele_id, callback) => {
    const query = `DELETE FROM prestamoselementos WHERE pre_ele_id = ?`;
    db.query(query, [pre_ele_id], callback);
  },

  eliminarPorPrestamoId: (pre_id, callback) => {
    const query = `DELETE FROM prestamoselementos WHERE pre_id = ?`;
    db.query(query, [pre_id], callback);
  },

  obtenerTodos: (callback) => {
    const query = `SELECT * FROM prestamoselementos`;
    db.query(query, callback);
  },

  obtenerPorId: (pre_ele_id, callback) => {
    const query = `SELECT * FROM prestamoselementos WHERE pre_ele_id = ?`;
    db.query(query, [pre_ele_id], callback);
  },

  obtenerPorPrestamoId: (pre_id) => {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM prestamoselementos WHERE pre_id = ?`;
      db.query(query, [pre_id], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }
};

module.exports = PrestamoElemento;
