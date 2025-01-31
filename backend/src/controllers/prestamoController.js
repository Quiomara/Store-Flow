const db = require('../config/db');
const Prestamo = require("../models/prestamoModel");
const PrestamoElemento = require("../models/prestamoElementoModel");
const Elemento = require("../models/elementoModel");
const Estado = require("../models/estadoModel");

// Función para manejar errores
const manejarError = (res, mensaje, err) => {
  console.error(mensaje, err.stack);
  return res.status(500).json({ respuesta: false, mensaje });
};

// Crear un nuevo préstamo
// Crear un nuevo préstamo
const crearPrestamo = async (req, res) => {
  const startTime = Date.now();

  try {
    console.log("Datos recibidos en crearPrestamo:", req.body);

    const data = {
      pre_inicio: new Date(),
      usr_cedula: req.body.usr_cedula,
      est_id: req.body.est_id,
      elementos: req.body.elementos,
    };

    // Validar campos obligatorios
    if (!data.usr_cedula || !data.est_id) {
      throw new Error("Faltan campos obligatorios: usr_cedula o est_id.");
    }
    if (!data.elementos || data.elementos.length === 0) {
      throw new Error("No se proporcionaron elementos para el préstamo.");
    }

    console.log("Datos validados:", data);

    // Crear el préstamo
    const prestamoResult = await Prestamo.crear(data);
    const prestamoId = prestamoResult.insertId;
    console.log("ID del préstamo creado:", prestamoId);

    // Procesar cada elemento en paralelo
    await Promise.all(data.elementos.map(async (elemento) => {
      console.log("Procesando elemento:", elemento);

      if (!elemento.ele_id || elemento.pre_ele_cantidad_prestado === undefined) {
        throw new Error("Uno o más elementos no tienen ID o cantidad válida.");
      }

      const prestamoElementoData = {
        pre_id: prestamoId,
        ele_id: elemento.ele_id,
        pre_ele_cantidad_prestado: elemento.pre_ele_cantidad_prestado,
      };

      console.log('Intentando insertar en prestamoselementos:', prestamoElementoData);
      await PrestamoElemento.crear(prestamoElementoData);

      console.log(`Elemento ${elemento.ele_id} insertado en prestamoselementos`);

      // Obtener y actualizar la cantidad del elemento
      const elementoDb = await Elemento.obtenerPorId(elemento.ele_id);
      const nuevaCantidadActual = elementoDb.ele_cantidad_actual - elemento.pre_ele_cantidad_prestado;

      if (isNaN(nuevaCantidadActual)) {
        throw new Error(`Cantidad inválida para el elemento ID ${elemento.ele_id}: ${nuevaCantidadActual}`);
      }

      console.log(`Actualizando stock para el elemento ${elemento.ele_id}: nueva cantidad ${nuevaCantidadActual}`);
      await Elemento.actualizarStock(elemento.ele_id, nuevaCantidadActual);
      console.log(`Stock actualizado para el elemento ${elemento.ele_id}`);
    }));

    // Enviar respuesta al cliente
    res.status(201).json({ respuesta: true, mensaje: "¡Préstamo creado con éxito!", id: prestamoId });

    const endTime = Date.now();
    console.log(`Tiempo de ejecución total: ${endTime - startTime} ms`);
  } catch (error) {
    console.error(`Error al crear el préstamo: ${error.message}`);
    res.status(500).json({ respuesta: false, mensaje: `Error al crear el préstamo: ${error.message}` });
  }
};

// Actualizar Préstamo
const actualizarPrestamo = async (req, res) => {
  const data = req.body;
  const { tip_usr_id: userRole, usr_cedula: userCedula } = req.user;

  try {
    // Obtener el estado y el usuario del préstamo
    const results = await Prestamo.obtenerEstadoYUsuarioPorId(data.pre_id);

    // Verificar si el préstamo existe
    if (!results || results.length === 0) {
      return res.status(404).json({ respuesta: false, mensaje: "Préstamo no encontrado." });
    }

    const { est_id, usr_cedula } = results[0];

    // Verificar permisos del usuario
    if (userRole === 2 && userCedula !== usr_cedula) {
      return res.status(403).json({
        respuesta: false,
        mensaje: "No tiene permiso para actualizar este préstamo.",
      });
    }

    // Verificar el estado del préstamo
    if (![1, 2].includes(est_id)) {
      return res.status(400).json({
        respuesta: false,
        mensaje: 'El préstamo no se puede actualizar, ya que no está en estado "Creado" o "En Proceso".',
      });
    }

    // Preparar los datos para la actualización
    const updateData = {
      pre_id: data.pre_id,
      pre_inicio: results[0].pre_inicio, // No se actualiza la fecha de inicio
      pre_fin: userRole === 3 ? data.pre_fin : results[0].pre_fin, // Solo almacén puede actualizar la fecha fin
      usr_cedula: data.usr_cedula,
      est_id: userRole === 3 ? data.est_id : est_id, // Solo almacén puede actualizar el estado
      pre_actualizacion: new Date(),
    };

    // Actualizar el préstamo
    await Prestamo.actualizar(updateData);

    // Actualizar la cantidad de elementos en la tabla Elementos (si se proporciona)
    if (data.ele_id && data.ele_cantidad) {
      await Prestamo.actualizarCantidadElemento(data.ele_id, data.ele_cantidad);
      res.json({ respuesta: true, mensaje: "¡Préstamo y cantidad de elementos actualizados con éxito!" });
    } else {
      res.json({ respuesta: true, mensaje: "¡Préstamo actualizado con éxito!" });
    }
  } catch (err) {
    console.error('Error al actualizar el préstamo:', err);
    res.status(500).json({ respuesta: false, mensaje: "Error al actualizar el préstamo." });
  }
};

// Eliminar Préstamo
const eliminarPrestamo = async (req, res) => {
  const { pre_id } = req.params;
  const { tip_usr_id: userRole, usr_cedula: userCedula } = req.user;

  try {
    const results = await Prestamo.obtenerEstadoYUsuarioPorId(pre_id);
    if (results.length === 0) {
      return res.status(404).json({ respuesta: false, mensaje: "Préstamo no encontrado." });
    }

    const { est_id, usr_cedula } = results[0];
    if (userRole === 2 && userCedula !== usr_cedula) {
      return res.status(403).json({ respuesta: false, mensaje: "No tiene permiso para eliminar este préstamo." });
    }

    if (![1, 2].includes(est_id)) {
      return res.status(400).json({ respuesta: false, mensaje: 'El préstamo no se puede eliminar, ya que no está en estado "Creado" o "En Proceso".' });
    }

    const elementos = await PrestamoElemento.obtenerPorPrestamoId(pre_id);

    // Devolver las cantidades de los elementos al inventario
    for (const elemento of elementos) {
      await Elemento.actualizarStock(elemento.ele_id, elemento.pre_ele_cantidad_prestado); // Cambiado a `actualizarStock`
    }

    // Eliminar los elementos del préstamo
    await PrestamoElemento.eliminarPorPrestamoId(pre_id);

    // Eliminar el préstamo
    await Prestamo.eliminar(pre_id);

    res.json({ respuesta: true, mensaje: "¡Préstamo eliminado con éxito!" });
  } catch (error) {
    console.error('Error al eliminar el préstamo:', error);
    res.status(500).json({ respuesta: false, mensaje: "Error al eliminar el préstamo." });
  }
};

// Obtener todos los préstamos
const obtenerTodosPrestamos = async (req, res) => {
  try {
    const { tip_usr_id, usr_cedula } = req.user; // Obtener el rol del usuario y la cédula
    console.log(`Obteniendo préstamos para el rol: ${tip_usr_id} del usuario con cédula: ${usr_cedula}`);

    // Validar que el usuario tenga permisos (Rol Almacén o Administrador)
    if ([1, 3].includes(tip_usr_id)) {
      const prestamos = await Prestamo.obtenerTodos();
      console.log('Préstamos obtenidos y ordenados:', prestamos);
      res.json({ respuesta: true, mensaje: "¡Préstamos obtenidos con éxito!", data: prestamos });
    } else {
      console.error(`No tiene permiso para ver los préstamos con el rol ${tip_usr_id}`); // Depuración de error
      res.status(403).json({ respuesta: false, mensaje: "No tiene permiso para ver los préstamos." });
    }
  } catch (err) {
    console.error('Error al obtener los préstamos:', err.stack);
    res.status(500).json({ respuesta: false, mensaje: "Error al obtener los préstamos." });
  }
};

const obtenerPrestamoPorId = async (req, res) => {
  const pre_id = req.params.pre_id;

  try {
    // Obtener el préstamo
    const prestamo = await Prestamo.obtenerPorId(pre_id); // Cambiado a `obtenerPorId`

    // Verificar si el préstamo existe
    if (!prestamo) {
      return res.status(404).json({ respuesta: false, mensaje: 'Préstamo no encontrado.' });
    }

    // Obtener los elementos asociados al préstamo
    const elementos = await PrestamoElemento.obtenerPorPrestamoId(pre_id);

    // Crear un nuevo objeto con los datos del préstamo y los elementos
    const respuesta = {
      ...prestamo, // `prestamo` es un objeto, no un array
      elementos: elementos,
    };

    res.json({ respuesta: true, mensaje: 'Préstamo obtenido con éxito.', data: respuesta });
  } catch (err) {
    console.error('Error al obtener el préstamo:', err);
    res.status(500).json({ respuesta: false, mensaje: 'Error al obtener el préstamo.' });
  }
};

// Obtener préstamos por cédula
const obtenerPrestamosPorCedula = async (req, res) => {
  const { usr_cedula } = req.params;

  // Validar que la cédula no esté vacía
  if (!usr_cedula) {
    console.error('Error: La cédula no fue proporcionada.');
    return res.status(400).json({ respuesta: false, mensaje: 'La cédula no fue proporcionada.' });
  }

  console.log(`Obteniendo préstamos para la cédula: ${usr_cedula}`); // Log de depuración

  try {
    const results = await Prestamo.obtenerPorCedula(usr_cedula);

    if (results.length === 0) {
      console.log("No se encontraron préstamos para la cédula proporcionada.");
      return res.status(404).json({ respuesta: false, mensaje: 'No se encontraron préstamos para la cédula proporcionada.' });
    }

    console.log("Préstamos obtenidos:", results);
    res.json({
      respuesta: true,
      mensaje: "¡Préstamos obtenidos con éxito!",
      data: results
    });
  } catch (err) {
    console.error('Error al obtener los préstamos:', err);
    res.status(500).json({ respuesta: false, mensaje: 'Error al obtener los préstamos.', error: err.message });
  }
};

// Obtener elementos del préstamo
const obtenerElementoPrestamos = async (req, res) => {
  const pre_id = req.params.pre_id;

  try {
    const results = await Prestamo.obtenerElementosPrestamo(pre_id);

    if (results.length === 0) {
      return res.status(404).json({ respuesta: false, mensaje: 'Préstamo no encontrado' });
    }

    // Extrae el estado del préstamo del primer resultado
    const estadoPrestamo = results[0].estado;

    // Formatea la respuesta para incluir el estado y los elementos
    const respuesta = {
      respuesta: true,
      mensaje: '¡Elementos del préstamo obtenidos con éxito!',
      estadoPrestamo: estadoPrestamo, // Incluye el estado del préstamo
      data: results.map(item => ({
        pre_id: item.pre_id,
        ele_id: item.ele_id,
        pre_ele_cantidad_prestado: item.pre_ele_cantidad_prestado,
        nombre: item.nombre
      }))
    };

    res.json(respuesta);
  } catch (err) {
    console.error('Error al obtener los elementos del préstamo:', err);
    res.status(500).json({ respuesta: false, mensaje: 'Error al obtener los elementos del préstamo' });
  }
};

// Actualizar cantidad de un elemento en un préstamo
const actualizarCantidadElemento = async (req, res) => {
  const { pre_id, ele_id, pre_ele_cantidad_prestado } = req.body;

  // Verificar que los campos necesarios estén presentes
  if (!pre_id || !ele_id || pre_ele_cantidad_prestado === undefined) {
    return res.status(400).json({ respuesta: false, mensaje: 'Faltan campos obligatorios: pre_id, ele_id o pre_ele_cantidad_prestado.' });
  }

  try {
    // Actualizar la cantidad en PrestamosElementos
    await Prestamo.actualizarCantidadElemento(pre_id, ele_id, pre_ele_cantidad_prestado);

    // Actualizar el stock en Elementos
    await Elemento.actualizarStock(ele_id, -pre_ele_cantidad_prestado);

    // Si todo sale bien, enviar una respuesta exitosa
    res.json({ respuesta: true, mensaje: 'Cantidad y stock actualizados con éxito' });
  } catch (err) {
    console.error('Error en actualizarCantidadElemento:', err);
    res.status(500).json({ respuesta: false, mensaje: 'Error al actualizar la cantidad o el stock', error: err.message });
  }
};

module.exports = {
  crearPrestamo,
  actualizarPrestamo,
  eliminarPrestamo,
  obtenerTodosPrestamos,
  obtenerPrestamoPorId,
  obtenerPrestamosPorCedula,
  obtenerElementoPrestamos,
  actualizarCantidadElemento,
};