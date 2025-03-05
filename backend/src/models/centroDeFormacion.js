const db = require('../config/db');

const CentroDeFormacion = {
  /**
   * Obtiene todos los centros de formación.
   * @returns {Promise<Array>} Lista de centros de formación.
   * @throws {Error} Si ocurre un error en la consulta a la base de datos.
   */
  obtenerCentrosDeFormacion: async () => {
    try {
      const [resultados] = await db.query('SELECT * FROM Centros');
      return resultados;
    } catch (error) {
      throw new Error(`Error al obtener centros de formación: ${error.message}`);
    }
  },

  /**
   * Obtiene un centro de formación por su ID.
   * @param {number} id - ID del centro de formación.
   * @returns {Promise<Object>} Datos del centro de formación.
   * @throws {Error} Si no se encuentra el centro o hay un error en la consulta.
   */
  obtenerCentroDeFormacionPorID: async (id) => {
    try {
      const [resultado] = await db.query('SELECT * FROM Centros WHERE cen_id = ?', [id]);
      if (resultado.length === 0) {
        throw new Error('Centro de formación no encontrado.');
      }
      return resultado[0];
    } catch (error) {
      throw new Error(`Error al obtener centro de formación: ${error.message}`);
    }
  },
};

module.exports = CentroDeFormacion;
