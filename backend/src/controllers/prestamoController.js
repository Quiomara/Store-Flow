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

// Actualizar Préstamo
const actualizarPrestamo = (req, res) => {
  const data = req.body;
  const { tip_usr_id: userRole, usr_cedula: userCedula } = req.user;

  Prestamo.obtenerEstadoYUsuarioPorId(data.pre_id, (err, results) => {
    if (err) return manejarError(res, "Error al obtener el préstamo.", err);
    if (results.length === 0)
      return res
        .status(404)
        .json({ respuesta: false, mensaje: "Préstamo no encontrado." });

    const { est_id, usr_cedula } = results[0];
    if (userRole === 2 && userCedula !== usr_cedula) {
      return res
        .status(403)
        .json({
          respuesta: false,
          mensaje: "No tiene permiso para actualizar este préstamo.",
        });
    }

    if (![1, 2].includes(est_id)) {
      return res
        .status(400)
        .json({
          respuesta: false,
          mensaje:
            'El préstamo no se puede actualizar, ya que no está en estado "Creado" o "En Proceso".',
        });
    }

    const updateData = {
      ...data,
      pre_actualizacion: new Date(),
      pre_fin: data.est_id === 4 ? new Date() : null,
    };
    Prestamo.actualizar(updateData, (err) => {
      if (err)
        return manejarError(res, "Error al actualizar el préstamo.", err);
      res.json({
        respuesta: true,
        mensaje: "¡Préstamo actualizado con éxito!",
      });
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

// Obtener Elemento de Préstamos por ID
const obtenerElementoPrestamos = async (req, res) => {
  try {
    const prestamoId = req.params.pre_id;
    console.log("Buscando préstamo con ID:", prestamoId);
    
    const prestamo = await new Promise((resolve, reject) => {
      Prestamo.obtenerPorId(prestamoId, (err, results) => {
        if (err) {
          console.log("Error al obtener el préstamo:", err);
          reject(err);
        } else {
          console.log("Resultados de obtenerPorId:", results);
          resolve(results);
        }
      });
    });

    if (!prestamo || prestamo.length === 0) {
      console.log("Préstamo no encontrado.");
      return res.status(404).json({ respuesta: false, mensaje: 'Préstamo no encontrado' });
    }

    console.log("Préstamo encontrado:", prestamo);

    const elementos = await PrestamoElemento.obtenerPorPrestamoId(prestamoId);
    console.log("Elementos del préstamo:", elementos);

    if (!elementos || elementos.length === 0) {
      console.log("Elementos no encontrados para el préstamo.");
      return res.status(404).json({ respuesta: false, mensaje: 'Elementos no encontrados para el préstamo' });
    }

    const items = await Promise.all(elementos.map(async (elem) => {
      const elemento = await Elemento.obtenerPorId(elem.ele_id);
      console.log("Elemento encontrado:", elemento);

      return {
        nombreElemento: elemento.nombre,
        cantidad: elem.pre_ele_cantidad_prestado
      };
    }));

    res.status(200).json({
      idPrestamo: prestamo[0].pre_id,
      estadoPrestamo: prestamo[0].est_nombre,
      items
    });
  } catch (error) {
    console.log("Error en obtenerElementoPrestamos:", error);
    manejarError(res, 'Error al obtener los elementos del préstamo', error);
  }
};



module.exports = {
  crearPrestamo,
  actualizarPrestamo,
  eliminarPrestamo,
  obtenerTodosPrestamos,
  obtenerPrestamoPorId,
  obtenerPrestamosPorCedula,
  obtenerElementoPrestamos
};
