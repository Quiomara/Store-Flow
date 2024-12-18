const db = require('../config/db');

const TipoDeUsuario = {
  obtenerTiposDeUsuario: (callback) => {
    const query = `SELECT tip_usr_id AS id, tip_usr_nombre AS nombre FROM TipoUsuarios`;
    db.query(query, callback);
  }
};

module.exports = TipoDeUsuario;
