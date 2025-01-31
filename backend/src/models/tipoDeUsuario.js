const db = require('../config/db');

const TipoDeUsuario = {
  obtenerTiposDeUsuario: async () => {
    const query = `SELECT tip_usr_id AS id, tip_usr_nombre AS nombre FROM TipoUsuarios`;
    try {
      const [rows] = await db.query(query); // Ejecuta la consulta y obtiene los resultados
      return rows; // Devuelve los resultados
    } catch (error) {
      console.error('Error al obtener tipos de usuario:', error.stack);
      throw error; // Lanza el error para que sea manejado por el controlador
    }
  }
};

module.exports = TipoDeUsuario;