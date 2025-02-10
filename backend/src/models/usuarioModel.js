const db = require('../config/db');

const Usuario = {
  buscarPorId: async (usr_cedula) => {
    const query = `
      SELECT U.*, C.cen_nombre, T.tip_usr_nombre
      FROM Usuarios U
      JOIN Centros C ON U.cen_id = C.cen_id
      JOIN TipoUsuarios T ON U.tip_usr_id = T.tip_usr_id
      WHERE U.usr_cedula = ?`;
    const [rows] = await db.query(query, [usr_cedula]);
    return rows;
  },

  buscarPorCorreo: async (usr_correo) => {
    const query = 'SELECT * FROM Usuarios WHERE usr_correo = ?';
    const [rows] = await db.query(query, [usr_correo]);
    return rows;
  },

  buscarPorTelefono: async (usr_telefono) => {
    const query = 'SELECT * FROM Usuarios WHERE usr_telefono = ?';
    const [rows] = await db.query(query, [usr_telefono]);
    return rows;
  },

  crear: async (data) => {
    const query = 'INSERT INTO Usuarios SET ?';
    const [result] = await db.query(query, [data]);
    return result;
  },

  actualizar: async (data) => {
    const query = 'UPDATE Usuarios SET ? WHERE usr_cedula = ?';
    const [result] = await db.query(query, [data, data.usr_cedula]);
    return result;
  },

  eliminar: async (usr_cedula) => {
    const query = 'DELETE FROM Usuarios WHERE usr_cedula = ?';
    const [result] = await db.query(query, [usr_cedula]);
    return result;
  },

  buscarTodos: async () => {
    const query = `
      SELECT U.*, C.cen_nombre, T.tip_usr_nombre
      FROM Usuarios U
      JOIN Centros C ON U.cen_id = C.cen_id
      JOIN TipoUsuarios T ON U.tip_usr_id = T.tip_usr_id`;
    const [rows] = await db.query(query);
    return rows;
  },

  buscarPorTipo: async (tip_usr_id) => {
    const query = 'SELECT * FROM Usuarios WHERE tip_usr_id = ?';
    const [rows] = await db.query(query, [tip_usr_id]);
    return rows;
  }
};

module.exports = Usuario;