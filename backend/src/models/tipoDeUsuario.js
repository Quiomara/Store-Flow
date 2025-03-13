const db = require('../config/db');

/**
 * Módulo para gestionar operaciones relacionadas con los tipos de usuario.
 * @module TipoDeUsuario
 */
const TipoDeUsuario = {
  /**
   * Obtiene la lista de tipos de usuario desde la base de datos.
   *
   * Realiza una consulta a la tabla "TipoUsuarios" y devuelve una lista de objetos,
   * cada uno con las propiedades "id" y "nombre" correspondientes al ID y nombre del tipo de usuario.
   *
   * @async
   * @function obtenerTiposDeUsuario
   * @returns {Promise<Array<{id: number, nombre: string}>>} Lista de tipos de usuario con ID y nombre.
   * @throws {Error} Lanza un error si la consulta falla.
   */
  obtenerTiposDeUsuario: async () => {
    const query = `SELECT tip_usr_id AS id, tip_usr_nombre AS nombre FROM TipoUsuarios`;
    try {
      const [rows] = await db.query(query); // Ejecuta la consulta y obtiene los resultados
      return rows; // Devuelve los resultados
    } catch (error) {
      throw new Error('Error al obtener tipos de usuario: ' + error.message); // Lanza el error para que sea manejado por el controlador
    }
  }
};

module.exports = TipoDeUsuario;
