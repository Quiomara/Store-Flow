const UbicacionElemento = require('../models/ubicacionElementoModel');

/**
 * Crea una nueva ubicación de elemento en la base de datos.
 *
 * Este controlador recibe los datos de la nueva ubicación desde el cuerpo de la solicitud
 * y utiliza el método "crear" del modelo UbicacionElemento para guardar la nueva ubicación.
 *
 * @async
 * @function crearUbicacionElemento
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} req.body - Datos de la nueva ubicación del elemento.
 * @param {Object} res - Objeto de respuesta HTTP.
 * @returns {Promise<void>} No retorna un valor explícito, pero envía una respuesta HTTP.
 */
const crearUbicacionElemento = async (req, res) => {
  const data = req.body;
  try {
    await UbicacionElemento.crear(data);
    res.json({ respuesta: true, mensaje: '¡Ubicación del elemento creada con éxito!' });
  } catch (err) {
    res.status(500).json({ respuesta: false, mensaje: 'Error al crear la ubicación del elemento.' });
  }
};

/**
 * Actualiza una ubicación de elemento existente.
 *
 * Este controlador recibe los datos actualizados desde el cuerpo de la solicitud y utiliza el método
 * "actualizar" del modelo UbicacionElemento para modificar la ubicación existente.
 *
 * @async
 * @function actualizarUbicacionElemento
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} req.body - Datos de la ubicación del elemento a actualizar.
 * @param {Object} res - Objeto de respuesta HTTP.
 * @returns {Promise<void>} No retorna un valor explícito, pero envía una respuesta HTTP.
 */
const actualizarUbicacionElemento = async (req, res) => {
  const data = req.body;
  try {
    await UbicacionElemento.actualizar(data);
    res.json({ respuesta: true, mensaje: '¡Ubicación del elemento actualizada con éxito!' });
  } catch (err) {
    res.status(500).json({ respuesta: false, mensaje: 'Error al actualizar la ubicación del elemento.' });
  }
};

/**
 * Elimina una ubicación de elemento por su ID.
 *
 * Este controlador obtiene el ID de la ubicación del elemento desde los parámetros de la solicitud y
 * utiliza el método "eliminar" del modelo UbicacionElemento para borrar la ubicación correspondiente.
 *
 * @async
 * @function eliminarUbicacionElemento
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} req.params - Parámetros de la URL.
 * @param {number|string} req.params.ubi_ele_id - ID de la ubicación del elemento a eliminar.
 * @param {Object} res - Objeto de respuesta HTTP.
 * @returns {Promise<void>} No retorna un valor explícito, pero envía una respuesta HTTP.
 */
const eliminarUbicacionElemento = async (req, res) => {
  const ubi_ele_id = req.params.ubi_ele_id;
  try {
    await UbicacionElemento.eliminar(ubi_ele_id);
    res.json({ respuesta: true, mensaje: '¡Ubicación del elemento eliminada con éxito!' });
  } catch (err) {
    res.status(500).json({ respuesta: false, mensaje: 'Error al eliminar la ubicación del elemento.' });
  }
};

/**
 * Obtiene todas las ubicaciones de elementos.
 *
 * Este controlador consulta la base de datos para obtener todas las ubicaciones de elementos
 * y envía la respuesta al cliente.
 *
 * @async
 * @function obtenerTodosUbicacionElementos
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} res - Objeto de respuesta HTTP.
 * @returns {Promise<void>} No retorna un valor explícito, pero envía una respuesta HTTP con los datos.
 */
const obtenerTodosUbicacionElementos = async (req, res) => {
  try {
    const results = await UbicacionElemento.obtenerTodos();
    res.send(results);
  } catch (err) {
    res.status(500).json({ respuesta: false, mensaje: 'Error al obtener las ubicaciones de los elementos.' });
  }
};

/**
 * Obtiene una ubicación de elemento por su ID.
 *
 * Este controlador obtiene el ID de la ubicación desde los parámetros de la solicitud y
 * consulta la base de datos para obtener la ubicación correspondiente.
 *
 * @async
 * @function obtenerUbicacionElementoPorId
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} req.params - Parámetros de la URL.
 * @param {number|string} req.params.ubi_ele_id - ID de la ubicación del elemento a obtener.
 * @param {Object} res - Objeto de respuesta HTTP.
 * @returns {Promise<void>} No retorna un valor explícito, pero envía la respuesta HTTP con la ubicación.
 */
const obtenerUbicacionElementoPorId = async (req, res) => {
  const ubi_ele_id = req.params.ubi_ele_id;
  try {
    const results = await UbicacionElemento.obtenerPorId(ubi_ele_id);
    res.send(results[0]);
  } catch (err) {
    res.status(500).json({ respuesta: false, mensaje: 'Error al obtener la ubicación del elemento.' });
  }
};

module.exports = {
  crearUbicacionElemento,
  actualizarUbicacionElemento,
  eliminarUbicacionElemento,
  obtenerTodosUbicacionElementos,
  obtenerUbicacionElementoPorId
};
