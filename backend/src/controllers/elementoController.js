const Elemento = require('../models/elementoModel');

const crearElemento = (req, res) => {
  const data = req.body;
  Elemento.crear(data, (err, results) => {
    if (err) {
      console.error('Error al crear el elemento:', err.stack);
      return res.status(500).json({ respuesta: false, mensaje: 'Error al crear el elemento.' });
    }
    res.json({ respuesta: true, mensaje: '¡Elemento creado con éxito!' });
  });
};

const actualizarElemento = (req, res) => {
  const data = req.body;
  Elemento.actualizar(data, (err, results) => {
    if (err) {
      console.error('Error al actualizar el elemento:', err.stack);
      return res.status(500).json({ respuesta: false, mensaje: 'Error al actualizar el elemento.' });
    }
    res.json({ respuesta: true, mensaje: '¡Elemento actualizado con éxito!' });
  });
};

const eliminarElemento = (req, res) => {
  const ele_id = req.params.ele_id;
  Elemento.eliminar(ele_id, (err, results) => {
    if (err) {
      console.error('Error al eliminar el elemento:', err.stack);
      return res.status(500).json({ respuesta: false, mensaje: 'Error al eliminar el elemento.' });
    }
    res.json({ respuesta: true, mensaje: '¡Elemento eliminado con éxito!' });
  });
};

const obtenerTodosElementos = (req, res) => {
  Elemento.obtenerTodos((err, results) => {
    if (err) {
      console.error('Error al obtener los elementos:', err.stack);
      return res.status(500).json({ respuesta: false, mensaje: 'Error al obtener los elementos.'});
    }
    res.send(results);
  });
};

const obtenerElementoPorId = (req, res) => {
  const ele_id = req.params.ele_id;
  Elemento.obtenerPorId(ele_id, (err, results) => {
    if (err) {
      console.error('Error al obtener el elemento:', err.stack);
      return res.status(500).json({ respuesta: false, mensaje: 'Error al obtener el elemento.'});
    }
    res.send(results[0]);
  });
};

module.exports = {
  crearElemento,
  actualizarElemento,
  eliminarElemento,
  obtenerTodosElementos,
  obtenerElementoPorId
};
