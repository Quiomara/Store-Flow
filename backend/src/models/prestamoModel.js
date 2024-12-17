const db = require('../config/db');

const Prestamo = {
  crear: (data, callback) => {
    const query = `INSERT INTO Prestamos (pre_inicio, pre_fin, usr_cedula, est_id) VALUES (?, ?, ?, ?)`;
    const values = [data.pre_inicio, data.pre_fin, data.usr_cedula, data.est_id];
    db.query(query, values, callback);
  },

  actualizar: (data, callback) => {
    const query = `UPDATE Prestamos SET pre_inicio = ?, pre_fin = ?, usr_cedula = ?, est_id = ?, pre_actualizacion = ? WHERE pre_id = ?`;
    const values = [data.pre_inicio, data.pre_fin, data.usr_cedula, data.est_id, data.pre_actualizacion, data.pre_id];
    db.query(query, values, callback);
  },

  eliminar: (pre_id, callback) => {
    const query = `DELETE FROM Prestamos WHERE pre_id = ?`;
    db.query(query, [pre_id], callback);
  },

  obtenerTodos: (callback) => {
    const query = `SELECT * FROM Prestamos`;
    db.query(query, callback);
  },

  obtenerPorId: (pre_id, callback) => {
    const query = `SELECT * FROM Prestamos WHERE pre_id = ?`;
    db.query(query, [pre_id], callback);
  },

  obtenerEstadoYUsuarioPorId: (pre_id, callback) => {
    const query = `SELECT est_id, usr_cedula FROM Prestamos WHERE pre_id = ?`;
    db.query(query, [pre_id], callback);
  }
};

module.exports = Prestamo;



