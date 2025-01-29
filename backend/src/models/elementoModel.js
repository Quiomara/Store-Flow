const db = require('../config/db');

const Elemento = {
  // Crear un nuevo elemento
  crear: (data) => {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO Elementos (ele_nombre, ele_cantidad_total, ele_cantidad_actual, ele_imagen, ubi_ele_id)
        VALUES (?, ?, ?, ?, ?)
      `;
      const values = [
        data.ele_nombre,
        data.ele_cantidad_total,
        data.ele_cantidad_actual || data.ele_cantidad_total,
        data.ele_imagen,
        data.ubi_ele_id
      ];
      db.query(query, values, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  // Actualizar un elemento
  actualizar: (data) => {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE Elementos
        SET ele_nombre = ?, ele_cantidad_total = ?, ele_cantidad_actual = ?, ele_imagen = ?, ubi_ele_id = ?
        WHERE ele_id = ?
      `;
      const values = [
        data.ele_nombre,
        data.ele_cantidad_total,
        data.ele_cantidad_actual,
        data.ele_imagen,
        data.ubi_ele_id,
        data.ele_id
      ];
      db.query(query, values, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  // Actualizar el stock (cantidad actual)
  actualizarStock: (ele_id, ele_cantidad_actual) => {
    return new Promise((resolve, reject) => {
      // Validar que ele_id y ele_cantidad_actual sean valores válidos
      if (typeof ele_id !== 'number' || typeof ele_cantidad_actual !== 'number') {
        return reject(new Error('Los parámetros ele_id y ele_cantidad_actual deben ser números.'));
      }
  
      const query = `
        UPDATE Elementos
        SET ele_cantidad_actual = ?
        WHERE ele_id = ?
      `;
  
      // Ejecutar la consulta
      db.query(query, [ele_cantidad_actual, ele_id], (err, results) => {
        if (err) {
          console.error('Error al ejecutar la consulta:', err);
          return reject(err);
        }
  
        // Verificar si se actualizó algún registro
        if (results.affectedRows === 0) {
          return reject(new Error('No se encontró el elemento con el ID proporcionado.'));
        }
  
        // Resolver con los resultados de la consulta
        resolve(results);
      });
    });
  },
  
  // Eliminar un elemento
  eliminar: (ele_id) => {
    return new Promise((resolve, reject) => {
      const query = `DELETE FROM Elementos WHERE ele_id = ?`;
      db.query(query, [ele_id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  // Obtener todos los elementos
  obtenerTodos: () => {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM Elementos`;
      db.query(query, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  // Obtener un elemento por su ID
  obtenerPorId: (ele_id) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT ele_id, ele_nombre, ele_cantidad_total, ele_cantidad_actual, ele_imagen, ubi_ele_id
        FROM Elementos
        WHERE ele_id = ?
      `;
      db.query(query, [ele_id], (err, results) => {
        if (err) return reject(err);
        resolve(results[0]);
      });
    });
  },
};

module.exports = Elemento;