const db = require("../config/db");

/**
 * Módulo para gestionar operaciones de préstamos.
 * @module Prestamo
 */
const Prestamo = {
  /**
   * Crea un nuevo préstamo en la base de datos.
   * Resta la cantidad prestada del stock de cada elemento.
   *
   * Realiza una transacción que:
   * - Inserta un nuevo registro en la tabla "prestamos".
   * - Inserta los elementos asociados en la tabla "PrestamosElementos".
   * - Actualiza el stock de cada elemento restando la cantidad prestada.
   * - Obtiene el nombre completo del usuario a partir de la cédula.
   * - Guarda el historial inicial del préstamo en la columna 'historial_estados'.
   *
   * @async
   * @function crear
   * @param {string} usr_cedula - Cédula del usuario que solicita el préstamo.
   * @param {number} est_id - Identificador del estado inicial del préstamo.
   * @param {Array<{ele_id: number, pre_ele_cantidad_prestado: number}>} elementos - Lista de elementos a prestar.
   * @returns {Promise<number>} ID del préstamo creado.
   * @throws {Error} Si ocurre un error en la transacción.
   */
  crear: async (usr_cedula, est_id, elementos) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      // Insertar el préstamo en la tabla "prestamos"
      const queryPrestamo = "INSERT INTO prestamos (usr_cedula, est_id) VALUES (?, ?)";
      const [result] = await connection.execute(queryPrestamo, [usr_cedula, est_id]);
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
        await connection.execute(queryElementos, [prestamoId, ele_id, pre_ele_cantidad_prestado]);
      }

      // Actualizar el stock de cada elemento restando la cantidad prestada
      const queryRestarStock = `
        UPDATE Elementos
        SET ele_cantidad_actual = ele_cantidad_actual - ?
        WHERE ele_id = ?
      `;
      for (const elemento of elementos) {
        await connection.execute(queryRestarStock, [elemento.pre_ele_cantidad_prestado, elemento.ele_id]);
      }

      // Obtener el nombre completo del usuario a partir de la cédula
      const [rowsUser] = await connection.execute(
        `SELECT 
          usr_primer_nombre,
          usr_segundo_nombre,
          usr_primer_apellido,
          usr_segundo_apellido
         FROM usuarios
         WHERE usr_cedula = ?`,
        [usr_cedula]
      );
      let nombreCompleto = usr_cedula;
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
      await connection.execute(queryUpdateHistorial, [JSON.stringify(historial), prestamoId]);

      await connection.commit();
      connection.release();
      return prestamoId;
    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  },

  /**
   * Actualiza el estado de un préstamo y lo agrega al historial JSON.
   * Si el estado es "Entregado" (4) o "Cancelado" (5) se registra la fecha de finalización.
   *
   * Realiza una transacción que:
   * - Obtiene el nombre completo del usuario a partir de su cédula.
   * - Recupera y parsea el historial actual del préstamo.
   * - Agrega el nuevo estado al historial y lo guarda en la base de datos.
   *
   * @param {number} pre_id - ID del préstamo.
   * @param {number} est_id - Nuevo estado del préstamo.
   * @param {string} usr_cedula - Cédula del usuario que realiza el cambio.
   * @returns {Promise<Object>} Indica si la actualización fue exitosa, por ejemplo, { success: true }.
   * @throws {Error} Lanza un error si ocurre algún problema durante la transacción.
   */
  actualizarEstado: async (pre_id, est_id, usr_cedula) => {
    let pre_fin = null;
    if (est_id === 4 || est_id === 5) {
      pre_fin = new Date().toISOString().slice(0, 19).replace("T", " ");
    }

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      // Obtener nombre completo del usuario
      const [rowsUser] = await conn.execute(
        `SELECT usr_primer_nombre, usr_segundo_nombre, usr_primer_apellido, usr_segundo_apellido
         FROM usuarios WHERE usr_cedula = ?`,
        [usr_cedula]
      );
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

      // Agregar nuevo estado al historial
      historial.push({
        estado: est_id,
        usuario: nombreCompleto,
        fecha: new Date().toISOString().slice(0, 19).replace("T", " ")
      });
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
   *
   * Actualiza los datos del préstamo en la tabla "Prestamos" utilizando la información proporcionada.
   *
   * @param {Object} data - Datos del préstamo a actualizar.
   * @param {string|null} data.pre_fin - Fecha de finalización del préstamo (puede ser null).
   * @param {string} data.usr_cedula - Cédula del usuario asociado al préstamo.
   * @param {number} data.est_id - Estado actual del préstamo.
   * @param {string} data.pre_actualizacion - Fecha de actualización del préstamo.
   * @param {number} data.pre_id - ID del préstamo a actualizar.
   * @returns {Promise<Object>} Resultado de la operación de actualización.
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
 * Actualiza el stock disponible de un elemento en la tabla Elementos.
 * @param {number} ele_id - ID del elemento.
 * @param {number} ele_cantidad_actual - Nueva cantidad disponible.
 * @returns {Promise<Object>} Resultado de la actualización.
 */
  actualizarStockElemento: async (ele_id, ele_cantidad_actual) => {
    const query = `UPDATE Elementos SET ele_cantidad_actual = ? WHERE ele_id = ?`;
    const values = [ele_cantidad_actual, ele_id];
    const [result] = await db.execute(query, values);
    return result;
  },

  /**
   * Actualiza la cantidad prestada de un elemento en un préstamo.
   * @param {number} pre_id - ID del préstamo.
   * @param {number} ele_id - ID del elemento.
   * @param {number} pre_ele_cantidad_prestado - Nueva cantidad prestada.
   * @returns {Promise<Object>} Resultado de la actualización.
   */
  actualizarCantidadPrestada: async (pre_id, ele_id, pre_ele_cantidad_prestado) => {
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
 * @throws {Error} Lanza un error si no se pueden obtener los elementos del préstamo.
 */
  obtenerElementosPrestamo: async (pre_id) => {
    const query = `
    SELECT 
      p.pre_id, 
      p.est_id, 
      e.est_nombre AS estado, 
      pe.ele_id, 
      pe.pre_ele_cantidad_prestado, 
      el.ele_nombre AS nombre,
      el.ele_cantidad_actual  
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
    try {
      const [results] = await db.execute(query, [pre_id]);
      return results;
    } catch (error) {
      console.error("Error al obtener elementos del préstamo:", error);
      throw new Error("No se pudieron obtener los elementos del préstamo.");
    }
  },

  /**
   * Cancela un préstamo si está en estado "Creado" y restaura la cantidad de los elementos prestados.
   * @param {number} pre_id - ID del préstamo a cancelar.
   * @param {string} usr_cedula - Cédula del usuario que cancela el préstamo.
   * @returns {Promise<Object>} - Resultado de la cancelación.
   * @throws {Error} Lanza un error si ocurre algún problema durante la cancelación.
   */
  cancelarPrestamo: async (pre_id, usr_cedula) => {
    if (!usr_cedula) {
      return { success: false, message: "El usuario que cancela el préstamo no está definido." };
    }

    let connection;
    try {
      connection = await db.getConnection();
      await connection.beginTransaction();

      // Obtener el préstamo actual (incluyendo el historial) para verificar el estado
      const [rows] = await connection.execute(
        "SELECT est_id, historial_estados FROM prestamos WHERE pre_id = ?",
        [pre_id]
      );
      if (rows.length === 0) {
        throw new Error("No se encontró el préstamo");
      }
      const estadoActual = rows[0].est_id;
      const historialEstados = rows[0].historial_estados
        ? JSON.parse(rows[0].historial_estados)
        : [];

      const ESTADO_CREADO = 1;
      const ESTADO_CANCELADO = 5;
      if (estadoActual !== ESTADO_CREADO) {
        throw new Error("Solo se pueden cancelar préstamos en estado 'Creado'");
      }

      // Obtener los elementos asociados al préstamo
      const [prestamoElementos] = await connection.execute(
        `SELECT ele_id, pre_ele_cantidad_prestado
       FROM PrestamosElementos
       WHERE pre_id = ?`,
        [pre_id]
      );
      if (prestamoElementos.length === 0) {
        throw new Error("No se encontraron elementos asociados al préstamo.");
      }

      // Restaurar la cantidad de cada elemento prestado
      await Promise.all(prestamoElementos.map(async (elemento) => {
        await connection.execute(
          `UPDATE Elementos
         SET ele_cantidad_actual = ele_cantidad_actual + ?
         WHERE ele_id = ?`,
          [elemento.pre_ele_cantidad_prestado, elemento.ele_id]
        );
      }));

      // Obtener el nombre completo del usuario que cancela el préstamo
      const [rowsUser] = await connection.execute(
        `SELECT usr_primer_nombre, usr_segundo_nombre, usr_primer_apellido, usr_segundo_apellido
       FROM usuarios WHERE usr_cedula = ?`,
        [usr_cedula]
      );
      if (rowsUser.length === 0) {
        throw new Error("No se encontró un usuario con esa cédula.");
      }
      const u = rowsUser[0];
      const segNombre = u.usr_segundo_nombre ? ` ${u.usr_segundo_nombre}` : '';
      const segApellido = u.usr_segundo_apellido ? ` ${u.usr_segundo_apellido}` : '';
      const nombreCompleto = `${u.usr_primer_nombre}${segNombre} ${u.usr_primer_apellido}${segApellido}`.trim();

      // Generar la fecha de cancelación
      const fechaCancelacion = new Date().toISOString().slice(0, 19).replace("T", " ");

      // Agregar la acción "Cancelado" al historial
      historialEstados.push({
        estado: "Cancelado",
        usuario: nombreCompleto,
        fecha: fechaCancelacion
      });

      // Actualizar el estado del préstamo a "Cancelado", registrar la fecha de cancelación y guardar el historial actualizado
      const [result] = await connection.execute(
        "UPDATE prestamos SET est_id = ?, pre_fin = ?, historial_estados = ? WHERE pre_id = ?",
        [ESTADO_CANCELADO, fechaCancelacion, JSON.stringify(historialEstados), pre_id]
      );
      if (result.affectedRows === 0) {
        throw new Error("No se pudo cancelar el préstamo");
      }

      await connection.commit();

      // Obtener datos actualizados después de la cancelación
      const datosActualizados = await Prestamo.obtenerElementosPrestamo(pre_id);

      return {
        success: true,
        message: "Préstamo cancelado y cantidades restauradas correctamente.",
        data: datosActualizados
      };
    } catch (error) {
      if (connection) await connection.rollback();
      throw error;
    } finally {
      if (connection) connection.release();
    }
  },


  /**
 * Marca un préstamo como entregado y restaura la cantidad de los elementos prestados.
 * Realiza una transacción que:
 * - Verifica la existencia del préstamo y obtiene su historial.
 * - Restaura el stock de cada elemento prestado.
 * - Obtiene el nombre completo del usuario que entrega el préstamo.
 * - Actualiza el estado del préstamo a "Entregado" (ID 4), registra la fecha de entrega y actualiza el historial.
 *
 * @param {number} pre_id - ID del préstamo a entregar.
 * @param {string} usr_cedula - Cédula del usuario que entrega el préstamo.
 * @returns {Promise<Object>} Resultado de la entrega del préstamo, que incluye:
 *   {boolean} success - Indica si la operación fue exitosa.
 *   {string} message - Mensaje descriptivo de la operación.
 *   {string} estadoPrestamo - Nuevo estado del préstamo ("Entregado").
 *   {string} fechaEntrega - Fecha de entrega del préstamo.
 *   {Array} data - Datos actualizados del préstamo.
 * @throws {Error} Lanza un error si ocurre algún problema durante la transacción.
 */
  entregarPrestamo: async (pre_id, usr_cedula) => {
    if (!usr_cedula) {
      return { success: false, message: "El usuario que entrega el préstamo no está definido." };
    }

    let connection;
    try {
      connection = await db.getConnection();
      await connection.beginTransaction();

      // Obtener el préstamo actual para extraer el historial y el estado
      const [prestamoRows] = await connection.execute(
        "SELECT est_id, historial_estados FROM prestamos WHERE pre_id = ?",
        [pre_id]
      );
      if (prestamoRows.length === 0) {
        throw new Error("El préstamo no existe.");
      }
      // Si hay historial, se parsea; de lo contrario, se inicia como arreglo vacío
      const historialEstados = prestamoRows[0].historial_estados
        ? JSON.parse(prestamoRows[0].historial_estados)
        : [];

      // Obtener los elementos asociados al préstamo
      const [prestamoElementos] = await connection.execute(
        `SELECT ele_id, pre_ele_cantidad_prestado
       FROM PrestamosElementos
       WHERE pre_id = ?`,
        [pre_id]
      );
      if (prestamoElementos.length === 0) {
        throw new Error("No se encontraron elementos asociados al préstamo.");
      }

      // Restaurar la cantidad de cada elemento prestado
      await Promise.all(prestamoElementos.map(async (elemento) => {
        await connection.execute(
          `UPDATE Elementos
         SET ele_cantidad_actual = ele_cantidad_actual + ?
         WHERE ele_id = ?`,
          [elemento.pre_ele_cantidad_prestado, elemento.ele_id]
        );
      }));

      // Obtener el nombre completo del usuario que entrega el préstamo
      const [rowsUser] = await connection.execute(
        `SELECT usr_primer_nombre, usr_segundo_nombre, usr_primer_apellido, usr_segundo_apellido
       FROM usuarios WHERE usr_cedula = ?`,
        [usr_cedula]
      );
      if (rowsUser.length === 0) {
        throw new Error("No se encontró un usuario con esa cédula.");
      }
      const u = rowsUser[0];
      const segNombre = u.usr_segundo_nombre ? ` ${u.usr_segundo_nombre}` : '';
      const segApellido = u.usr_segundo_apellido ? ` ${u.usr_segundo_apellido}` : '';
      const nombreCompleto = `${u.usr_primer_nombre}${segNombre} ${u.usr_primer_apellido}${segApellido}`.trim();

      // Generar la fecha de entrega
      const fechaEntrega = new Date().toISOString().slice(0, 19).replace("T", " ");

      // Agregar la acción "Entregado" al historial
      historialEstados.push({
        estado: "Entregado",
        usuario: nombreCompleto,
        fecha: fechaEntrega
      });

      // Actualizar el estado del préstamo a "Entregado" (ID 4), registrar la fecha de entrega y guardar el historial actualizado
      const ESTADO_ENTREGADO = 4;
      const [result] = await connection.execute(
        `UPDATE prestamos 
       SET est_id = ?, pre_actualizacion = NOW(), pre_fin = ?, historial_estados = ?
       WHERE pre_id = ?`,
        [ESTADO_ENTREGADO, fechaEntrega, JSON.stringify(historialEstados), pre_id]
      );
      if (result.affectedRows === 0) {
        throw new Error("No se pudo marcar el préstamo como entregado.");
      }

      await connection.commit();

      // (Opcional) Obtener datos actualizados después de la entrega
      const datosActualizados = await Prestamo.obtenerElementosPrestamo(pre_id);
      return {
        success: true,
        message: "Préstamo entregado y cantidades restauradas.",
        estadoPrestamo: "Entregado",
        fechaEntrega: fechaEntrega,
        data: datosActualizados,
      };
    } catch (error) {
      if (connection) await connection.rollback();
      console.error("Error en entregarPrestamo:", error);
      return { success: false, message: "Error al entregar el préstamo", error: error.message };
    } finally {
      if (connection) connection.release();
    }
  }

};

module.exports = Prestamo;
