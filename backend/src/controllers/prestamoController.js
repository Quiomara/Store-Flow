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

// Crear un nuevo préstamo con manejo de transacciones
const crearPrestamo = async (req, res) => {
  const { usr_cedula, est_id, elementos } = req.body;
  let connection;

  if (!usr_cedula || !est_id || !Array.isArray(elementos) || elementos.length === 0) {
    return res.status(400).json({ success: false, message: "Datos inválidos o sin elementos." });
  }

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    // 1. Insertar préstamo y obtener su ID
    const [prestamoResult] = await connection.execute(
      `INSERT INTO Prestamos (usr_cedula, est_id) VALUES (?, ?)`,
      [usr_cedula, est_id]
    );

    const prestamoId = prestamoResult.insertId;
    if (!prestamoId) throw new Error("No se pudo obtener el ID del préstamo.");

    console.log("✅ Préstamo creado con ID:", prestamoId);

    // 2. Insertar los elementos asociados al préstamo
    await Promise.all(elementos.map(item =>
      connection.execute(
        `INSERT INTO PrestamosElementos (pre_id, ele_id, pre_ele_cantidad_prestado) 
         VALUES (?, ?, ?)`,
        [prestamoId, item.ele_id, item.pre_ele_cantidad_prestado]
      )
    ));

    // 3. Buscar el nombre completo del usuario (a partir de la cédula)
    const [rowsUser] = await connection.execute(`
      SELECT 
        usr_primer_nombre,
        usr_segundo_nombre,
        usr_primer_apellido,
        usr_segundo_apellido
      FROM usuarios
      WHERE usr_cedula = ?
    `, [usr_cedula]);

    let nombreCompleto = usr_cedula; // Si no se encuentra, dejamos la cédula por defecto
    if (rowsUser.length > 0) {
      const u = rowsUser[0];
      const segNombre = u.usr_segundo_nombre ? ` ${u.usr_segundo_nombre}` : '';
      const segApellido = u.usr_segundo_apellido ? ` ${u.usr_segundo_apellido}` : '';
      nombreCompleto = `${u.usr_primer_nombre}${segNombre} ${u.usr_primer_apellido}${segApellido}`.trim();
    }

    // 4. Crear el historial con el evento "Creado"
    const historial = [{
      estado: "Creado",
      usuario: nombreCompleto,
      fecha: new Date().toISOString().slice(0, 19).replace("T", " ")
    }];

    // 5. Guardar el historial en la columna 'historial_estados'
    const historialJSON = JSON.stringify(historial);
    await connection.execute(
      `UPDATE Prestamos 
       SET historial_estados = ?, pre_actualizacion = NOW()
       WHERE pre_id = ?`,
      [historialJSON, prestamoId]
    );

    // 6. Confirmar la transacción
    await connection.commit();

    res.status(201).json({
      success: true,
      message: "Préstamo creado exitosamente",
      prestamoId,
      historial
    });

  } catch (error) {
    if (connection) await connection.rollback();
    console.error("❌ Error al crear el préstamo:", error.message);
    res.status(500).json({ success: false, message: "Error en el servidor", error: error.message });

  } finally {
    if (connection) connection.release();
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
    console.error('Error al actualizar el préstamo:', err);
    res.status(500).json({ respuesta: false, mensaje: "Error al actualizar el préstamo." });
  }
};

// Eliminar Préstamo con control de stock
const eliminarPrestamo = async (req, res) => {
  
  console.log("🔍 Parámetros recibidos:", req.params); // 👀 Depuración
  const { pre_id } = req.params;
  
  if (!pre_id) {
      return res.status(400).json({ success: false, message: "ID del préstamo es requerido" });
  }

  let connection;

  try {
      connection = await db.getConnection();
      await connection.beginTransaction();

      // 1️⃣ Eliminar primero los elementos asociados al préstamo
      await connection.execute(
          `DELETE FROM PrestamosElementos WHERE pre_id = ?`,
          [pre_id]
      );

      // 2️⃣ Eliminar el préstamo en sí
      const [result] = await connection.execute(
          `DELETE FROM Prestamos WHERE pre_id = ?`,
          [pre_id]
      );

      if (result.affectedRows === 0) {
          throw new Error("No se encontró el préstamo o ya fue eliminado.");
      }

      await connection.commit();
      res.json({ success: true, message: "Préstamo eliminado correctamente" });

  } catch (error) {
      if (connection) await connection.rollback();
      console.error("❌ Error al eliminar el préstamo:", error.message);
      res.status(500).json({ success: false, message: "Error al eliminar el préstamo", error: error.message });

  } finally {
      if (connection) connection.release();
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

// Obtener préstamo por ID (controller)
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
        console.error('Error al parsear historial_estados:', error);
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

const actualizarEstadoPrestamo = async (req, res) => {
  const { pre_id } = req.params;
  const { est_id, usr_cedula } = req.body;

  if (!pre_id || !est_id || !usr_cedula) {
    return res.status(400).json({
      respuesta: false,
      mensaje: "Faltan campos: pre_id, est_id o usr_cedula"
    });
  }

  try {
    // 1. Validar que el estado existe
    const [estado] = await db.execute("SELECT est_nombre FROM estados WHERE est_id = ?", [est_id]);
    if (estado.length === 0) {
      return res.status(404).json({
        respuesta: false,
        mensaje: "Estado no válido"
      });
    }

    // 2. Buscar el nombre completo del usuario en la tabla 'usuarios'
    const [rowsUser] = await db.execute(`
      SELECT 
        usr_primer_nombre,
        usr_segundo_nombre,
        usr_primer_apellido,
        usr_segundo_apellido
      FROM usuarios
      WHERE usr_cedula = ?
    `, [usr_cedula]);

    let nombreCompleto = usr_cedula; // Por defecto, la cédula
    if (rowsUser.length > 0) {
      const u = rowsUser[0];
      // Construimos el nombre completo
      const segNombre = u.usr_segundo_nombre ? ` ${u.usr_segundo_nombre}` : '';
      const segApellido = u.usr_segundo_apellido ? ` ${u.usr_segundo_apellido}` : '';
      nombreCompleto = `${u.usr_primer_nombre}${segNombre} ${u.usr_primer_apellido}${segApellido}`.trim();
    }

    // 3. Obtener el préstamo y su historial actual
    const [prestamo] = await db.execute(
      "SELECT historial_estados FROM prestamos WHERE pre_id = ?",
      [pre_id]
    );

    let historial = [];
    if (prestamo.length > 0 && prestamo[0].historial_estados) {
      try {
        historial = JSON.parse(prestamo[0].historial_estados);
      } catch (error) {
        console.error("Error al parsear historial_estados:", error);
        historial = []; 
      }
    }

    // 4. Agregar la nueva entrada de estado al historial, usando el nombre completo
    historial.push({
      estado: estado[0].est_nombre,
      usuario: nombreCompleto,
      fecha: new Date().toISOString().slice(0, 19).replace("T", " ")
    });

    // 5. Preparar la actualización de la tabla 'prestamos'
    let query = `UPDATE prestamos 
                 SET est_id = ?, historial_estados = ?, pre_actualizacion = NOW() 
                 WHERE pre_id = ?`;
    let values = [est_id, JSON.stringify(historial), pre_id];

    // Si el estado es "Entregado" (4) o "Cancelado" (5), también se actualiza pre_fin
    if (est_id == 4 || est_id == 5) {
      query = `UPDATE prestamos 
               SET est_id = ?, historial_estados = ?, pre_actualizacion = NOW(), pre_fin = NOW() 
               WHERE pre_id = ?`;
    }

    // 6. Ejecutar la actualización
    const [result] = await db.execute(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        respuesta: false,
        mensaje: "Préstamo no encontrado"
      });
    }

    // 7. Responder con el nuevo estado y el historial
    res.json({
      respuesta: true,
      mensaje: "Estado actualizado correctamente",
      nuevo_estado: estado[0].est_nombre,
      historial_estados: historial
    });

  } catch (err) {
    console.error("Error en la base de datos:", err);
    res.status(500).json({
      respuesta: false,
      mensaje: "Error interno del servidor",
      error: err.message
    });
  }
};

const cancelarPrestamo = async (req, res) => {
  console.log("🔍 Parámetros recibidos para cancelar:", req.params);

  const pre_id = Number(req.params.pre_id);

  if (!pre_id) {
      return res.status(400).json({ success: false, message: "ID del préstamo es requerido" });
  }

  try {
      const resultado = await Prestamo.cancelarPrestamo(pre_id);
      return res.status(200).json(resultado);
  } catch (error) {
      console.error("❌ Error al cancelar el préstamo:", error);
      return res.status(500).json({ success: false, message: error.message });
  }
};

// Obtener el historial de un préstamo
const obtenerHistorialEstado = async (req, res) => {
  try {
    const pre_id = req.params.pre_id;

    // Llamamos al modelo para obtener el historial
    const historial = await Prestamo.obtenerHistorialEstado(pre_id);

    // Si no hay préstamo o no existe el registro, retornamos 404
    if (!historial) {
      return res.status(404).json({
        respuesta: false,
        mensaje: 'Préstamo no encontrado o sin historial.'
      });
    }

    // Devolvemos el historial como arreglo
    return res.json({
      respuesta: true,
      data: historial
    });
  } catch (error) {
    console.error('Error al obtener historial:', error);
    return res.status(500).json({
      respuesta: false,
      mensaje: 'Error al obtener historial'
    });
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
};