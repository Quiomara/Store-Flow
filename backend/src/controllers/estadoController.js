const Estado = require('../models/estadoModel');

// Función para manejar errores
const manejarError = (res, mensaje, err) => {
  console.error(mensaje, err.stack);
  return res.status(500).json({ respuesta: false, mensaje });
};

// Obtener todos los estados
const obtenerTodosEstados = (req, res) => {
  Estado.obtenerTodos((err, results) => {
    if (err) return manejarError(res, 'Error al obtener los estados.', err);
    res.json({ respuesta: true, mensaje: '¡Estados obtenidos con éxito!', data: results });
  });
};

// Obtener estado por ID
const obtenerEstadoPorId = (req, res) => {
  const { est_id } = req.params;
  Estado.obtenerPorId(est_id, (err, results) => {
    if (err) return manejarError(res, 'Error al obtener el estado.', err);
    if (results.length === 0) return res.status(404).json({ respuesta: false, mensaje: 'Estado no encontrado.' });
    res.json({ respuesta: true, mensaje: '¡Estado obtenido con éxito!', data: results[0] });
  });
};

// Crear estado
const crearEstado = (req, res) => {
  const data = req.body;
  Estado.crear(data, (err, result) => {
    if (err) return manejarError(res, 'Error al crear el estado.', err);
    res.json({ respuesta: true, mensaje: '¡Estado creado con éxito!', id: result.insertId });
  });
};

// Actualizar estado
const actualizarEstado = (req, res) => {
  const data = req.body;
  Estado.actualizar(data, (err) => {
    if (err) return manejarError(res, 'Error al actualizar el estado.', err);
    res.json({ respuesta: true, mensaje: '¡Estado actualizado con éxito!' });
  });
};

// Eliminar estado
const eliminarEstado = (req, res) => {
  const { est_id } = req.params;
  Estado.eliminar(est_id, (err, result) => {
    if (err) return manejarError(res, 'Error al eliminar el estado.', err);
    if (result.affectedRows === 0) return res.status(404).json({ respuesta: false, mensaje: 'Estado no encontrado.' });
    res.json({ respuesta: true, mensaje: '¡Estado eliminado con éxito!' });
  });
};

module.exports = {
  obtenerTodosEstados,
  obtenerEstadoPorId,
  crearEstado,
  actualizarEstado,
  eliminarEstado
};
