const db = require("../config/db");

const Prestamo = {
  crear: async (usr_cedula, est_id, elementos) => {
      const connection = await db.getConnection();
      try {
          await connection.beginTransaction(); // Inicia transacción

          // Insertar el préstamo en la tabla "prestamos"
          const queryPrestamo = "INSERT INTO prestamos (usr_cedula, est_id) VALUES (?, ?)";
          const [result] = await connection.execute(queryPrestamo, [usr_cedula, est_id]);
          const prestamoId = result.insertId;

          if (!prestamoId) {
              throw new Error("No se pudo obtener el ID del préstamo.");
          }

          console.log("✅ Préstamo creado con ID:", prestamoId);

          // Insertar los elementos en la tabla "PrestamosElementos"
          const queryElementos = `
              INSERT INTO PrestamosElementos (pre_id, ele_id, pre_ele_cantidad_prestado)
              VALUES (?, ?, ?)
          `;

          for (const elemento of elementos) {
              const { ele_id, pre_ele_cantidad_prestado } = elemento;
              await connection.execute(queryElementos, [prestamoId, ele_id, pre_ele_cantidad_prestado]);
          }

          await connection.commit(); // Confirmar transacción
          connection.release();

          return prestamoId;
      } catch (error) {
          await connection.rollback(); // Revertir cambios en caso de error
          console.error("❌ Error al crear el préstamo:", error.message);
          throw error;
      }
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
    const values = [
      data.pre_fin,
      data.usr_cedula,
      data.est_id,
      data.pre_actualizacion,
      data.pre_id,
    ];
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
  DATE_FORMAT(p.pre_inicio, '%Y-%m-%dT%H:%i:%sZ') AS pre_inicio, -- Agrega 'Z' al final
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

    const prestamosConElementos = prestamos.map((prestamo) => {
      const elementosPrestamo = elementos.filter(
        (elemento) => elemento.pre_id === prestamo.pre_id
      );
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
  actualizarCantidadElemento: async (
    pre_id,
    ele_id,
    pre_ele_cantidad_prestado
  ) => {
    const query = `UPDATE PrestamosElementos SET pre_ele_cantidad_prestado = ? WHERE pre_id = ? AND ele_id = ?`;
    const [result] = await db.execute(query, [
      pre_ele_cantidad_prestado,
      pre_id,
      ele_id,
    ]);
    return result;
  },
};

module.exports = Prestamo;
