const UbicacionElemento = require('../models/ubicacionElementoModel');

const crearUbicacionElemento = async (req, res) => {
  const data = req.body;
  try {
    await UbicacionElemento.crear(data);
    res.json({ respuesta: true, mensaje: '¡Ubicación del elemento creada con éxito!' });
  } catch (err) {
    console.error('Error al crear la ubicación del elemento:', err.stack);
    res.status(500).json({ respuesta: false, mensaje: 'Error al crear la ubicación del elemento.' });
  }
};

const actualizarUbicacionElemento = async (req, res) => {
  const data = req.body; // Asegúrate de que el cuerpo de la solicitud tiene 'ubi_nombre' y 'ubi_ele_id'
  try {
    await UbicacionElemento.actualizar(data);
    res.json({ respuesta: true, mensaje: '¡Ubicación del elemento actualizada con éxito!' });
  } catch (err) {
    console.error('Error al actualizar la ubicación del elemento:', err.stack);
    res.status(500).json({ respuesta: false, mensaje: 'Error al actualizar la ubicación del elemento.' });
  }
};

const eliminarUbicacionElemento = async (req, res) => {
  const ubi_ele_id = req.params.ubi_ele_id;
  try {
    await UbicacionElemento.eliminar(ubi_ele_id);
    res.json({ respuesta: true, mensaje: '¡Ubicación del elemento eliminada con éxito!' });
  } catch (err) {
    console.error('Error al eliminar la ubicación del elemento:', err.stack);
    res.status(500).json({ respuesta: false, mensaje: 'Error al eliminar la ubicación del elemento.' });
  }
};

const obtenerTodosUbicacionElementos = async (req, res) => {
  try {
    const results = await UbicacionElemento.obtenerTodos();
    res.send(results);
  } catch (err) {
    console.error('Error al obtener las ubicaciones de los elementos:', err.stack);
    res.status(500).json({ respuesta: false, mensaje: 'Error al obtener las ubicaciones de los elementos.' });
  }
};

const obtenerUbicacionElementoPorId = async (req, res) => {
  const ubi_ele_id = req.params.ubi_ele_id;
  try {
    const results = await UbicacionElemento.obtenerPorId(ubi_ele_id);
    res.send(results[0]);
  } catch (err) {
    console.error('Error al obtener la ubicación del elemento:', err.stack);
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