const db = require('../config/db');

const Usuario = {
  /**
   * Busca un usuario por su cédula.
   * @param {string} usr_cedula - Cédula del usuario.
   * @returns {Promise<Object[]>} - Información del usuario encontrado.
   */
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

  /**
   * Busca un usuario por su correo electrónico.
   * @param {string} usr_correo - Correo del usuario.
   * @returns {Promise<Object[]>} - Información del usuario encontrado.
   */
  buscarPorCorreo: async (usr_correo) => {
    const query = 'SELECT * FROM Usuarios WHERE usr_correo = ?';
    const [rows] = await db.query(query, [usr_correo]);
    return rows;
  },

  /**
   * Busca un usuario por su número de teléfono.
   * @param {string} usr_telefono - Teléfono del usuario.
   * @returns {Promise<Object[]>} - Información del usuario encontrado.
   */
  buscarPorTelefono: async (usr_telefono) => {
    const query = 'SELECT * FROM Usuarios WHERE usr_telefono = ?';
    const [rows] = await db.query(query, [usr_telefono]);
    return rows;
  },

  /**
   * Crea un nuevo usuario.
   * @param {Object} data - Datos del usuario.
   * @returns {Promise<Object>} - Resultado de la operación.
   */
  crear: async (data) => {
    const query = 'INSERT INTO Usuarios SET ?';
    const [result] = await db.query(query, [data]);
    return result;
  },

  /**
   * Actualiza la información de un usuario.
   * @param {Object} data - Datos actualizados del usuario.
   * @returns {Promise<Object>} - Resultado de la operación.
   */
  actualizar: async (data) => {
    const query = 'UPDATE Usuarios SET ? WHERE usr_cedula = ?';
    const [result] = await db.query(query, [data, data.usr_cedula]);
    return result;
  },

  /**
   * Elimina un usuario por su cédula.
   * @param {string} usr_cedula - Cédula del usuario.
   * @returns {Promise<Object>} - Resultado de la operación.
   */
  eliminar: async (usr_cedula) => {
    const query = 'DELETE FROM Usuarios WHERE usr_cedula = ?';
    const [result] = await db.query(query, [usr_cedula]);
    return result;
  },

  /**
   * Obtiene la lista de todos los usuarios.
   * @returns {Promise<Object[]>} - Lista de usuarios.
   */
  buscarTodos: async () => {
    const query = `
      SELECT U.*, C.cen_nombre, T.tip_usr_nombre
      FROM Usuarios U
      JOIN Centros C ON U.cen_id = C.cen_id
      JOIN TipoUsuarios T ON U.tip_usr_id = T.tip_usr_id`;
    const [rows] = await db.query(query);
    return rows;
  },

  /**
   * Busca usuarios por tipo de usuario.
   * @param {number} tip_usr_id - ID del tipo de usuario.
   * @returns {Promise<Object[]>} - Lista de usuarios encontrados.
   */
  buscarPorTipo: async (tip_usr_id) => {
    const query = 'SELECT * FROM Usuarios WHERE tip_usr_id = ?';
    const [rows] = await db.query(query, [tip_usr_id]);
    return rows;
  }
};

module.exports = Usuario;
