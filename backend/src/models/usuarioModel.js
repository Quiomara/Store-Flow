// Para la interacción con la base de datos para las operaciones CRUD de usuarios.
const db = require('../config/db');

const Usuario = {
  crear: (data, callback) => {
    const query = `INSERT INTO Usuarios (usr_cedula, usr_primer_nombre, usr_segundo_nombre, usr_primer_apellido, usr_segundo_apellido, usr_correo, usr_contrasena, usr_telefono, tip_usr_id, cen_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    db.query(query, [data.usr_cedula, data.usr_primer_nombre, data.usr_segundo_nombre, data.usr_primer_apellido, data.usr_segundo_apellido, data.usr_correo, data.usr_contrasena, data.usr_telefono, data.tip_usr_id, data.cen_id], callback);
  },
  
  actualizar: (data, callback) => {
    const query = `UPDATE Usuarios SET usr_primer_nombre = ?, usr_segundo_nombre = ?, usr_primer_apellido = ?, usr_segundo_apellido = ?, usr_correo = ?, usr_contrasena = ?, usr_telefono = ?, tip_usr_id = ?, cen_id = ? WHERE usr_cedula = ?`;
    db.query(query, [data.usr_primer_nombre, data.usr_segundo_nombre, data.usr_primer_apellido, data.usr_segundo_apellido, data.usr_correo, data.usr_contrasena, data.usr_telefono, data.tip_usr_id, data.cen_id, data.usr_cedula], callback);
  },

  buscarPorId: (usr_cedula, callback) => {
    const query = `SELECT * FROM Usuarios WHERE usr_cedula = ?`;
    db.query(query, [usr_cedula], callback);
  },
  
  eliminar: (usr_cedula, callback) => {
    const query = `DELETE FROM Usuarios WHERE usr_cedula = ?`;
    db.query(query, [usr_cedula], callback);
  },

  buscarTodos: (callback) => {
    const query = `SELECT * FROM Usuarios`;
    db.query(query, callback);
  },

  buscarPorTipo: (tip_usr_id, callback) => {
    const query = `SELECT * FROM Usuarios WHERE tip_usr_id = ?`;
    db.query(query, [tip_usr_id], callback);
  }
};

module.exports = Usuario;

