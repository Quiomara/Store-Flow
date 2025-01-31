const db = require('../config/db');

const CentroDeFormacion = {
  // Obtener todos los centros de formación
  obtenerCentrosDeFormacion: async () => {
    try {
      console.log('Ejecutando consulta: SELECT * FROM Centros');
      const [resultados] = await db.query('SELECT * FROM Centros');
      console.log('Resultados de la consulta:', resultados); // Agrega este log
      if (resultados.length === 0) {
        console.log('No se encontraron centros de formación.');
      }
      return resultados;
    } catch (error) {
      console.error('Error en la consulta:', error.stack);
      throw error;
    }
  },

  // Obtener un centro de formación por ID
  obtenerCentroDeFormacionPorID: async (id) => {
    try {
      console.log(`Ejecutando consulta: SELECT * FROM Centros WHERE cen_id = ${id}`);
      const [resultado] = await db.query('SELECT * FROM Centros WHERE cen_id = ?', [id]);
      console.log('Resultado de la consulta:', resultado); // Agrega este log
      if (resultado.length === 0) {
        console.log('Centro de formación no encontrado.');
        throw new Error('Centro de formación no encontrado.');
      }
      return resultado[0];
    } catch (error) {
      console.error('Error en la consulta:', error.stack);
      throw error;
    }
  },
};

module.exports = CentroDeFormacion;