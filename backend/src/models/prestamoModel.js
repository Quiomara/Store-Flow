const db = require("../config/db");

const Prestamo = {
  /**
   * Crea un nuevo préstamo en la base de datos.
   * @param {string} usr_cedula - Cédula del usuario que solicita el préstamo.
   * @param {number} est_id - Identificador del estado inicial del préstamo.
   * @param {Array<{ele_id: number, pre_ele_cantidad_prestado: number}>} elementos - Lista de elementos a prestar.
   * @returns {Promise<number>} ID del préstamo creado.
   * @throws {Error} Si ocurre un error en la transacción.
   */
  crear: async (usr_cedula, est_id, elementos) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction(); // Inicia transacción
  
      // Insertar el préstamo en la tabla "prestamos"
      const queryPrestamo =
        "INSERT INTO prestamos (usr_cedula, est_id) VALUES (?, ?)";
      const [result] = await connection.execute(queryPrestamo, [
        usr_cedula,
        est_id,
      ]);
      const prestamoId = result.insertId;
  
      if (!prestamoId) {
        throw new Error("No se pudo obtener el ID del préstamo.");
      }
  
      // Insertar los elementos en la tabla "PrestamosElementos"
      const queryElementos = `
        INSERT INTO PrestamosElementos (pre_id, ele_id, pre_ele_cantidad_prestado)
        VALUES (?, ?, ?)
      `;
      for (const elemento of elementos) {
        const { ele_id, pre_ele_cantidad_prestado } = elemento;
        await connection.execute(queryElementos, [
          prestamoId,
          ele_id,
          pre_ele_cantidad_prestado,
        ]);
      }
  
      // Obtener el nombre completo del usuario a partir de la cédula
      const [rowsUser] = await connection.execute(`
        SELECT 
          usr_primer_nombre,
          usr_segundo_nombre,
          usr_primer_apellido,
          usr_segundo_apellido
        FROM usuarios
        WHERE usr_cedula = ?
      `, [usr_cedula]);
  
      let nombreCompleto = usr_cedula; // Valor por defecto
      if (rowsUser.length > 0) {
        const u = rowsUser[0];
        const segNombre = u.usr_segundo_nombre ? ` ${u.usr_segundo_nombre}` : '';
        const segApellido = u.usr_segundo_apellido ? ` ${u.usr_segundo_apellido}` : '';
        nombreCompleto = `${u.usr_primer_nombre}${segNombre} ${u.usr_primer_apellido}${segApellido}`.trim();
      }
  
      // Crear el historial inicial con la acción "Creado"
      const historial = [{
        estado: "Creado",
        usuario: nombreCompleto,
        fecha: new Date().toISOString().slice(0, 19).replace("T", " ")
      }];
  
      // Guardar el historial en la columna 'historial_estados'
      const queryUpdateHistorial = `
        UPDATE prestamos
        SET historial_estados = ?, pre_actualizacion = NOW()
        WHERE pre_id = ?
      `;
      await connection.execute(queryUpdateHistorial, [
        JSON.stringify(historial),
        prestamoId
      ]);
  
      // Confirmar la transacción
      await connection.commit();
      connection.release();
  
      return prestamoId;
    } catch (error) {
      await connection.rollback(); // Revertir cambios en caso de error
      throw error;
    }
  },

  /**
   * Actualiza el estado de un préstamo y lo agrega al historial JSON.
   * @param {number} pre_id - ID del préstamo.
   * @param {number} est_id - Nuevo estado del préstamo.
   * @param {string} usr_cedula - Cédula del usuario que realiza el cambio.
   * @returns {Object} - Indica si la actualización fue exitosa.
   */
  actualizarEstado: async (pre_id, est_id, usr_cedula) => {
    let pre_fin = null;
    // Si el estado es "Entregado" (4) o "Cancelado" (5), se registra la fecha de finalización
    if (est_id === 4 || est_id === 5) {
      pre_fin = new Date().toISOString().slice(0, 19).replace("T", " ");
    }

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      // Obtener el nombre completo del usuario a partir de la cédula
      const [rowsUser] = await conn.execute(
        `SELECT usr_primer_nombre, usr_segundo_nombre, usr_primer_apellido, usr_segundo_apellido
         FROM usuarios WHERE usr_cedula = ?`,
        [usr_cedula]
      );

      // Si no se encuentra el usuario, se usa la cédula como identificador
      let nombreCompleto = usr_cedula;
      if (rowsUser.length > 0) {
        const u = rowsUser[0];
        const segNombre = u.usr_segundo_nombre ? ` ${u.usr_segundo_nombre}` : '';
        const segApellido = u.usr_segundo_apellido ? ` ${u.usr_segundo_apellido}` : '';
        nombreCompleto = `${u.usr_primer_nombre}${segNombre} ${u.usr_primer_apellido}${segApellido}`.trim();
      }

      // Obtener el historial actual del préstamo
      const [prestamo] = await conn.execute(
        "SELECT historial_estados FROM prestamos WHERE pre_id = ?",
        [pre_id]
      );

      let historial = [];
      if (prestamo.length > 0 && prestamo[0].historial_estados) {
        try {
          historial = JSON.parse(prestamo[0].historial_estados);
        } catch (error) {
          historial = [];
        }
      }

      // Agregar el nuevo estado al historial
      historial.push({
        estado: est_id,
        usuario: nombreCompleto,
        fecha: new Date().toISOString().slice(0, 19).replace("T", " ")
      });

      // Convertir el historial a JSON y actualizar la base de datos
      const historialJSON = JSON.stringify(historial);
      const queryUpdate = `
        UPDATE prestamos
        SET est_id = ?, pre_fin = COALESCE(?, pre_fin), historial_estados = ?
        WHERE pre_id = ?
      `;
      await conn.execute(queryUpdate, [est_id, pre_fin, historialJSON, pre_id]);

      await conn.commit();
      return { success: true };
    } catch (error) {
      await conn.rollback();
      throw error;
    } finally {
      conn.release();
    }
  },

  /**
   * Actualiza un préstamo en la base de datos.
   * @param {Object} data - Datos del préstamo a actualizar.
   * @returns {Promise<Object>} Resultado de la actualización.
   */
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

  /**
   * Actualiza la cantidad disponible de un elemento prestado.
   * @param {number} ele_id - ID del elemento.
   * @param {number} ele_cantidad - Nueva cantidad disponible.
   * @returns {Promise<Object>} Resultado de la actualización.
   */
  actualizarCantidadElemento: async (ele_id, ele_cantidad) => {
    const query = `UPDATE Elementos SET ele_cantidad = ? WHERE ele_id = ?`;
    const values = [ele_cantidad, ele_id];
    const [result] = await db.execute(query, values);
    return result;
  },

  /**
   * Elimina un préstamo de la base de datos.
   * @param {number} pre_id - ID del préstamo a eliminar.
   * @returns {Promise<Object>} Resultado de la eliminación.
   */
  eliminar: async (pre_id) => {
    const query = `DELETE FROM Prestamos WHERE pre_id = ?`;
    const [result] = await db.execute(query, [pre_id]);
    return result;
  },

  /**
   * Obtiene todos los préstamos junto con la información del usuario y los elementos prestados.
   * @returns {Promise<Array>} Lista de préstamos con sus detalles.
   */
  obtenerTodos: async () => {
    const query = `
      SELECT 
        p.pre_id, 
        DATE_FORMAT(p.pre_inicio, '%Y-%m-%dT%H:%i:%sZ') AS pre_inicio, 
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

    // Obtener los elementos asociados a cada préstamo
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

    // Asignar elementos a sus respectivos préstamos
    const prestamosConElementos = prestamos.map((prestamo) => {
      const elementosPrestamo = elementos.filter(
        (elemento) => elemento.pre_id === prestamo.pre_id
      );
      prestamo.elementos = elementosPrestamo;
      return prestamo;
    });

    return prestamosConElementos;
  },

  /**
   * Obtiene un préstamo por su ID.
   * @param {number} pre_id - ID del préstamo.
   * @returns {Promise<Object>} - Datos del préstamo.
   */
  obtenerPorId: async (pre_id) => {
    const query = `SELECT p.pre_id, p.est_id, e.est_nombre, p.historial_estados 
                 FROM Prestamos p 
                 JOIN Estados e ON p.est_id = e.est_id 
                 WHERE p.pre_id = ?`;
    const [results] = await db.execute(query, [pre_id]);
    return results[0];
  },

  /**
   * Obtiene todos los préstamos asociados a una cédula de usuario.
   * @param {string} usr_cedula - Cédula del usuario.
   * @returns {Promise<Array>} - Lista de préstamos del usuario.
   */
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

  /**
   * Obtiene el estado y usuario de un préstamo por su ID.
   * @param {number} pre_id - ID del préstamo.
   * @returns {Promise<Array>} - Datos del préstamo con estado y usuario.
   */
  obtenerEstadoYUsuarioPorId: async (pre_id) => {
    const query = `SELECT pre_inicio, pre_fin, est_id, usr_cedula FROM Prestamos WHERE pre_id = ?`;
    const [results] = await db.execute(query, [pre_id]);
    return results;
  },

  /**
   * Obtiene los elementos asociados a un préstamo por su ID.
   * @param {number} pre_id - ID del préstamo.
   * @returns {Promise<Array>} - Lista de elementos en el préstamo.
   */
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

  /**
   * Actualiza la cantidad prestada de un elemento en un préstamo.
   * @param {number} pre_id - ID del préstamo.
   * @param {number} ele_id - ID del elemento.
   * @param {number} pre_ele_cantidad_prestado - Nueva cantidad prestada.
   * @returns {Promise<Object>} - Resultado de la actualización.
   */
  actualizarCantidadElemento: async (pre_id, ele_id, pre_ele_cantidad_prestado) => {
    const query = `UPDATE PrestamosElementos SET pre_ele_cantidad_prestado = ? WHERE pre_id = ? AND ele_id = ?`;
    const [result] = await db.execute(query, [pre_ele_cantidad_prestado, pre_id, ele_id]);
    return result;
  },

  /**
   * Obtiene el historial de estados de un préstamo.
   * @param {number} pre_id - ID del préstamo.
   * @returns {Promise<Array|null>} - Historial de estados o null si no existe.
   */
  obtenerHistorialEstado: async (pre_id) => {
    const query = `SELECT historial_estados FROM prestamos WHERE pre_id = ?`;
    const [rows] = await db.execute(query, [pre_id]);

    if (rows.length === 0) {
      return null;
    }

    const historialStr = rows[0].historial_estados;
    let historial = [];

    if (historialStr) {
      try {
        historial = JSON.parse(historialStr);
      } catch (error) {
        historial = [];
      }
    }

    return historial;
  },

  /**
   * Cancela un préstamo si está en estado "Creado".
   * @param {number} pre_id - ID del préstamo a cancelar.
   * @returns {Promise<Object>} - Resultado de la cancelación.
   */
  cancelarPrestamo: async (pre_id) => {
    const connection = await db.getConnection();
    try {
      // Verificar si el préstamo existe y su estado
      const [rows] = await connection.query(
        "SELECT est_id FROM prestamos WHERE pre_id = ?",
        [pre_id]
      );

      if (rows.length === 0) {
        throw new Error("No se encontró el préstamo");
      }

      const estadoActual = rows[0].est_id;
      const ESTADO_CREADO = 1; // Estado "Creado"
      const ESTADO_CANCELADO = 5; // Estado "Cancelado"

      if (estadoActual !== ESTADO_CREADO) {
        throw new Error("Solo se pueden cancelar préstamos en estado 'Creado'");
      }

      // Actualizar el estado a "Cancelado"
      const [result] = await connection.query(
        "UPDATE prestamos SET est_id = ? WHERE pre_id = ?",
        [ESTADO_CANCELADO, pre_id]
      );

      if (result.affectedRows === 0) {
        throw new Error("No se pudo cancelar el préstamo");
      }

      return { success: true, message: "Préstamo cancelado correctamente" };
    } catch (error) {
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = Prestamo;
