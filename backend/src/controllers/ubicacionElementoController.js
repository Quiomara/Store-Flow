const UbicacionElemento = require('../models/ubicacionElementoModel');

const crearUbicacionElemento = (req, res) => {
  const data = req.body;
  UbicacionElemento.crear(data, (err, results) => {
    if (err) {
      console.error('Error al crear la ubicación del elemento:', err.stack);
      return res.status(500).json({ respuesta: false, mensaje: 'Error al crear la ubicación del elemento.' });
    }
    res.json({ respuesta: true, mensaje: '¡Ubicación del elemento creada con éxito!' });
  });
};

const actualizarUbicacionElemento = (req, res) => {
  const data = req.body;
  UbicacionElemento.actualizar(data, (err, results) => {
    if (err) {
      console.error('Error al actualizar la ubicación del elemento:', err.stack);
      return res.status(500).json({ respuesta: false, mensaje: 'Error al actualizar la ubicación del elemento.' });
    }
    res.json({ respuesta: true, mensaje: '¡Ubicación del elemento actualizada con éxito!' });
  });
};

const eliminarUbicacionElemento = (req, res) => {
  const ubi_ele_id = req.params.ubi_ele_id;
  UbicacionElemento.eliminar(ubi_ele_id, (err, results) => {
    if (err) {
      console.error('Error al eliminar la ubicación del elemento:', err.stack);
      return res.status(500).json({ respuesta: false, mensaje: 'Error al eliminar la ubicación del elemento.' });
    }
    res.json({ respuesta: true, mensaje: '¡Ubicación del elemento eliminada con éxito!' });
  });
};

const obtenerTodosUbicacionElementos = (req, res) => {
  UbicacionElemento.obtenerTodos((err, results) => {
    if (err) {
      console.error('Error al obtener las ubicaciones de los elementos:', err.stack);
      return res.status(500).json({ respuesta: false, mensaje: 'Error al obtener las ubicaciones de los elementos.'});
    }
    res.send(results);
  });
};

const obtenerUbicacionElementoPorId = (req, res) => {
  const ubi_ele_id = req.params.ubi_ele_id;
  UbicacionElemento.obtenerPorId(ubi_ele_id, (err, results) => {
    if (err) {
      console.error('Error al obtener la ubicación del elemento:', err.stack);
      return res.status(500).json({ respuesta: false, mensaje: 'Error al obtener la ubicación del elemento.'});
    }
    res.send(results[0]);
  });
};

module.exports = {
  crearUbicacionElemento,
  actualizarUbicacionElemento,
  eliminarUbicacionElemento,
  obtenerTodosUbicacionElementos,
  obtenerUbicacionElementoPorId
};
