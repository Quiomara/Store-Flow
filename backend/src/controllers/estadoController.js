const Estado = require('../models/estadoModel');

// Función para manejar errores
const manejarError = (res, mensaje, err) => {
  console.error(mensaje, err.stack);
  return res.status(500).json({ respuesta: false, mensaje });
};

// Obtener todos los estados
const obtenerTodosEstados = async (req, res) => {
  try {
    const estados = await Estado.obtenerTodos();
    res.json(estados); // Enviar los resultados directamente
  } catch (err) {
    manejarError(res, 'Error al obtener los estados.', err);
  }
};

// Obtener estado por ID
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

// Crear estado
const crearEstado = async (req, res) => {
  const data = req.body;
  try {
    const result = await Estado.crear(data);
    res.json({ respuesta: true, mensaje: '¡Estado creado con éxito!', id: result.insertId });
  } catch (err) {
    manejarError(res, 'Error al crear el estado.', err);
  }
};

// Actualizar estado
const actualizarEstado = async (req, res) => {
  const data = req.body;
  try {
    await Estado.actualizar(data);
    res.json({ respuesta: true, mensaje: '¡Estado actualizado con éxito!' });
  } catch (err) {
    manejarError(res, 'Error al actualizar el estado.', err);
  }
};

// Eliminar estado
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