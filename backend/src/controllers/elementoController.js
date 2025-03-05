const Elemento = require('../models/elementoModel');
const PrestamoElemento = require('../models/prestamoElementoModel');

/**
 * Controlador para crear un nuevo elemento.
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} res - Objeto de respuesta HTTP.
 */
const crearElemento = async (req, res) => {
  const { ele_nombre, ele_cantidad_total, ubi_ele_id, ele_imagen } = req.body;

  // Validación de datos obligatorios
  if (!ele_nombre || typeof ele_cantidad_total === 'undefined' || !ubi_ele_id) {
    return res.status(400).json({ respuesta: false, mensaje: 'Todos los campos son obligatorios.' });
  }

  const data = {
    ele_nombre,
    ele_cantidad_total,
    ele_cantidad_actual: ele_cantidad_total, // Se inicializa con la cantidad total
    ele_imagen,
    ubi_ele_id
  };

  try {
    await Elemento.crear(data);
    res.json({ respuesta: true, mensaje: '¡Elemento creado con éxito!' });
  } catch (err) {
    res.status(500).json({ respuesta: false, mensaje: 'Error al crear el elemento.' });
  }
};

/**
 * Controlador para actualizar un elemento.
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} res - Objeto de respuesta HTTP.
 */
const actualizarElemento = async (req, res) => {
  const data = req.body;
  try {
    await Elemento.actualizar(data);
    res.json({ respuesta: true, mensaje: '¡Elemento actualizado con éxito!' });
  } catch (err) {
    res.status(500).json({ respuesta: false, mensaje: 'Error al actualizar el elemento.' });
  }
};

/**
 * Controlador para actualizar la cantidad prestada de un elemento.
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} res - Objeto de respuesta HTTP.
 */
const actualizarCantidadPrestado = async (req, res) => {
  const { ele_id, cantidad, pre_id } = req.body;

  // Validación de datos
  if (typeof ele_id !== 'number' || typeof cantidad !== 'number' || typeof pre_id !== 'number') {
    return res.status(400).json({ respuesta: false, mensaje: 'Datos inválidos.' });
  }

  try {
    // Verificar si hay suficiente stock
    const elemento = await Elemento.obtenerPorId(ele_id);
    if (!elemento || elemento.ele_cantidad_actual < cantidad) {
      return res.status(400).json({ respuesta: false, mensaje: 'No hay suficiente stock.' });
    }

    // Actualizar la cantidad prestada y el stock disponible
    await PrestamoElemento.actualizarCantidadPrestado(pre_id, ele_id, cantidad);
    await Elemento.actualizarStock(ele_id, -cantidad);

    res.json({ respuesta: true, mensaje: 'Cantidad del préstamo y stock actualizados con éxito.' });
  } catch (err) {
    res.status(500).json({ respuesta: false, mensaje: 'Error al actualizar la cantidad prestada.' });
  }
};

/**
 * Controlador para eliminar un elemento.
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} res - Objeto de respuesta HTTP.
 */
const eliminarElemento = async (req, res) => {
  const ele_id = req.params.ele_id;
  try {
    await Elemento.eliminar(ele_id);
    res.json({ respuesta: true, mensaje: '¡Elemento eliminado con éxito!' });
  } catch (err) {
    res.status(500).json({ respuesta: false, mensaje: 'Error al eliminar el elemento.' });
  }
};

/**
 * Controlador para obtener todos los elementos.
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} res - Objeto de respuesta HTTP.
 */
const obtenerTodosElementos = async (req, res) => {
  try {
    const elementos = await Elemento.obtenerTodos();
    res.send(elementos);
  } catch (err) {
    res.status(500).json({ respuesta: false, mensaje: 'Error al obtener los elementos.' });
  }
};

/**
 * Controlador para obtener un elemento por su ID.
 * @param {Object} req - Objeto de solicitud HTTP con el ID en los parámetros.
 * @param {Object} res - Objeto de respuesta HTTP.
 */
const obtenerElementoPorId = async (req, res) => {
  const ele_id = req.params.ele_id;
  try {
    const elemento = await Elemento.obtenerPorId(ele_id);
    if (!elemento) {
      return res.status(404).json({ respuesta: false, mensaje: 'Elemento no encontrado.' });
    }
    res.send(elemento);
  } catch (err) {
    res.status(500).json({ respuesta: false, mensaje: 'Error al obtener el elemento.' });
  }
};

/**
 * Controlador para actualizar el stock de un elemento.
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} res - Objeto de respuesta HTTP.
 */
const actualizarStock = async (req, res) => {
  const { ele_id, ele_cantidad_actual } = req.body;

  // Convertir a números y validar
  const eleIdNumber = Number(ele_id);
  const cantidadNumber = Number(ele_cantidad_actual);

  if (isNaN(eleIdNumber) || isNaN(cantidadNumber)) {
    return res.status(400).json({ respuesta: false, mensaje: 'Datos inválidos.' });
  }

  try {
    await Elemento.actualizarStock(eleIdNumber, cantidadNumber);
    res.json({ respuesta: true, mensaje: 'Stock actualizado con éxito.' });
  } catch (err) {
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
  actualizarStock,
};
