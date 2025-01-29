const Elemento = require('../models/elementoModel');
const PrestamoElemento = require('../models/prestamoElementoModel');

// Crear un nuevo elemento
const crearElemento = async (req, res) => {
  const data = req.body;
  try {
    await Elemento.crear(data);
    res.json({ respuesta: true, mensaje: '¡Elemento creado con éxito!' });
  } catch (err) {
    console.error('Error al crear el elemento:', err.stack);
    res.status(500).json({ respuesta: false, mensaje: 'Error al crear el elemento.' });
  }
};

// Actualizar un elemento
const actualizarElemento = async (req, res) => {
  const data = req.body;
  try {
    await Elemento.actualizar(data);
    res.json({ respuesta: true, mensaje: '¡Elemento actualizado con éxito!' });
  } catch (err) {
    console.error('Error al actualizar el elemento:', err.stack);
    res.status(500).json({ respuesta: false, mensaje: 'Error al actualizar el elemento.' });
  }
};

// Actualizar la cantidad prestada de un elemento
const actualizarCantidadPrestado = async (req, res) => {
  const { ele_id, cantidad, pre_id } = req.body;

  if (typeof ele_id !== 'number' || typeof cantidad !== 'number' || typeof pre_id !== 'number') {
    return res.status(400).json({ respuesta: false, mensaje: 'Datos inválidos.' });
  }

  try {
    // Verificar si hay suficiente stock antes de actualizar
    const elemento = await Elemento.obtenerPorId(ele_id);
    if (elemento.ele_cantidad_actual < cantidad) {
      return res.status(400).json({ respuesta: false, mensaje: 'No hay suficiente stock.' });
    }

    // Actualizar la cantidad prestada en PrestamosElementos
    await PrestamoElemento.actualizarCantidadPrestado(pre_id, ele_id, cantidad);

    // Actualizar el stock en Elementos
    await Elemento.actualizarStock(ele_id, -cantidad);

    res.json({ respuesta: true, mensaje: 'Cantidad del préstamo y stock actualizados con éxito.' });
  } catch (err) {
    console.error('Error al actualizar la cantidad prestada:', err.stack);
    res.status(500).json({ respuesta: false, mensaje: 'Error al actualizar la cantidad prestada.' });
  }
};

// Eliminar un elemento
const eliminarElemento = async (req, res) => {
  const ele_id = req.params.ele_id;
  try {
    await Elemento.eliminar(ele_id);
    res.json({ respuesta: true, mensaje: '¡Elemento eliminado con éxito!' });
  } catch (err) {
    console.error('Error al eliminar el elemento:', err.stack);
    res.status(500).json({ respuesta: false, mensaje: 'Error al eliminar el elemento.' });
  }
};

// Obtener todos los elementos
const obtenerTodosElementos = async (req, res) => {
  try {
    const elementos = await Elemento.obtenerTodos();
    res.send(elementos);
  } catch (err) {
    console.error('Error al obtener los elementos:', err.stack);
    res.status(500).json({ respuesta: false, mensaje: 'Error al obtener los elementos.' });
  }
};

// Obtener un elemento por su ID
const obtenerElementoPorId = async (req, res) => {
  const ele_id = req.params.ele_id;
  try {
    const elemento = await Elemento.obtenerPorId(ele_id);
    if (!elemento) {
      return res.status(404).json({ respuesta: false, mensaje: 'Elemento no encontrado.' });
    }
    res.send(elemento);
  } catch (err) {
    console.error('Error al obtener el elemento:', err.stack);
    res.status(500).json({ respuesta: false, mensaje: 'Error al obtener el elemento.' });
  }
};

// Actualizar el stock de un elemento
const actualizarStock = async (req, res) => {
  const { ele_id, ele_cantidad_actual } = req.body;

  // Convertir a números
  const eleIdNumber = Number(ele_id);
  const cantidadNumber = Number(ele_cantidad_actual);

  // Validar que sean números válidos
  if (isNaN(eleIdNumber) || isNaN(cantidadNumber)) {
    return res.status(400).json({ respuesta: false, mensaje: 'Datos inválidos.' });
  }

  try {
    await Elemento.actualizarStock(eleIdNumber, cantidadNumber);
    res.json({ respuesta: true, mensaje: 'Stock actualizado con éxito.' });
  } catch (err) {
    console.error('Error al actualizar el stock:', err.stack);
    res.status(500).json({ respuesta: false, mensaje: 'Error al actualizar el stock.' });
  }
};

module.exports = {
  crearElemento,
  actualizarElemento,
  actualizarCantidadPrestado,
  eliminarElemento,
  obtenerTodosElementos,
  obtenerElementoPorId,
  actualizarStock, // Exporta la nueva función
};