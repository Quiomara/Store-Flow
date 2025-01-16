const db = require('../config/db');

const Estado = {
  obtenerTodos: (callback) => {
    const query = 'SELECT * FROM Estados';
    db.query(query, callback);
  },

  obtenerPorId: (est_id, callback) => {
    const query = 'SELECT * FROM Estados WHERE est_id = ?';
    db.query(query, [est_id], callback);
  },

  crear: (data, callback) => {
    const query = 'INSERT INTO Estados (est_nombre) VALUES (?)';
    const values = [data.est_nombre];
    db.query(query, values, callback);
  },

  actualizar: (data, callback) => {
    const query = 'UPDATE Estados SET est_nombre = ? WHERE est_id = ?';
    const values = [data.est_nombre, data.est_id];
    db.query(query, values, callback);
  },

  eliminar: (est_id, callback) => {
    const query = 'DELETE FROM Estados WHERE est_id = ?';
    db.query(query, [est_id], callback);
  }
};

module.exports = Estado;
