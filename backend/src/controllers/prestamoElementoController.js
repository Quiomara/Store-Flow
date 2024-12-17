const PrestamoElemento = require('../models/prestamoElementoModel');

const crearPrestamoElemento = (req, res) => {
  const data = req.body;
  PrestamoElemento.crear(data, (err, results) => {
    if (err) {
      console.error('Error al crear el préstamo de elemento:', err.stack);
      return res.status(500).json({ respuesta: false, mensaje: 'Error al crear el préstamo de elemento.' });
    }
    res.json({ respuesta: true, mensaje: '¡Préstamo de elemento creado con éxito!' });
  });
};

const actualizarPrestamoElemento = (req, res) => {
  const data = req.body;
  PrestamoElemento.actualizar(data, (err, results) => {
    if (err) {
      console.error('Error al actualizar el préstamo de elemento:', err.stack);
      return res.status(500).json({ respuesta: false, mensaje: 'Error al actualizar el préstamo de elemento.' });
    }
    res.json({ respuesta: true, mensaje: '¡Préstamo de elemento actualizado con éxito!' });
  });
};

const eliminarPrestamoElemento = (req, res) => {
  const pre_ele_id = req.params.pre_ele_id;
  PrestamoElemento.eliminar(pre_ele_id, (err, results) => {
    if (err) {
      console.error('Error al eliminar el préstamo de elemento:', err.stack);
      return res.status(500).json({ respuesta: false, mensaje: 'Error al eliminar el préstamo de elemento.' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ respuesta: false, mensaje: 'Préstamo de elemento no encontrado.' });
    }

    res.json({ respuesta: true, mensaje: '¡Préstamo de elemento eliminado con éxito!' });
  });
};

const obtenerTodosPrestamosElementos = (req, res) => {
  PrestamoElemento.obtenerTodos((err, results) => {
    if (err) {
      console.error('Error al obtener los préstamos de elementos:', err.stack);
      return res.status(500).json({ respuesta: false, mensaje: 'Error al obtener los préstamos de elementos.' });
    }
    res.json({ respuesta: true, mensaje: '¡Préstamos de elementos obtenidos con éxito!', data: results });
  });
};

const obtenerPrestamoElementoPorId = (req, res) => {
  const pre_ele_id = req.params.pre_ele_id;
  PrestamoElemento.obtenerPorId(pre_ele_id, (err, results) => {
    if (err) {
      console.error('Error al obtener el préstamo de elemento:', err.stack);
      return res.status(500).json({ respuesta: false, mensaje: 'Error al obtener el préstamo de elemento.' });
    }
    if (results.length === 0) {
      return res.status(404).json({ respuesta: false, mensaje: 'Préstamo de elemento no encontrado.' });
    }
    res.json({ respuesta: true, mensaje: '¡Préstamo de elemento obtenido con éxito!', data: results[0] });
  });
};

module.exports = {
    crearPrestamoElemento,
    actualizarPrestamoElemento,
    eliminarPrestamoElemento,
    obtenerTodosPrestamosElementos,
    obtenerPrestamoElementoPorId
}
