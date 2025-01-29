const db = require("../config/db");

const Prestamo = {

// Refactorización de Prestamo.crear para usar promesas
crear: (data) => {
  return new Promise((resolve, reject) => {
    // Validar campos obligatorios
    if (!data.pre_inicio || !data.usr_cedula || !data.est_id) {
      return reject(new Error("Faltan campos obligatorios: pre_inicio, usr_cedula o est_id."));
    }

    const query = `INSERT INTO Prestamos (pre_inicio, usr_cedula, est_id) VALUES (?, ?, ?)`;
    const values = [data.pre_inicio, data.usr_cedula, data.est_id];

    console.log("Ejecutando consulta SQL:", query, values);

    // Ejecutar la consulta
    db.query(query, values, (err, results) => {
      if (err) {
        console.error("Error en la consulta SQL:", err);
        return reject(err);
      }
      console.log("Resultado de la consulta SQL:", results);
      resolve({ insertId: results.insertId });
    });
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
        p.pre_fin, 
        u.usr_cedula, 
        CONCAT(u.usr_primer_nombre, ' ', u.usr_segundo_nombre, ' ', u.usr_primer_apellido, ' ', u.usr_segundo_apellido) AS usr_nombre, 
        e.est_nombre,
        p.pre_actualizacion,
        JSON_ARRAYAGG(  -- Agrupa los elementos en un array JSON
          JSON_OBJECT(
            'ele_id', el.ele_id,
            'ele_nombre', el.ele_nombre,
            'pre_ele_cantidad_prestado', pe.pre_ele_cantidad_prestado
          )
        ) AS elementos
      FROM Prestamos p
      JOIN Usuarios u ON p.usr_cedula = u.usr_cedula
      JOIN PrestamosElementos pe ON p.pre_id = pe.pre_id
      JOIN Elementos el ON pe.ele_id = el.ele_id
      JOIN Estados e ON p.est_id = e.est_id
      GROUP BY p.pre_id  -- Agrupa por préstamo para evitar duplicados
      ORDER BY p.pre_inicio DESC;  -- Ordena por fecha de inicio (más reciente primero)
    `;
  
    db.query(query, (err, results) => {
      if (err) {
        console.error('Error al ejecutar la consulta obtenerTodos:', err.stack); // Log de depuración detallado
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
        SELECT 
          p.pre_id, 
          p.pre_inicio, 
          p.pre_fin, 
          p.usr_cedula, 
          e.est_nombre, 
          p.pre_actualizacion
        FROM Prestamos p
        JOIN Estados e ON p.est_id = e.est_id
        WHERE p.usr_cedula = ?
        ORDER BY p.pre_inicio DESC;  -- Ordenar por fecha de inicio (más reciente primero)
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

  obtenerElementosPrestamo: (pre_id, callback) => {
    const query = `
      SELECT 
        p.pre_id, 
        p.est_id, 
        e.est_nombre AS estado, 
        pe.ele_id, 
        pe.pre_ele_cantidad_prestado, 
        el.ele_nombre AS nombre
      FROM 
        Prestamos p
      JOIN 
        Estados e ON p.est_id = e.est_id
      JOIN 
        PrestamosElementos pe ON p.pre_id = pe.pre_id
      JOIN 
        Elementos el ON pe.ele_id = el.ele_id
      WHERE 
        p.pre_id = ?;
    `;

    db.query(query, [pre_id], (err, results) => {
      if (err) {
        console.error('Error al obtener los elementos del préstamo:', err);
        return callback(err);
      }

      if (results.length === 0) {
        return callback(null, []);
      }

      callback(null, results);
    });
  },

  // Método para actualizar la cantidad prestada
  actualizarCantidadElemento: (pre_id, ele_id, pre_ele_cantidad_prestado, callback) => {
    const query = `UPDATE PrestamosElementos SET pre_ele_cantidad_prestado = ? WHERE pre_id = ? AND ele_id = ?`;
    db.query(query, [pre_ele_cantidad_prestado, pre_id, ele_id], callback);
  },
};

module.exports = Prestamo;