const Elemento = require('../models/elementoModel');
const PrestamoElemento = require('../models/prestamoElementoModel');
const db = require('../config/db');

/**
 * Controlador para crear un nuevo elemento.
 *
 * Este controlador toma los datos del cuerpo de la solicitud (req.body), verifica que los campos obligatorios estén presentes
 * y crea un nuevo elemento en la base de datos. Se inicializa el stock actual con la cantidad total proporcionada.
 *
 * @async
 * @function crearElemento
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} req.body - Cuerpo de la solicitud.
 * @param {string} req.body.ele_nombre - Nombre del elemento.
 * @param {number} req.body.ele_cantidad_total - Cantidad total del elemento.
 * @param {number} req.body.ubi_ele_id - ID de la ubicación del elemento.
 * @param {string} [req.body.ele_imagen] - URL o ruta de la imagen del elemento (opcional).
 * @param {Object} res - Objeto de respuesta HTTP.
 * @returns {Promise<void>} No retorna un valor.
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
 *
 * Este controlador actualiza la información de un elemento en la base de datos utilizando los datos enviados en el cuerpo de la solicitud.
 *
 * @async
 * @function actualizarElemento
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} req.body - Cuerpo de la solicitud con los datos a actualizar del elemento.
 * @param {Object} res - Objeto de respuesta HTTP.
 * @returns {Promise<void>} No retorna un valor.
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
 *
 * Este controlador verifica si hay suficiente stock de un elemento y actualiza tanto la cantidad prestada en el préstamo
 * como el stock disponible del elemento.
 *
 * @async
 * @function actualizarCantidadPrestado
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} req.body - Cuerpo de la solicitud.
 * @param {number} req.body.ele_id - ID del elemento.
 * @param {number} req.body.cantidad - Cantidad a prestar.
 * @param {number} req.body.pre_id - ID del préstamo.
 * @param {Object} res - Objeto de respuesta HTTP.
 * @returns {Promise<void>} No retorna un valor.
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
 *
 * Este controlador obtiene el ID del elemento a eliminar a partir de los parámetros de la solicitud,
 * inicia una transacción y elimina los registros relacionados en la tabla `PrestamosElementos` y el registro
 * del elemento en la tabla `Elementos`. Si ocurre algún error, se revierte la transacción.
 *
 * @async
 * @function eliminarElemento
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} req.params - Parámetros de la solicitud.
 * @param {string} req.params.ele_id - ID del elemento a eliminar.
 * @param {Object} res - Objeto de respuesta HTTP.
 * @returns {Promise<void>} No retorna ningún valor.
 */
const eliminarElemento = async (req, res) => {
  const ele_id = req.params.ele_id;

  console.log('ID del elemento a eliminar:', ele_id); // Verifica el ID recibido

  if (!ele_id) {
    console.error('El ID del elemento no está presente en la solicitud');
    return res.status(400).json({ respuesta: false, mensaje: 'ID del elemento no proporcionado.' });
  }

  let connection;
  try {
    // Obtener conexión a la base de datos
    connection = await db.getConnection();
    await connection.beginTransaction();

    // Eliminar los registros relacionados en la tabla `prestamoselementos`
    console.log(`Eliminando registros relacionados en prestamoselementos para el elemento con ID: ${ele_id}`);
    const deletePrestamosElementos = await connection.execute(
      `DELETE FROM PrestamosElementos WHERE ele_id = ?`,
      [ele_id]
    );
    console.log(`Registros eliminados de PrestamosElementos: ${deletePrestamosElementos.affectedRows}`);

    // Ahora eliminar el elemento
    const deleteElementoResult = await connection.execute(
      `DELETE FROM Elementos WHERE ele_id = ?`,
      [ele_id]
    );

    if (deleteElementoResult.affectedRows === 0) {
      console.error(`No se encontró el elemento con ID: ${ele_id}`);
      return res.status(404).json({ respuesta: false, mensaje: 'Elemento no encontrado' });
    }

    // Confirmar la transacción
    await connection.commit();

    res.json({ respuesta: true, mensaje: '¡Elemento eliminado con éxito!' });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error('Error al eliminar el elemento:', err.message);
    res.status(500).json({ respuesta: false, mensaje: 'Error al eliminar el elemento.', error: err.message });
  } finally {
    if (connection) connection.release();
  }
};

/**
 * Controlador para obtener todos los elementos.
 *
 * Este controlador consulta la base de datos para obtener todos los elementos registrados
 * y envía la respuesta con los datos obtenidos. En caso de error, retorna un mensaje de error.
 *
 * @async
 * @function obtenerTodosElementos
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} res - Objeto de respuesta HTTP.
 * @returns {Promise<void>} No retorna ningún valor.
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
 *
 * Este controlador consulta la base de datos para obtener un elemento específico utilizando
 * el ID proporcionado en los parámetros de la solicitud y envía el elemento encontrado o
 * un mensaje de error si no se encuentra.
 *
 * @async
 * @function obtenerElementoPorId
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} req.params - Parámetros de la solicitud.
 * @param {string} req.params.ele_id - ID del elemento a obtener.
 * @param {Object} res - Objeto de respuesta HTTP.
 * @returns {Promise<void>} No retorna ningún valor.
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
 *
 * Este controlador recibe el ID del elemento y la nueva cantidad de stock a través del cuerpo de la solicitud,
 * valida que ambos valores sean numéricos y actualiza el stock en la base de datos.
 *
 * @async
 * @function actualizarStock
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} req.body - Datos enviados en la solicitud.
 * @param {(string|number)} req.body.ele_id - ID del elemento.
 * @param {(string|number)} req.body.ele_cantidad_actual - Nueva cantidad actual del elemento.
 * @param {Object} res - Objeto de respuesta HTTP.
 * @returns {Promise<void>} No retorna ningún valor.
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
