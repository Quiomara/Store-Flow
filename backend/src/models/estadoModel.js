const db = require('../config/db');

const Estado = {
  // Obtener todos los estados
  obtenerTodos: async () => {
    const query = 'SELECT * FROM Estados'; // Asegúrate de que el nombre de la tabla es correcto
    const [results] = await db.query(query);
    return results;
  },

  // Obtener estado por ID
  obtenerPorId: async (est_id) => {
    const query = 'SELECT * FROM Estados WHERE est_id = ?';
    const [results] = await db.query(query, [est_id]);
    return results;
  },

  // Crear estado
  crear: async (data) => {
    const query = 'INSERT INTO Estados (est_nombre) VALUES (?)';
    const values = [data.est_nombre];
    const [result] = await db.query(query, values);
    return result;
  },

  // Actualizar estado
  actualizar: async (data) => {
    const query = 'UPDATE Estados SET est_nombre = ? WHERE est_id = ?';
    const values = [data.est_nombre, data.est_id];
    const [result] = await db.query(query, values);
    return result;
  },

  // Eliminar estado
  eliminar: async (est_id) => {
    const query = 'DELETE FROM Estados WHERE est_id = ?';
    const [result] = await db.query(query, [est_id]);
    return result;
  }
};

module.exports = Estado;