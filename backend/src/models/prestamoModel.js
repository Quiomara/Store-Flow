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
      callback(null, { insertId: results.insertId }); 
    });
  },

  actualizar: (data, callback) => {
    const query = `UPDATE Prestamos SET pre_fin = ?, usr_cedula = ?, est_id = ?, pre_actualizacion = ? WHERE pre_id = ?`;
    const values = [
      data.pre_fin, 
      data.usr_cedula,
      data.est_id,
      data.pre_actualizacion,
      data.pre_id,
    ];
    db.query(query, values, callback);
  },

  actualizarCantidad: (ele_id, ele_cantidad, callback) => {
    const query = `UPDATE Elementos SET ele_cantidad = ? WHERE ele_id = ?`;
    const values = [
      ele_cantidad,
      ele_id,
    ];
    db.query(query, values, callback);
  },

  eliminar: (pre_id, callback) => {
    const query = `DELETE FROM Prestamos WHERE pre_id = ?`;
    db.query(query, [pre_id], callback);
  },

  obtenerTodos: (callback) => {
    const query = `
      SELECT 
        p.pre_id, 
        p.pre_inicio, 
        u.usr_cedula, 
        CONCAT(u.usr_primer_nombre, ' ', u.usr_segundo_nombre, ' ', u.usr_primer_apellido, ' ', u.usr_segundo_apellido) AS usr_nombre, 
        el.ele_id, 
        el.ele_nombre, 
        pe.pre_ele_cantidad_prestado,
        e.est_nombre,
        p.pre_actualizacion
      FROM Prestamos p
      JOIN Usuarios u ON p.usr_cedula = u.usr_cedula
      JOIN PrestamosElementos pe ON p.pre_id = pe.pre_id
      JOIN Elementos el ON pe.ele_id = el.ele_id
      JOIN Estados e ON p.est_id = e.est_id;
    `;
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error al ejecutar la consulta obtenerTodos:', err); // Log de depuración
        return callback(err);
      }
      console.log('Resultados obtenidos:', results); // Log de depuración
      callback(null, results);
    });
  },

  obtenerPorId: (pre_id, callback) => {
      const query = `SELECT p.pre_id, p.est_id, e.est_nombre 
                     FROM Prestamos p 
                     JOIN Estados e ON p.est_id = e.est_id 
                     WHERE p.pre_id = ?`;
      db.query(query, [pre_id], (err, results) => {
        if (err) {
          console.error('Error al obtener el préstamo:', err);
          return callback(err);
        }
  
        const prestamo = results[0];
  
        if (!prestamo) {
          return callback(null, []);
        }
  
        callback(null, [prestamo]);
      });
    },

    obtenerPorCedula: (usr_cedula, callback) => {
      const query = `
        SELECT p.pre_id, p.pre_inicio, p.pre_fin, p.usr_cedula, e.est_nombre, p.pre_actualizacion
        FROM Prestamos p
        JOIN Estados e ON p.est_id = e.est_id
        WHERE p.usr_cedula = ?;
      `;
      db.query(query, [usr_cedula], (err, results) => {
        if (err) {
          console.error('Error al obtener los préstamos por cédula:', err);
          return callback(err);
        }
        callback(null, results);
      });
    },

  obtenerEstadoYUsuarioPorId: (pre_id, callback) => {
    const query = `SELECT pre_inicio, pre_fin, est_id, usr_cedula FROM Prestamos WHERE pre_id = ?`;
    db.query(query, [pre_id], callback);
  },
};

module.exports = Prestamo;
