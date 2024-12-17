const Prestamo = require('../models/prestamoModel');

const crearPrestamo = (req, res) => {
  const data = req.body;
  data.pre_inicio = new Date(); // Establecer la fecha de inicio como la fecha y hora actual

  Prestamo.crear(data, (err, results) => {
    if (err) {
      console.error('Error al crear el préstamo:', err.stack);
      return res.status(500).json({ respuesta: false, mensaje: 'Error al crear el préstamo.' });
    }
    res.json({ respuesta: true, mensaje: '¡Préstamo creado con éxito!' });
  });
};

const actualizarPrestamo = (req, res) => {
  const data = req.body;
  const userRole = req.user.tip_usr_id;
  const userCedula = req.user.usr_cedula;

  // Obtener el préstamo y su estado
  Prestamo.obtenerEstadoYUsuarioPorId(data.pre_id, (err, results) => {
    if (err) {
      console.error('Error al obtener el préstamo:', err.stack);
      return res.status(500).json({ respuesta: false, mensaje: 'Error al obtener el préstamo.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ respuesta: false, mensaje: 'Préstamo no encontrado.' });
    }

    const { est_id, usr_cedula } = results[0];

    // Verificar si el usuario es instructor y si el préstamo le pertenece
    if (userRole === 2 && userCedula !== usr_cedula) {
      return res.status(403).json({ respuesta: false, mensaje: 'No tiene permiso para actualizar este préstamo.' });
    }

    // Verificar si el estado es "Creado" o "En Proceso" (asumimos est_id 1 es "Creado" y 2 es "En Proceso")
    if (est_id !== 1 && est_id !== 2) {
      return res.status(400).json({ respuesta: false, mensaje: 'El préstamo no se puede actualizar, ya que no está en estado "Creado" o "En Proceso".' });
    }

    // Establecer la fecha de actualización como la fecha y hora actual
    data.pre_actualizacion = new Date();

    // Si se está devolviendo el préstamo, establecer la fecha de fin automáticamente
    if (data.est_id === 4) { // Asumimos que est_id 4 es el estado de "Devuelto"
      data.pre_fin = new Date();
    }

    // Actualizar el préstamo si el estado y la propiedad son válidos
    Prestamo.actualizar(data, (err, results) => {
      if (err) {
        console.error('Error al actualizar el préstamo:', err.stack);
        return res.status(500).json({ respuesta: false, mensaje: 'Error al actualizar el préstamo.' });
      }

      res.json({ respuesta: true, mensaje: '¡Préstamo actualizado con éxito!' });
    });
  });
};

const eliminarPrestamo = (req, res) => {
  const pre_id = req.params.pre_id;
  const userRole = req.user.tip_usr_id;
  const userCedula = req.user.usr_cedula;

  // Obtener el préstamo y su estado
  Prestamo.obtenerEstadoYUsuarioPorId(pre_id, (err, results) => {
    if (err) {
      console.error('Error al obtener el préstamo:', err.stack);
      return res.status(500).json({ respuesta: false, mensaje: 'Error al obtener el préstamo.' });
    }

    if (results.length === 0) {
      return res.status(404).json({ respuesta: false, mensaje: 'Préstamo no encontrado.' });
    }

    const { est_id, usr_cedula } = results[0];

    // Verificar si el usuario es instructor y si el préstamo le pertenece
    if (userRole === 2 && userCedula !== usr_cedula) {
      return res.status(403).json({ respuesta: false, mensaje: 'No tiene permiso para eliminar este préstamo.' });
    }

    // Verificar si el estado es "Creado" o "En Proceso" (asumimos est_id 1 es "Creado" y 2 es "En Proceso")
    if (est_id !== 1 && est_id !== 2) {
      return res.status(400).json({ respuesta: false, mensaje: 'El préstamo no se puede eliminar, ya que no está en estado "Creado" o "En Proceso".' });
    }

    // Eliminar el préstamo si el estado y la propiedad son válidos
    Prestamo.eliminar(pre_id, (err, results) => {
      if (err) {
        console.error('Error al eliminar el préstamo:', err.stack);
        return res.status(500).json({ respuesta: false, mensaje: 'Error al eliminar el préstamo.' });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ respuesta: false, mensaje: 'Préstamo no encontrado.' });
      }

      res.json({ respuesta: true, mensaje: '¡Préstamo eliminado con éxito!' });
    });
  });
};

const obtenerTodosPrestamos = (req, res) => {
  Prestamo.obtenerTodos((err, results) => {
    if (err) {
      console.error('Error al obtener los préstamos:', err.stack);
      return res.status(500).json({ respuesta: false, mensaje: 'Error al obtener los préstamos.' });
    }
    res.json({ respuesta: true, mensaje: '¡Préstamos obtenidos con éxito!', data: results });
  });
};

const obtenerPrestamoPorId = (req, res) => {
  const pre_id = req.params.pre_id;
  Prestamo.obtenerPorId(pre_id, (err, results) => {
    if (err) {
      console.error('Error al obtener el préstamo:', err.stack);
      return res.status(500).json({ respuesta: false, mensaje: 'Error al obtener el préstamo.' });
    }
    if (results.length === 0) {
      return res.status(404).json({ respuesta: false, mensaje: 'Préstamo no encontrado.' });
    }
    res.json({ respuesta: true, mensaje: '¡Préstamo obtenido con éxito!', data: results[0] });
  });
};

module.exports = {
  crearPrestamo,
  actualizarPrestamo,
  eliminarPrestamo,
  obtenerTodosPrestamos,
  obtenerPrestamoPorId
};





