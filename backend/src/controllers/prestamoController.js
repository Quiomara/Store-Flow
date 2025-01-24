const Prestamo = require("../models/prestamoModel");
const PrestamoElemento = require("../models/prestamoElementoModel");
const Elemento = require("../models/elementoModel");
const Estado = require("../models/estadoModel");

// Función para manejar errores
const manejarError = (res, mensaje, err) => {
  console.error(mensaje, err.stack);
  return res.status(500).json({ respuesta: false, mensaje });
};

// Crear Préstamo
const crearPrestamo = async (req, res) => {
  try {
    console.log("Datos recibidos en crearPrestamo:", req.body);

    const data = {
      pre_inicio: new Date(),
      pre_fin: req.body.pre_fin,
      usr_cedula: req.body.cedulaSolicitante,
      est_id: 1, // Estado predeterminado "Creado"
      elementos: req.body.elementos
    };

    if (!data.usr_cedula) {
      throw new Error("La cédula del solicitante es nula o no se proporcionó.");
    }

    // Crear el préstamo
    const prestamoResult = await new Promise((resolve, reject) => {
      Prestamo.crear(data, (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });

    const prestamoId = prestamoResult.insertId;
    console.log("ID del préstamo creado:", prestamoId);

    // Crear elementos del préstamo y actualizar cantidad del inventario
    for (const elemento of data.elementos) {
      const prestamoElementoData = {
        pre_id: prestamoId,
        ele_id: elemento.ele_id,
        pre_ele_cantidad_prestado: elemento.ele_cantidad,
      };

      await new Promise((resolve, reject) => {
        PrestamoElemento.crear(prestamoElementoData, (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        });
      });

      await new Promise((resolve, reject) => {
        Elemento.actualizarCantidad(elemento.ele_id, -elemento.ele_cantidad, (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        });
      });
    }

    res.status(201).json({ respuesta: true, mensaje: "¡Préstamo creado con éxito!", id: prestamoId });
  } catch (error) {
    manejarError(res, `Error al crear el préstamo: ${error.message}`, error);
  }
};

//Actualizar Prestamo

const actualizarPrestamo = (req, res) => {
  const data = req.body;
  const { tip_usr_id: userRole, usr_cedula: userCedula } = req.user;

  Prestamo.obtenerEstadoYUsuarioPorId(data.pre_id, (err, results) => {
    if (err) return res.status(500).json({ respuesta: false, mensaje: "Error al obtener el préstamo.", err });
    if (results.length === 0) {
      return res.status(404).json({ respuesta: false, mensaje: "Préstamo no encontrado." });
    }

    const { est_id, usr_cedula } = results[0];

    if (userRole === 2 && userCedula !== usr_cedula) {
      return res.status(403).json({
        respuesta: false,
        mensaje: "No tiene permiso para actualizar este préstamo.",
      });
    }

    if (![1, 2].includes(est_id)) {
      return res.status(400).json({
        respuesta: false,
        mensaje: 'El préstamo no se puede actualizar, ya que no está en estado "Creado" o "En Proceso".',
      });
    }

    const updateData = {
      pre_id: data.pre_id,
      pre_inicio: results[0].pre_inicio, // No se actualiza la fecha de inicio
      pre_fin: userRole === 3 ? data.pre_fin : results[0].pre_fin, // Solo almacén puede actualizar la fecha fin
      usr_cedula: data.usr_cedula,
      est_id: userRole === 3 ? data.est_id : est_id, // Solo almacén puede actualizar el estado
      pre_actualizacion: new Date(),
    };

    // Actualizar el préstamo
    Prestamo.actualizar(updateData, (err) => {
      if (err) {
        return res.status(500).json({ respuesta: false, mensaje: "Error al actualizar el préstamo.", err });
      }

      // Actualizar la cantidad de elementos en la tabla Elementos
      if (data.ele_id && data.ele_cantidad) {
        Prestamo.actualizarCantidad(data.ele_id, data.ele_cantidad, (err) => {
          if (err) {
            return res.status(500).json({ respuesta: false, mensaje: "Error al actualizar la cantidad de elementos.", err });
          }
          res.json({ respuesta: true, mensaje: "¡Préstamo y cantidad de elementos actualizados con éxito!" });
        });
      } else {
        res.json({ respuesta: true, mensaje: "¡Préstamo actualizado con éxito!" });
      }
    });
  });
};

// Eliminar Préstamo
const eliminarPrestamo = (req, res) => {
  const { pre_id } = req.params;
  const { tip_usr_id: userRole, usr_cedula: userCedula } = req.user;

  Prestamo.obtenerEstadoYUsuarioPorId(pre_id, async (err, results) => {
    if (err) return manejarError(res, "Error al obtener el préstamo.", err);
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

    try {
      const elementos = await PrestamoElemento.obtenerPorPrestamoId(pre_id);

      // Devolver las cantidades de los elementos al inventario
      for (const elemento of elementos) {
        await new Promise((resolve, reject) => {
          Elemento.actualizarCantidad(elemento.ele_id, elemento.pre_ele_cantidad_prestado, (err) => {
            if (err) {
              console.error("Error al actualizar la cantidad del elemento:", err.stack);
              reject(err);
            } else {
              console.log("Cantidad del elemento actualizada con éxito.");
              resolve();
            }
          });
        });
      }

      // Eliminar los elementos del préstamo
      await new Promise((resolve, reject) => {
        PrestamoElemento.eliminarPorPrestamoId(pre_id, (err, results) => {
          if (err) {
            console.error("Error al eliminar elementos del préstamo:", err.stack);
            reject(err);
          } else {
            console.log("Elementos del préstamo eliminados con éxito.");
            resolve();
          }
        });
      });

      // Eliminar el préstamo
      Prestamo.eliminar(pre_id, (err, results) => {
        if (err) return manejarError(res, "Error al eliminar el préstamo.", err);
        if (results.affectedRows === 0) {
          return res.status(404).json({ respuesta: false, mensaje: "Préstamo no encontrado." });
        }
        res.json({ respuesta: true, mensaje: "¡Préstamo eliminado con éxito!" });
      });
    } catch (error) {
      manejarError(res, "Error al actualizar los elementos del préstamo.", error);
    }
  });
};

// Obtener Todos los Préstamos
const obtenerTodosPrestamos = (req, res) => {
  Prestamo.obtenerTodos((err, results) => {
    if (err) return manejarError(res, "Error al obtener los préstamos.", err);
    res.json({
      respuesta: true,
      mensaje: "¡Préstamos obtenidos con éxito!",
      data: results,
    });
  });
};

// Obtener Préstamo por ID
const obtenerPrestamoPorId = (req, res) => {
  const { pre_id } = req.params;
  Prestamo.obtenerPorId(pre_id, (err, results) => {
    if (err) return manejarError(res, "Error al obtener el préstamo.", err);
    if (results.length === 0)
      return res
        .status(404)
        .json({ respuesta: false, mensaje: "Préstamo no encontrado." });
    res.json({
      respuesta: true,
      mensaje: "¡Préstamo obtenido con éxito!",
      data: results[0],
    });
  });
};

// Obtener préstamos por cédula
const obtenerPrestamosPorCedula = (req, res) => {
  const { usr_cedula } = req.params;

  Prestamo.obtenerPorCedula(usr_cedula, (err, results) => {
    if (err) return manejarError(res, 'Error al obtener los préstamos.', err);
    res.json(results);  // Simplemente retornar los resultados ya con est_nombre
  });
};

// Método faltante: obtenerElementoPrestamos
const obtenerElementoPrestamos = (req, res) => {
  const { pre_id } = req.params;
  PrestamoElemento.obtenerPorPrestamoId(pre_id)
    .then((elementos) => {
      res.json({
        respuesta: true,
        mensaje: "¡Elementos del préstamo obtenidos con éxito!",
        data: elementos,
      });
    })
    .catch((err) => {
      manejarError(res, "Error al obtener los elementos del préstamo.", err);
    });
};


module.exports = {
  crearPrestamo,
  actualizarPrestamo,
  eliminarPrestamo,
  obtenerTodosPrestamos,
  obtenerPrestamoPorId,
  obtenerPrestamosPorCedula,
  obtenerElementoPrestamos, // Asegurarse de que esta función esté exportada
};
