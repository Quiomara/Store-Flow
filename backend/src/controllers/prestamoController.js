const db = require('../config/db');
const Prestamo = require("../models/prestamoModel");
const PrestamoElemento = require("../models/prestamoElementoModel");
const Elemento = require("../models/elementoModel");
const Estado = require("../models/estadoModel");
const Joi = require("joi");
const ErrorHandler = require("../utils/errorHandler");
const { iniciarTransaccion, confirmarTransaccion, revertirTransaccion } = require("../utils/dbTransaction");
const winston = require("winston");
const manejarError = require("../utils/manejarError");

// Configuración de logs
const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logs.log" }),
  ],
});

// Esquema de validación con Joi
const prestamoSchema = Joi.object({
  usr_cedula: Joi.number().integer().required(),
  est_id: Joi.number().integer().required(),
  elementos: Joi.array()
    .items(
      Joi.object({
        ele_id: Joi.number().integer().required(),
        pre_ele_cantidad_prestado: Joi.number().integer().min(1).required(),
      })
    )
    .min(1)
    .required(),
});

/**
 * Crear un nuevo préstamo con manejo de transacciones
 * 
 * @param {Object} req - Objeto de solicitud HTTP con los datos del préstamo
 * @param {Object} res - Objeto de respuesta HTTP
 */
const crearPrestamo = async (req, res) => {
  const { usr_cedula, est_id, elementos } = req.body;
  let connection;

  if (!usr_cedula || !est_id || !Array.isArray(elementos) || elementos.length === 0) {
    return res.status(400).json({ success: false, message: "Datos inválidos o sin elementos." });
  }

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // Insertar préstamo y obtener su ID
    const [prestamoResult] = await connection.execute(
      `INSERT INTO Prestamos (usr_cedula, est_id) VALUES (?, ?)`,
      [usr_cedula, est_id]
    );
    const prestamoId = prestamoResult.insertId;
    if (!prestamoId) throw new Error("No se pudo obtener el ID del préstamo.");

    // Insertar los elementos asociados al préstamo
    await Promise.all(elementos.map(async (item) => {
      // Insertar el elemento en PrestamosElementos
      await connection.execute(
        `INSERT INTO PrestamosElementos (pre_id, ele_id, pre_ele_cantidad_prestado) 
         VALUES (?, ?, ?)`,
        [prestamoId, item.ele_id, item.pre_ele_cantidad_prestado]
      );

      // Actualizar la cantidad actual del elemento en la tabla Elementos
      await connection.execute(
        `UPDATE Elementos 
         SET ele_cantidad_actual = ele_cantidad_actual - ? 
         WHERE ele_id = ?`,
        [item.pre_ele_cantidad_prestado, item.ele_id]
      );
    }));

    // Buscar el nombre completo del usuario (a partir de la cédula)
    const [rowsUser] = await connection.execute(`SELECT usr_primer_nombre, usr_segundo_nombre, usr_primer_apellido, usr_segundo_apellido
                                                  FROM usuarios WHERE usr_cedula = ?`, [usr_cedula]);

    let nombreCompleto = usr_cedula;
    if (rowsUser.length > 0) {
      const u = rowsUser[0];
      const segNombre = u.usr_segundo_nombre ? ` ${u.usr_segundo_nombre}` : '';
      const segApellido = u.usr_segundo_apellido ? ` ${u.usr_segundo_apellido}` : '';
      nombreCompleto = `${u.usr_primer_nombre}${segNombre} ${u.usr_primer_apellido}${segApellido}`.trim();
    }

    // Crear el historial con el evento "Creado"
    const historial = [{
      estado: "Creado",
      usuario: nombreCompleto,
      fecha: new Date().toISOString().slice(0, 19).replace("T", " ")
    }];

    // Guardar el historial en la columna 'historial_estados'
    const historialJSON = JSON.stringify(historial);
    await connection.execute(
      `UPDATE Prestamos 
       SET historial_estados = ?, pre_actualizacion = NOW()
       WHERE pre_id = ?`,
      [historialJSON, prestamoId]
    );

    // Confirmar la transacción
    await connection.commit();

    res.status(201).json({
      success: true,
      message: "Préstamo creado exitosamente",
      prestamoId,
      historial
    });

  } catch (error) {
    if (connection) await connection.rollback();
    logger.error("Error al crear el préstamo: " + error.message);
    res.status(500).json({ success: false, message: "Error en el servidor", error: error.message });
  } finally {
    if (connection) connection.release();
  }
};

/**
 * Actualiza un préstamo existente.
 * 
 * @param {Object} req - Objeto de solicitud HTTP con los datos de actualización.
 * @param {Object} res - Objeto de respuesta HTTP.
 */
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

    const { est_id, usr_cedula, pre_inicio } = results[0]; // Obtener la fecha de inicio original

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
      pre_fin: userRole === 3 ? data.pre_fin : results[0].pre_fin, // Solo almacén puede actualizar la fecha fin
      usr_cedula: data.usr_cedula,
      est_id: userRole === 3 ? data.est_id : est_id, // Solo almacén puede actualizar el estado
      pre_actualizacion: new Date(), // Fecha de actualización
    };

    // Actualizar el préstamo
    await Prestamo.actualizar(updateData);

    // Devolver la fecha de inicio original en la respuesta
    res.json({
      respuesta: true,
      mensaje: "¡Préstamo actualizado con éxito!",
      pre_inicio: pre_inicio, // Devolver la fecha de inicio original
    });
  } catch (err) {
    logger.error('Error al actualizar el préstamo: ' + err.message);
    res.status(500).json({ respuesta: false, mensaje: "Error al actualizar el préstamo." });
  }
};

/**
 * Eliminar Préstamo junto con sus elementos asociados. (Control de stock)
 * 
 * @param {Object} req - Objeto de solicitud HTTP con el ID del préstamo.
 * @param {Object} res - Objeto de respuesta HTTP.
 */
const eliminarPrestamo = async (req, res) => {
  const { pre_id } = req.params;

  // Verifica que el ID del préstamo esté presente
  if (!pre_id) {
    console.error("Error: ID del préstamo es requerido.");
    return res.status(400).json({ success: false, message: "ID del préstamo es requerido" });
  }

  let connection;

  try {
    // Log de entrada
    console.log(`Intentando eliminar el préstamo con ID: ${pre_id}`);
    
    // Obtener conexión a la base de datos
    connection = await db.getConnection();
    await connection.beginTransaction();

    // Eliminar primero los elementos asociados al préstamo
    console.log(`Eliminando elementos asociados al préstamo con ID: ${pre_id}`);
    const deleteElementosResult = await connection.execute(
      `DELETE FROM PrestamosElementos WHERE pre_id = ?`,
      [pre_id]
    );
    console.log(`Elementos eliminados: ${deleteElementosResult.affectedRows}`);

    // Verificar si la eliminación de elementos fue exitosa
    if (deleteElementosResult.affectedRows === 0) {
      console.warn(`No se encontraron elementos asociados al préstamo con ID: ${pre_id}`);
    }

    // Eliminar el préstamo en sí
    const [result] = await connection.execute(
      `DELETE FROM Prestamos WHERE pre_id = ?`,
      [pre_id]
    );

    // Si no se encuentra el préstamo
    if (result.affectedRows === 0) {
      console.error(`No se encontró el préstamo con ID: ${pre_id}`);
      throw new Error("No se encontró el préstamo o ya fue eliminado.");
    }

    // Confirmar la transacción
    await connection.commit();
    
    console.log(`Préstamo con ID: ${pre_id} eliminado correctamente.`);
    res.json({ success: true, message: "Préstamo eliminado correctamente" });

  } catch (error) {
    if (connection) await connection.rollback();

    // Log del error
    console.error(`Error al eliminar el préstamo: ${error.message}`);
    res.status(500).json({ success: false, message: "Error al eliminar el préstamo", error: error.message });
  } finally {
    if (connection) connection.release();
  }
};


/**
 * Obtiene la lista de todos los préstamos disponibles.
 * 
 * @param {Object} req - Objeto de solicitud HTTP con información del usuario.
 * @param {Object} res - Objeto de respuesta HTTP.
 */
const obtenerTodosPrestamos = async (req, res) => {
  try {
    const { tip_usr_id, usr_cedula } = req.user; // Obtener el rol del usuario y la cédula

    // Validar que el usuario tenga permisos (Rol Almacén o Administrador)
    if ([1, 3].includes(tip_usr_id)) {
      const prestamos = await Prestamo.obtenerTodos();
      res.json({ respuesta: true, mensaje: "¡Préstamos obtenidos con éxito!", data: prestamos });
    } else {
      res.status(403).json({ respuesta: false, mensaje: "No tiene permiso para ver los préstamos." });
    }
  } catch (err) {
    logger.error('Error al obtener los préstamos: ' + err.stack);
    res.status(500).json({ respuesta: false, mensaje: "Error al obtener los préstamos." });
  }
};

/**
 * Obtiene la información de un préstamo por su ID.
 * 
 * @param {Object} req - Objeto de solicitud HTTP con el ID del préstamo.
 * @param {Object} res - Objeto de respuesta HTTP.
 */
const obtenerPrestamoPorId = async (req, res) => {
  const pre_id = req.params.pre_id;

  try {
    const prestamo = await Prestamo.obtenerPorId(pre_id);
    if (!prestamo) {
      return res.status(404).json({ respuesta: false, mensaje: 'Préstamo no encontrado.' });
    }

    // Si 'historial_estados' es un string, lo convertimos a arreglo
    if (prestamo.historial_estados) {
      try {
        prestamo.historial_estados = JSON.parse(prestamo.historial_estados);
      } catch (error) {
        logger.error('Error al parsear historial_estados: ' + error);
        prestamo.historial_estados = [];
      }
    }

    const elementos = await PrestamoElemento.obtenerPorPrestamoId(pre_id);
    res.json({
      respuesta: true,
      mensaje: 'Préstamo obtenido con éxito.',
      data: { ...prestamo, elementos }
    });
  } catch (err) {
    manejarError(res, 'Error al obtener el préstamo', err);
  }
};

/**
 * Obtiene los préstamos asociados a una cédula de usuario.
 * 
 * @param {Object} req - Objeto de solicitud HTTP con la cédula del usuario.
 * @param {Object} res - Objeto de respuesta HTTP.
 */
const obtenerPrestamosPorCedula = async (req, res) => {
  const { usr_cedula } = req.params;

  // Validar que la cédula no esté vacía
  if (!usr_cedula) {
    return res.status(400).json({ respuesta: false, mensaje: 'La cédula no fue proporcionada.' });
  }

  try {
    const results = await Prestamo.obtenerPorCedula(usr_cedula);

    if (results.length === 0) {
      return res.status(404).json({ respuesta: false, mensaje: 'No se encontraron préstamos para la cédula proporcionada.' });
    }

    res.json({
      respuesta: true,
      mensaje: "¡Préstamos obtenidos con éxito!",
      data: results
    });
  } catch (err) {
    logger.error('Error al obtener los préstamos: ' + err);
    res.status(500).json({ respuesta: false, mensaje: 'Error al obtener los préstamos.', error: err.message });
  }
};

const obtenerElementoPrestamos = async (req, res) => {
  const pre_id = req.params.pre_id;
  
  console.log(`🔍 Buscando elementos del préstamo con ID: ${pre_id}`);

  try {
    const results = await Prestamo.obtenerElementosPrestamo(pre_id);

    if (results.length === 0) {
      console.warn(`⚠ No se encontraron elementos para el préstamo ${pre_id}`);
      return res.status(404).json({ respuesta: false, mensaje: 'Préstamo no encontrado' });
    }

    // Formatear la respuesta
    const estadoPrestamo = results[0].estado;
    const respuesta = {
      respuesta: true,
      mensaje: '¡Elementos del préstamo obtenidos con éxito!',
      estadoPrestamo: estadoPrestamo,
      data: results.map(item => ({
        pre_id: item.pre_id,
        ele_id: item.ele_id,
        pre_ele_cantidad_prestado: item.pre_ele_cantidad_prestado,
        nombre: item.nombre,
        ele_cantidad_actual: item.ele_cantidad_actual  // Se agrega en la respuesta
      }))
    };

    res.json(respuesta);
  } catch (err) {
    console.error('❌ Error al obtener los elementos del préstamo:', err);
    res.status(500).json({ respuesta: false, mensaje: 'Error al obtener los elementos del préstamo' });
  }
};

/**
 * Actualiza la cantidad de un elemento en un préstamo y ajusta el stock correspondiente.
 * @param {Object} req - Objeto de solicitud con pre_id, ele_id, pre_ele_cantidad_prestado, cancelar y entregado.
 * @param {Object} res - Objeto de respuesta para el cliente.
 */
const actualizarCantidadElemento = async (req, res) => {
  const { pre_id, ele_id, pre_ele_cantidad_prestado } = req.body; // Este valor es la nueva cantidad deseada
  if (!pre_id || !ele_id || pre_ele_cantidad_prestado === undefined) {
    return res.status(400).json({ respuesta: false, mensaje: 'Faltan campos obligatorios.' });
  }
  
  try {
    // Obtener la cantidad actual prestada para este elemento en el préstamo
    const [rows] = await db.execute(
      "SELECT pre_ele_cantidad_prestado FROM PrestamosElementos WHERE pre_id = ? AND ele_id = ?",
      [pre_id, ele_id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ respuesta: false, mensaje: "No se encontró el registro del préstamo." });
    }
    const cantidadOriginal = Number(rows[0].pre_ele_cantidad_prestado);
    const cantidadNueva = Number(pre_ele_cantidad_prestado);
    const diferencia = cantidadNueva - cantidadOriginal; 
    // Si diferencia > 0, se aumenta la cantidad prestada y se debe reducir el stock en esa diferencia.
    // Si diferencia < 0, se reduce la cantidad prestada y se debe aumentar el stock en esa diferencia.

    // Actualizar la cantidad en PrestamosElementos
    const [result] = await db.execute(
      "UPDATE PrestamosElementos SET pre_ele_cantidad_prestado = ? WHERE pre_id = ? AND ele_id = ?",
      [cantidadNueva, pre_id, ele_id]
    );
    if (result.affectedRows === 0) {
      return res.status(500).json({ respuesta: false, mensaje: "No se pudo actualizar la cantidad en el préstamo." });
    }

    // Ajustar el stock: se actualiza sumando (-diferencia) al stock actual
    // Es decir, si se incrementa la cantidad prestada (diferencia positiva), se resta esa cantidad al stock;
    // si se reduce la cantidad prestada (diferencia negativa), se suma esa cantidad (por su valor absoluto).
    const [resultStock] = await db.execute(
      "UPDATE Elementos SET ele_cantidad_actual = ele_cantidad_actual - ? WHERE ele_id = ?",
      [diferencia, ele_id]
    );

    // Obtener el stock actualizado
    const [elementoRows] = await db.execute(
      "SELECT ele_cantidad_actual FROM Elementos WHERE ele_id = ?",
      [ele_id]
    );

    return res.status(200).json({ 
      respuesta: true, 
      mensaje: "Cantidad actualizada con éxito.", 
      data: elementoRows[0] // Devuelve, por ejemplo, { ele_cantidad_actual: <valor_actualizado> }
    });
  } catch (err) {
    console.error("Error al actualizar cantidad:", err);
    return res.status(500).json({ 
      respuesta: false, 
      mensaje: 'Error al actualizar la cantidad o el stock', 
      error: err.message 
    });
  }
};


/**
 * Actualiza el estado de un préstamo y su historial de estados.
 * @param {Object} req - El objeto de solicitud que contiene los parámetros de la URL y el cuerpo con los datos necesarios.
 * @param {Object} res - El objeto de respuesta utilizado para enviar la respuesta al cliente.
 * @returns {void}
 */
const actualizarEstadoPrestamo = async (req, res) => {
  const { pre_id } = req.params;
  const { est_id, usr_cedula } = req.body;

  if (!pre_id || !est_id || !usr_cedula) {
    return res.status(400).json({ respuesta: false, mensaje: "Faltan campos: pre_id, est_id o usr_cedula" });
  }

  try {
    // Validar que el estado existe
    const [estado] = await db.execute("SELECT est_nombre FROM estados WHERE est_id = ?", [est_id]);
    if (estado.length === 0) {
      return res.status(404).json({ respuesta: false, mensaje: "Estado no válido" });
    }

    // Obtener el nombre completo del usuario
    const [rowsUser] = await db.execute(`SELECT usr_primer_nombre, usr_segundo_nombre, usr_primer_apellido, usr_segundo_apellido FROM usuarios WHERE usr_cedula = ?`, [usr_cedula]);
    let nombreCompleto = usr_cedula;
    if (rowsUser.length > 0) {
      const u = rowsUser[0];
      nombreCompleto = `${u.usr_primer_nombre} ${u.usr_segundo_nombre || ''} ${u.usr_primer_apellido} ${u.usr_segundo_apellido || ''}`.trim();
    }

    // Obtener el historial de estados del préstamo
    const [prestamo] = await db.execute("SELECT historial_estados FROM prestamos WHERE pre_id = ?", [pre_id]);
    let historial = [];
    if (prestamo.length > 0 && prestamo[0].historial_estados) {
      try {
        historial = JSON.parse(prestamo[0].historial_estados);
      } catch {
        historial = [];
      }
    }

    // Agregar nueva entrada de estado al historial
    historial.push({
      estado: estado[0].est_nombre,
      usuario: nombreCompleto,
      fecha: new Date().toISOString().slice(0, 19).replace("T", " ")
    });

    // Construir la consulta de actualización
    let query = `UPDATE prestamos SET est_id = ?, historial_estados = ?, pre_actualizacion = NOW() WHERE pre_id = ?`;
    let values = [est_id, JSON.stringify(historial), pre_id];

    if (est_id == 4 || est_id == 5) {
      query = `UPDATE prestamos SET est_id = ?, historial_estados = ?, pre_actualizacion = NOW(), pre_fin = NOW() WHERE pre_id = ?`;
    }

    // Ejecutar la actualización
    const [result] = await db.execute(query, values);
    if (result.affectedRows === 0) {
      return res.status(404).json({ respuesta: false, mensaje: "Préstamo no encontrado" });
    }

    res.json({ respuesta: true, mensaje: "Estado actualizado correctamente", nuevo_estado: estado[0].est_nombre, historial_estados: historial });
  } catch (err) {
    res.status(500).json({ respuesta: false, mensaje: "Error interno del servidor", error: err.message });
  }
};

/**
 * Cancela un préstamo dado su ID y restaura la cantidad de los elementos prestados.
 * @param {Object} req - El objeto de solicitud que contiene el ID del préstamo.
 * @param {Object} res - El objeto de respuesta utilizado para enviar la respuesta al cliente.
 * @returns {void}
 */

const cancelarPrestamo = async (req, res) => {
  const pre_id = Number(req.params.pre_id);
  if (!pre_id) {
    return res.status(400).json({ success: false, message: "ID del préstamo es requerido" });
  }

  // Extraer la cédula del usuario autenticado
  const usrCedula = req.user && req.user.usr_cedula;
  if (!usrCedula) {
    return res.status(400).json({ success: false, message: "El usuario que cancela el préstamo no está definido." });
  }

  try {
    // Se delega la lógica de cancelar al modelo, pasando pre_id y usrCedula
    const result = await Prestamo.cancelarPrestamo(pre_id, usrCedula);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error al cancelar el préstamo", error: error.message });
  }
};



/**
 * Obtiene el historial de estado de un préstamo dado su ID.
 * @param {Object} req - El objeto de solicitud que contiene los parámetros de la URL con el ID del préstamo.
 * @param {Object} res - El objeto de respuesta utilizado para enviar la respuesta al cliente.
 * @returns {void}
 */
const obtenerHistorialEstado = async (req, res) => {
  try {
    const pre_id = req.params.pre_id;
    const historial = await Prestamo.obtenerHistorialEstado(pre_id);

    if (!historial) {
      return res.status(404).json({ respuesta: false, mensaje: 'Préstamo no encontrado o sin historial.' });
    }

    return res.json({ respuesta: true, data: historial });
  } catch (error) {
    return res.status(500).json({ respuesta: false, mensaje: 'Error al obtener historial' });
  }
};

/**
 * Controlador para entregar un préstamo
 * @param {Object} req - El objeto de solicitud que contiene el ID del préstamo.
 * @param {Object} res - El objeto de respuesta utilizado para enviar la respuesta al cliente.
 * @returns {void}
 */
const entregarPrestamo = async (req, res) => {
  const pre_id = Number(req.params.pre_id);
  if (!pre_id) {
    return res.status(400).json({ success: false, message: "ID del préstamo es requerido" });
  }

  // Extraer la cédula del usuario autenticado (suponiendo que el middleware asigna req.user)
  const usrCedula = req.user && req.user.usr_cedula;
  if (!usrCedula) {
    return res.status(400).json({ success: false, message: "El usuario que entrega el préstamo no está definido." });
  }

  try {
    const result = await Prestamo.entregarPrestamo(pre_id, usrCedula);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error al entregar el préstamo", error: error.message });
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
  actualizarEstadoPrestamo,
  cancelarPrestamo,
  obtenerHistorialEstado,
  entregarPrestamo,
};

