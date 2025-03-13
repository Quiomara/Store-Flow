const db = require('../config/db');

/**
 * Módulo para gestionar operaciones CRUD sobre usuarios.
 * @module Usuario
 */
const Usuario = {
  /**
   * Busca un usuario por su cédula.
   *
   * Realiza una consulta a la base de datos para obtener la información del usuario,
   * junto con el nombre del centro y el tipo de usuario, que se unen desde las tablas Centros y TipoUsuarios.
   *
   * @async
   * @function buscarPorId
   * @param {string} usr_cedula - Cédula del usuario.
   * @returns {Promise<Object[]>} Información del usuario encontrado.
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
   *
   * Realiza una consulta a la base de datos para obtener la información del usuario
   * cuyo correo electrónico coincida con el proporcionado.
   *
   * @async
   * @function buscarPorCorreo
   * @param {string} usr_correo - Correo del usuario.
   * @returns {Promise<Object[]>} Información del usuario encontrado.
   */
  buscarPorCorreo: async (usr_correo) => {
    const query = 'SELECT * FROM Usuarios WHERE usr_correo = ?';
    const [rows] = await db.query(query, [usr_correo]);
    return rows;
  },

  /**
   * Busca un usuario por su número de teléfono.
   *
   * Realiza una consulta a la base de datos para obtener la información del usuario
   * cuyo número de teléfono coincida con el proporcionado.
   *
   * @async
   * @function buscarPorTelefono
   * @param {string} usr_telefono - Teléfono del usuario.
   * @returns {Promise<Object[]>} Información del usuario encontrado.
   */
  buscarPorTelefono: async (usr_telefono) => {
    const query = 'SELECT * FROM Usuarios WHERE usr_telefono = ?';
    const [rows] = await db.query(query, [usr_telefono]);
    return rows;
  },

  /**
   * Crea un nuevo usuario.
   *
   * Inserta un nuevo registro en la tabla "Usuarios" utilizando los datos proporcionados.
   *
   * @async
   * @function crear
   * @param {Object} data - Datos del usuario.
   * @returns {Promise<Object>} Resultado de la operación de inserción.
   */
  crear: async (data) => {
    const query = 'INSERT INTO Usuarios SET ?';
    const [result] = await db.query(query, [data]);
    return result;
  },

  /**
   * Actualiza la información de un usuario.
   *
   * Actualiza el registro del usuario identificado por su cédula con la información proporcionada.
   *
   * @async
   * @function actualizar
   * @param {Object} data - Datos actualizados del usuario.
   * @returns {Promise<Object>} Resultado de la operación de actualización.
   */
  actualizar: async (data) => {
    const query = 'UPDATE Usuarios SET ? WHERE usr_cedula = ?';
    const [result] = await db.query(query, [data, data.usr_cedula]);
    return result;
  },

  /**
   * Elimina un usuario por su cédula.
   *
   * Borra el registro del usuario identificado por la cédula proporcionada.
   *
   * @async
   * @function eliminar
   * @param {string} usr_cedula - Cédula del usuario.
   * @returns {Promise<Object>} Resultado de la operación de eliminación.
   */
  eliminar: async (usr_cedula) => {
    const query = 'DELETE FROM Usuarios WHERE usr_cedula = ?';
    const [result] = await db.query(query, [usr_cedula]);
    return result;
  },

  /**
   * Obtiene la lista de todos los usuarios.
   *
   * Realiza una consulta a la base de datos para obtener todos los registros de usuarios,
   * uniendo la información del centro y el tipo de usuario.
   *
   * @async
   * @function buscarTodos
   * @returns {Promise<Object[]>} Lista de usuarios.
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
   *
   * Realiza una consulta a la base de datos para obtener todos los usuarios
   * que coincidan con el tipo de usuario proporcionado.
   *
   * @async
   * @function buscarPorTipo
   * @param {number} tip_usr_id - ID del tipo de usuario.
   * @returns {Promise<Object[]>} Lista de usuarios encontrados.
   */
  buscarPorTipo: async (tip_usr_id) => {
    const query = 'SELECT * FROM Usuarios WHERE tip_usr_id = ?';
    const [rows] = await db.query(query, [tip_usr_id]);
    return rows;
  }
};

module.exports = Usuario;
