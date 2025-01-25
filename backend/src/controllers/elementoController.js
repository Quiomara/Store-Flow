const Elemento = require('../models/elementoModel');
const PrestamoElemento = require('../models/prestamoElementoModel'); // Importar el modelo de prestamosElementos

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

const actualizarCantidadPrestado = (req, res) => {
  const { ele_id, ele_cantidad, pre_id } = req.body; 

  console.log('Datos recibidos del frontend:', { ele_id, ele_cantidad, pre_id });

  if (typeof ele_id !== 'number' || typeof ele_cantidad !== 'number' || typeof pre_id !== 'number') {
    return res.status(400).json({ respuesta: false, mensaje: 'Datos inválidos.' });
  }

  Elemento.actualizarCantidad(ele_id, ele_cantidad, (err, results) => {
    if (err) {
      console.error('Error al actualizar el stock en la tabla Elementos:', err.stack);
      return res.status(500).json({ respuesta: false, mensaje: 'Error al actualizar el stock.' });
    }

    PrestamoElemento.actualizarCantidadPrestado(pre_id, ele_id, ele_cantidad, (err, results) => {
      if (err) {
        console.error('Error al actualizar la cantidad en la tabla prestamosElementos:', err.stack);
        return res.status(500).json({ respuesta: false, mensaje: 'Error al actualizar la cantidad del préstamo.' });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ respuesta: false, mensaje: 'Elemento no encontrado en el préstamo.' });
      }

      res.json({ respuesta: true, mensaje: 'Stock y cantidad del préstamo actualizados con éxito.', results });
    });
  });
};

const actualizarStock = (req, res) => {
  const { ele_id, ele_cantidad } = req.body;

  console.log('Datos recibidos para actualizar stock:', { ele_id, ele_cantidad });

  if (typeof ele_id !== 'number' || typeof ele_cantidad !== 'number') {
    return res.status(400).json({ respuesta: false, mensaje: 'Datos inválidos.' });
  }

  Elemento.actualizarCantidad(ele_id, ele_cantidad, (err, results) => {
    if (err) {
      console.error('Error al actualizar el stock:', err.stack);
      return res.status(500).json({ respuesta: false, mensaje: 'Error al actualizar el stock.' });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ respuesta: false, mensaje: 'Elemento no encontrado.' });
    }

    res.json({ respuesta: true, mensaje: 'Stock actualizado con éxito.', results });
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
      return res.status(500).json({ respuesta: false, mensaje: 'Error al obtener los elementos.' });
    }
    res.send(results);
  });
};

const obtenerElementoPorId = (req, res) => {
  const ele_id = req.params.ele_id;
  Elemento.obtenerPorId(ele_id).then((elemento) => {
    if (!elemento) {
      return res.status(404).json({ respuesta: false, mensaje: 'Elemento no encontrado' });
    }
    res.send({
      ele_nombre: elemento.ele_nombre,
      ele_cantidad: elemento.ele_cantidad
    });
  }).catch((err) => {
    console.error('Error al obtener el elemento:', err.stack);
    return res.status(500).json({ respuesta: false, mensaje: 'Error al obtener el elemento.' });
  });
};

module.exports = {
  crearElemento,
  actualizarElemento,
  actualizarCantidadPrestado, // Añadir la nueva función
  eliminarElemento,
  obtenerTodosElementos,
  obtenerElementoPorId,
  actualizarStock,
};
