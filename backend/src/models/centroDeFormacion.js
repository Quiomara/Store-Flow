const db = require('../config/db');

const CentroDeFormacion = {
  obtenerCentrosDeFormacion: (callback) => {
    const query = `SELECT cen_id AS id, cen_nombre AS nombre FROM Centros`;
    db.query(query, callback);
  },
  
  obtenerCentroDeFormacionPorID: (id, callback) => {
    const query = `SELECT cen_id AS id, cen_nombre AS nombre FROM Centros WHERE cen_id = ?`;
    db.query(query, [id], callback);
  }
};

module.exports = CentroDeFormacion;
