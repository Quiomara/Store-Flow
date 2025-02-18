const db = require('../config/db');

const Prestamo = {
  crear: async (data) => {
    console.log('Intentando insertar en la base de datos:', data); // Log de los datos a insertar
    const query = `INSERT INTO Prestamos (pre_inicio, usr_cedula, est_id) VALUES (?, ?, ?)`;
    const values = [data.pre_inicio, data.usr_cedula, data.est_id];
    const [result] = await db.execute(query, values);
    console.log('Resultado de la inserción:', result); // Log del resultado de la inserción
    return { insertId: result.insertId };
  },

   // Actualizar el estado de un préstamo
  actualizarEstado: async (pre_id, est_id) => {
    const query = `UPDATE Prestamos SET est_id = ? WHERE pre_id = ?`;
    const values = [est_id, pre_id];
    const [result] = await db.execute(query, values);
    return result;
  },

  // Actualizar un préstamo
  actualizar: async (data) => {
    const query = `UPDATE Prestamos SET pre_fin = ?, usr_cedula = ?, est_id = ?, pre_actualizacion = ? WHERE pre_id = ?`;
    const values = [data.pre_fin, data.usr_cedula, data.est_id, data.pre_actualizacion, data.pre_id];
    const [result] = await db.execute(query, values);
    return result;
  },

  // Actualizar la cantidad prestada de un elemento
  actualizarCantidadElemento: async (ele_id, ele_cantidad) => {
    const query = `UPDATE Elementos SET ele_cantidad = ? WHERE ele_id = ?`;
    const values = [ele_cantidad, ele_id];
    const [result] = await db.execute(query, values);
    return result;
  },

  // Eliminar un préstamo
  eliminar: async (pre_id) => {
    const query = `DELETE FROM Prestamos WHERE pre_id = ?`;
    const [result] = await db.execute(query, [pre_id]);
    return result;
  },

  // Obtener todos los préstamos
  obtenerTodos: async () => {
    const query = `
      SELECT 
        p.pre_id, 
        p.pre_inicio, 
        p.pre_fin, 
        u.usr_cedula, 
        CONCAT(u.usr_primer_nombre, ' ', u.usr_segundo_nombre, ' ', u.usr_primer_apellido, ' ', u.usr_segundo_apellido) AS usr_nombre, 
        e.est_nombre,
        p.pre_actualizacion
      FROM Prestamos p
      JOIN Usuarios u ON p.usr_cedula = u.usr_cedula
      JOIN Estados e ON p.est_id = e.est_id
      ORDER BY p.pre_inicio DESC;
    `;
    const [prestamos] = await db.execute(query);

    const elementosQuery = `
      SELECT 
        pe.pre_id, 
        pe.ele_id, 
        el.ele_nombre, 
        pe.pre_ele_cantidad_prestado 
      FROM PrestamosElementos pe
      JOIN Elementos el ON pe.ele_id = el.ele_id
    `;
    const [elementos] = await db.execute(elementosQuery);

    const prestamosConElementos = prestamos.map(prestamo => {
      const elementosPrestamo = elementos.filter(elemento => elemento.pre_id === prestamo.pre_id);
      prestamo.elementos = elementosPrestamo;
      return prestamo;
    });

    return prestamosConElementos;
  },

  // Obtener un préstamo por ID
  obtenerPorId: async (pre_id) => {
    const query = `SELECT p.pre_id, p.est_id, e.est_nombre 
                   FROM Prestamos p 
                   JOIN Estados e ON p.est_id = e.est_id 
                   WHERE p.pre_id = ?`;
    const [results] = await db.execute(query, [pre_id]);
    return results[0];
  },

  // Obtener préstamos por cédula de usuario
  obtenerPorCedula: async (usr_cedula) => {
    const query = `
      SELECT 
        p.pre_id, 
        p.pre_inicio, 
        p.pre_fin, 
        p.usr_cedula, 
        e.est_nombre, 
        p.pre_actualizacion
      FROM Prestamos p
      JOIN Estados e ON p.est_id = e.est_id
      WHERE p.usr_cedula = ?
      ORDER BY p.pre_inicio DESC;
    `;
    const [results] = await db.execute(query, [usr_cedula]);
    return results;
  },

  // Obtener estado y usuario por ID de préstamo
  obtenerEstadoYUsuarioPorId: async (pre_id) => {
    const query = `SELECT pre_inicio, pre_fin, est_id, usr_cedula FROM Prestamos WHERE pre_id = ?`;
    const [results] = await db.execute(query, [pre_id]);
    return results; // Devuelve un array de resultados
  },

  // Obtener elementos de un préstamo por ID
  obtenerElementosPrestamo: async (pre_id) => {
    const query = `
      SELECT 
        p.pre_id, 
        p.est_id, 
        e.est_nombre AS estado, 
        pe.ele_id, 
        pe.pre_ele_cantidad_prestado, 
        el.ele_nombre AS nombre
      FROM 
        Prestamos p
      JOIN 
        Estados e ON p.est_id = e.est_id
      JOIN 
        PrestamosElementos pe ON p.pre_id = pe.pre_id
      JOIN 
        Elementos el ON pe.ele_id = el.ele_id
      WHERE 
        p.pre_id = ?;
    `;
    const [results] = await db.execute(query, [pre_id]);
    return results;
  },

  // Actualizar la cantidad prestada de un elemento en un préstamo
  actualizarCantidadElemento: async (pre_id, ele_id, pre_ele_cantidad_prestado) => {
    const query = `UPDATE PrestamosElementos SET pre_ele_cantidad_prestado = ? WHERE pre_id = ? AND ele_id = ?`;
    const [result] = await db.execute(query, [pre_ele_cantidad_prestado, pre_id, ele_id]);
    return result;
  },
};

module.exports = Prestamo;
