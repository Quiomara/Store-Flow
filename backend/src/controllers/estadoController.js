const Estado = require('../models/estadoModel');

/**
 * Maneja los errores y envía una respuesta con código 500.
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {string} mensaje - Mensaje de error a enviar.
 * @param {Error} err - Objeto de error capturado.
 */
const manejarError = (res, mensaje, err) => {
  console.error(mensaje, err.stack);
  return res.status(500).json({ respuesta: false, mensaje });
};

/**
 * Obtiene todos los estados.
 * @route GET /estados
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
 * @route GET /estados/:est_id
 * @param {number} req.params.est_id - ID del estado a obtener.
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
 * @route POST /estados
 * @param {Object} req.body - Datos del estado a crear.
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
 * @route PUT /estados
 * @param {Object} req.body - Datos del estado a actualizar.
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
 * @route DELETE /estados/:est_id
 * @param {number} req.params.est_id - ID del estado a eliminar.
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
