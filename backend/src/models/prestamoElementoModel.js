const db = require('../config/db');

const PrestamoElemento = {
  crear: (data, callback) => {
    const query = `INSERT INTO PrestamosElementos (ele_id, pre_id, pre_ele_cantidad_prestado) VALUES (?, ?, ?)`;
    const values = [data.ele_id, data.pre_id, data.pre_ele_cantidad_prestado];
    console.log('Intentando insertar en PrestamosElementos:', { query, values });
    db.query(query, values, (err, results) => {
      if (err) {
        console.error('Error al insertar en PrestamosElementos:', err.stack);
      } else {
        console.log('Inserción exitosa en PrestamosElementos:', results);
      }
      callback(err, results);
    });
  },

  actualizar: (data, callback) => {
    const query = `UPDATE PrestamosElementos SET ele_id = ?, pre_id = ?, pre_ele_cantidad_prestado = ? WHERE pre_ele_id = ?`;
    const values = [data.ele_id, data.pre_id, data.pre_ele_cantidad_prestado, data.pre_ele_id];
    db.query(query, values, callback);
  },

  eliminar: (pre_ele_id, callback) => {
    const query = `DELETE FROM PrestamosElementos WHERE pre_ele_id = ?`;
    db.query(query, [pre_ele_id], callback);
  },

  obtenerTodos: (callback) => {
    const query = `SELECT * FROM PrestamosElementos`;
    db.query(query, callback);
  },

  obtenerPorId: (pre_ele_id, callback) => {
    const query = `SELECT * FROM PrestamosElementos WHERE pre_ele_id = ?`;
    db.query(query, [pre_ele_id], callback);
  }
};

module.exports = PrestamoElemento;
