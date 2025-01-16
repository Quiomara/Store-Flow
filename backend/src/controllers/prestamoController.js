const Prestamo = require('../models/prestamoModel');
const PrestamoElemento = require('../models/prestamoElementoModel');
const Elemento = require('../models/elementoModel');

// Función para manejar errores
const manejarError = (res, mensaje, err) => {
  console.error(mensaje, err.stack);
  return res.status(500).json({ respuesta: false, mensaje });
};

// Crear Préstamo
const crearPrestamo = (req, res) => {
  console.log('Datos recibidos en crearPrestamo:', req.body);

  const data = { 
    pre_inicio: new Date(),
    pre_fin: null,
    usr_cedula: req.body.cedulaSolicitante,
    est_id: 1, // Asume que el estado inicial es 1 (puede variar según tu lógica)
    elementos: req.body.elementos
  };
  console.log('Datos para crear el préstamo:', data);

  if (!data.usr_cedula) {
    return manejarError(res, 'Error: La cédula del solicitante es nula o no se proporcionó.', new Error('Cédula del solicitante nula'));
  }

  Prestamo.crear(data, (err, result) => {
    if (err) return manejarError(res, 'Error al crear el préstamo.', err);

    const prestamoId = result.insertId;
    const elementos = data.elementos;
    console.log('ID del préstamo creado:', prestamoId);

    // Crear Préstamos de Elementos asociados
    elementos.forEach(elemento => {
      const prestamoElementoData = {
        pre_id: prestamoId,
        ele_id: elemento.ele_id,
        pre_ele_cantidad_prestado: elemento.ele_cantidad
      };

      console.log('Intentando insertar en PrestamosElementos:', prestamoElementoData);
      PrestamoElemento.crear(prestamoElementoData, (err) => {
        if (err) {
          console.error('Error al crear el préstamo de elemento:', err.stack);
        } else {
          console.log('Préstamo de elemento creado con éxito:', prestamoElementoData);

          // Actualizar la cantidad del elemento en el inventario
          Elemento.actualizarCantidad(elemento.ele_id, -elemento.ele_cantidad, (err) => {
            if (err) {
              console.error('Error al actualizar la cantidad del elemento:', err.stack);
            } else {
              console.log('Cantidad del elemento actualizada con éxito.');
            }
          });
        }
      });
    });

    res.json({ respuesta: true, mensaje: '¡Préstamo creado con éxito!', id: prestamoId });
  });
};

// Actualizar Préstamo
const actualizarPrestamo = (req, res) => {
  const data = req.body;
  const { tip_usr_id: userRole, usr_cedula: userCedula } = req.user;

  Prestamo.obtenerEstadoYUsuarioPorId(data.pre_id, (err, results) => {
    if (err) return manejarError(res, 'Error al obtener el préstamo.', err);
    if (results.length === 0) return res.status(404).json({ respuesta: false, mensaje: 'Préstamo no encontrado.' });

    const { est_id, usr_cedula } = results[0];
    if (userRole === 2 && userCedula !== usr_cedula) {
      return res.status(403).json({ respuesta: false, mensaje: 'No tiene permiso para actualizar este préstamo.' });
    }

    if (![1, 2].includes(est_id)) {
      return res.status(400).json({ respuesta: false, mensaje: 'El préstamo no se puede actualizar, ya que no está en estado "Creado" o "En Proceso".' });
    }

    const updateData = { ...data, pre_actualizacion: new Date(), pre_fin: data.est_id === 4 ? new Date() : null };
    Prestamo.actualizar(updateData, (err) => {
      if (err) return manejarError(res, 'Error al actualizar el préstamo.', err);
      res.json({ respuesta: true, mensaje: '¡Préstamo actualizado con éxito!' });
    });
  });
};

// Eliminar Préstamo
const eliminarPrestamo = (req, res) => {
  const { pre_id } = req.params;
  const { tip_usr_id: userRole, usr_cedula: userCedula } = req.user;

  Prestamo.obtenerEstadoYUsuarioPorId(pre_id, (err, results) => {
    if (err) return manejarError(res, 'Error al obtener el préstamo.', err);
    if (results.length === 0) return res.status(404).json({ respuesta: false, mensaje: 'Préstamo no encontrado.' });

    const { est_id, usr_cedula } = results[0];
    if (userRole === 2 && userCedula !== usr_cedula) {
      return res.status(403).json({ respuesta: false, mensaje: 'No tiene permiso para eliminar este préstamo.' });
    }

    if (![1, 2].includes(est_id)) {
      return res.status(400).json({ respuesta: false, mensaje: 'El préstamo no se puede eliminar, ya que no está en estado "Creado" o "En Proceso".' });
    }

    Prestamo.eliminar(pre_id, (err, results) => {
      if (err) return manejarError(res, 'Error al eliminar el préstamo.', err);
      if (results.affectedRows === 0) return res.status(404).json({ respuesta: false, mensaje: 'Préstamo no encontrado.' });
      res.json({ respuesta: true, mensaje: '¡Préstamo eliminado con éxito!' });
    });
  });
};

// Obtener Todos los Préstamos
const obtenerTodosPrestamos = (req, res) => {
  Prestamo.obtenerTodos((err, results) => {
    if (err) return manejarError(res, 'Error al obtener los préstamos.', err);
    res.json({ respuesta: true, mensaje: '¡Préstamos obtenidos con éxito!', data: results });
  });
};

// Obtener Préstamo por ID
const obtenerPrestamoPorId = (req, res) => {
  const { pre_id } = req.params;
  Prestamo.obtenerPorId(pre_id, (err, results) => {
    if (err) return manejarError(res, 'Error al obtener el préstamo.', err);
    if (results.length === 0) return res.status(404).json({ respuesta: false, mensaje: 'Préstamo no encontrado.' });
    res.json({ respuesta: true, mensaje: '¡Préstamo obtenido con éxito!', data: results[0] });
  });
};

// Obtener Estados
const obtenerEstados = (req, res) => {
  Prestamo.obtenerEstados((err, results) => {
    if (err) return manejarError(res, 'Error al obtener los estados.', err);
    res.json({ respuesta: true, mensaje: '¡Estados obtenidos con éxito!', data: results });
  });
};

// Crear Préstamo de Elemento
const crearPrestamoElemento = (req, res) => {
  const data = req.body;
  PrestamoElemento.crear(data, (err) => {
    if (err) return manejarError(res, 'Error al crear el préstamo de elemento.', err);
    res.json({ respuesta: true, mensaje: '¡Préstamo de elemento creado con éxito!' });
  });
};

// Actualizar Préstamo de Elemento
const actualizarPrestamoElemento = (req, res) => {
  const data = req.body;
  PrestamoElemento.actualizar(data, (err) => {
    if (err) return manejarError(res, 'Error al actualizar el préstamo de elemento.', err);
    res.json({ respuesta: true, mensaje: '¡Préstamo de elemento actualizado con éxito!' });
  });
};

// Eliminar Préstamo de Elemento
const eliminarPrestamoElemento = (req, res) => {
  const { pre_ele_id } = req.params;
  PrestamoElemento.eliminar(pre_ele_id, (err, results) => {
    if (err) return manejarError(res, 'Error al eliminar el préstamo de elemento.', err);
    if (results.affectedRows === 0) return res.status(404).json({ respuesta: false, mensaje: 'Préstamo de elemento no encontrado.' });
    res.json({ respuesta: true, mensaje: '¡Préstamo de elemento eliminado con éxito!' });
  });
};

// Obtener Todos los Préstamos de Elementos
const obtenerTodosPrestamosElementos = (req, res) => {
  PrestamoElemento.obtenerTodos((err, results) => {
    if (err) return manejarError(res, 'Error al obtener los préstamos de elementos.', err);
    res.json({ respuesta: true, mensaje: '¡Préstamos de elementos obtenidos con éxito!', data: results });
  });
};

// Obtener Préstamo de Elemento por ID
const obtenerPrestamoElementoPorId = (req, res) => {
  const { pre_ele_id } = req.params;
  PrestamoElemento.obtenerPorId(pre_ele_id, (err, results) => {
    if (err) return manejarError(res, 'Error al obtener el préstamo de elemento.', err);
    if (results.length === 0) return res.status(404).json({ respuesta: false, mensaje: 'Préstamo de elemento no encontrado.' });
    res.json({ respuesta: true, mensaje: '¡Préstamo de elemento obtenido con éxito!', data: results[0] });
  });
};

module.exports = {
  crearPrestamo,
  actualizarPrestamo,
  eliminarPrestamo,
  obtenerTodosPrestamos,
  obtenerPrestamoPorId,
  crearPrestamoElemento,
  actualizarPrestamoElemento,
  eliminarPrestamoElemento,
  obtenerTodosPrestamosElementos,
  obtenerPrestamoElementoPorId
};




