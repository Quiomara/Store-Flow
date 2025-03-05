const UbicacionElemento = require('../models/ubicacionElementoModel');

/**
 * Crea una nueva ubicación de elemento en la base de datos.
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} res - Objeto de respuesta HTTP.
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
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} res - Objeto de respuesta HTTP.
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
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} res - Objeto de respuesta HTTP.
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
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} res - Objeto de respuesta HTTP.
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
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} res - Objeto de respuesta HTTP.
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
