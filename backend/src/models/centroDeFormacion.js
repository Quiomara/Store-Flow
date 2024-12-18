const db = require('../config/db');

const CentroDeFormacion = {
  obtenerCentrosDeFormacion: (callback) => {
    const query = `SELECT cen_id AS id, cen_nombre AS nombre FROM Centros`;
    db.query(query, callback);
  }
};

module.exports = CentroDeFormacion;
