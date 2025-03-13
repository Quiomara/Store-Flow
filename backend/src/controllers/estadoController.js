const Estado = require('../models/estadoModel');

/**
 * Maneja los errores y envía una respuesta con código 500.
 *
 * Registra el error en la consola y envía una respuesta JSON con el mensaje de error.
 *
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {string} mensaje - Mensaje de error a enviar.
 * @param {Error} err - Objeto de error capturado.
 * @returns {Object} Respuesta HTTP con código 500 y el mensaje de error.
 */
const manejarError = (res, mensaje, err) => {
  console.error(mensaje, err.stack);
  return res.status(500).json({ respuesta: false, mensaje });
};

/**
 * Obtiene todos los estados.
 *
 * Consulta la base de datos para obtener todos los estados y envía la respuesta en formato JSON.
 *
 * @async
 * @route GET /estados
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} res - Objeto de respuesta HTTP.
 * @returns {Promise<void>} No retorna ningún valor.
 */
const obtenerTodosEstados = async (req, res) => {
  try {
    const estados = await Estado.obtenerTodos();
    res.json(estados);
  } catch (err) {
    manejarError(res, 'Error al obtener los estados.', err);
  }
};

/**
 * Obtiene un estado por su ID.
 *
 * Consulta la base de datos para obtener el estado correspondiente al ID proporcionado y lo envía en la respuesta.
 *
 * @async
 * @route GET /estados/:est_id
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} req.params - Parámetros de la solicitud.
 * @param {number} req.params.est_id - ID del estado a obtener.
 * @param {Object} res - Objeto de respuesta HTTP.
 * @returns {Promise<void>} No retorna ningún valor.
 */
const obtenerEstadoPorId = async (req, res) => {
  const { est_id } = req.params;
  try {
    const estado = await Estado.obtenerPorId(est_id);
    if (estado.length === 0) {
      return res.status(404).json({ respuesta: false, mensaje: 'Estado no encontrado.' });
    }
    res.json({ respuesta: true, mensaje: '¡Estado obtenido con éxito!', data: estado[0] });
  } catch (err) {
    manejarError(res, 'Error al obtener el estado.', err);
  }
};

/**
 * Crea un nuevo estado.
 *
 * Recibe los datos del nuevo estado a través del cuerpo de la solicitud y crea el registro correspondiente en la base de datos.
 *
 * @async
 * @route POST /estados
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} req.body - Datos del estado a crear.
 * @param {Object} res - Objeto de respuesta HTTP.
 * @returns {Promise<void>} No retorna ningún valor.
 */
const crearEstado = async (req, res) => {
  const data = req.body;
  try {
    const result = await Estado.crear(data);
    res.json({ respuesta: true, mensaje: '¡Estado creado con éxito!', id: result.insertId });
  } catch (err) {
    manejarError(res, 'Error al crear el estado.', err);
  }
};

/**
 * Actualiza un estado existente.
 *
 * Recibe los datos actualizados del estado a través del cuerpo de la solicitud y actualiza el registro en la base de datos.
 *
 * @async
 * @route PUT /estados
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} req.body - Datos del estado a actualizar.
 * @param {Object} res - Objeto de respuesta HTTP.
 * @returns {Promise<void>} No retorna ningún valor.
 */
const actualizarEstado = async (req, res) => {
  const data = req.body;
  try {
    await Estado.actualizar(data);
    res.json({ respuesta: true, mensaje: '¡Estado actualizado con éxito!' });
  } catch (err) {
    manejarError(res, 'Error al actualizar el estado.', err);
  }
};

/**
 * Elimina un estado por su ID.
 *
 * Elimina el estado correspondiente al ID proporcionado en los parámetros de la solicitud.
 *
 * @async
 * @route DELETE /estados/:est_id
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} req.params - Parámetros de la solicitud.
 * @param {number} req.params.est_id - ID del estado a eliminar.
 * @param {Object} res - Objeto de respuesta HTTP.
 * @returns {Promise<void>} No retorna ningún valor.
 */
const eliminarEstado = async (req, res) => {
  const { est_id } = req.params;
  try {
    const result = await Estado.eliminar(est_id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ respuesta: false, mensaje: 'Estado no encontrado.' });
    }
    res.json({ respuesta: true, mensaje: '¡Estado eliminado con éxito!' });
  } catch (err) {
    manejarError(res, 'Error al eliminar el estado.', err);
  }
};

module.exports = {
  obtenerTodosEstados,
  obtenerEstadoPorId,
  crearEstado,
  actualizarEstado,
  eliminarEstado
};
