const db = require("../config/db");

const Prestamo = {
  crear: (data, callback) => {
    const query = `INSERT INTO Prestamos (pre_inicio, pre_fin, usr_cedula, est_id) VALUES (?, ?, ?, ?)`;
    const values = [
      data.pre_inicio,
      data.pre_fin,
      data.usr_cedula,
      data.est_id,
    ];
    db.query(query, values, (err, results) => {
      if (err) return callback(err);
      callback(null, { insertId: results.insertId }); // Asegura que devuelva el insertId correctamente
    });
  },

  actualizar: (data, callback) => {
    const query = `UPDATE Prestamos SET pre_inicio = ?, pre_fin = ?, usr_cedula = ?, est_id = ?, pre_actualizacion = ? WHERE pre_id = ?`;
    const values = [
      data.pre_inicio,
      data.pre_fin,
      data.usr_cedula,
      data.est_id,
      data.pre_actualizacion,
      data.pre_id,
    ];
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

  obtenerPorId : (pre_id, callback) => {
    const query = `SELECT p.pre_id, p.est_id, e.est_nombre 
                   FROM Prestamos p 
                   JOIN Estados e ON p.est_id = e.est_id 
                   WHERE pre_id = ?`;
    console.log("Ejecutando consulta:", query, "con ID:", pre_id);
    db.query(query, [pre_id], (err, results) => {
      if (err) {
        console.log("Error en obtenerPorId:", err);
        return callback(err);
      }
      console.log("Resultados de obtenerPorId:", results);
      callback(null, results);
    });
  },
  
  
  obtenerPorCedula: (usr_cedula, callback) => {
    const query = `
      SELECT p.pre_id, p.pre_inicio, p.pre_fin, p.usr_cedula, e.est_nombre, p.pre_actualizacion
      FROM Prestamos p
      JOIN Estados e ON p.est_id = e.est_id
      WHERE p.usr_cedula = ?
    `;
    db.query(query, [usr_cedula], callback);
  },
};

module.exports = Prestamo;
