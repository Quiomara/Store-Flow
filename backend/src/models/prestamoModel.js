const db = require("../config/db");

const Prestamo = {
  crear: async (usr_cedula, est_id, elementos) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction(); // Inicia transacción
  
      // 1. Insertar el préstamo en la tabla "prestamos"
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
  
      console.log("✅ Préstamo creado con ID:", prestamoId);
  
      // 2. Insertar los elementos en la tabla "PrestamosElementos"
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
  
      // 3. Obtener el nombre completo del usuario a partir de la cédula
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
  
      // 4. Crear el historial inicial con la acción "Creado"
      const historial = [{
        estado: "Creado",
        usuario: nombreCompleto,
        fecha: new Date().toISOString().slice(0, 19).replace("T", " ")
      }];
  
      // 5. Guardar el historial en la columna 'historial_estados'
      const queryUpdateHistorial = `
        UPDATE prestamos
        SET historial_estados = ?, pre_actualizacion = NOW()
        WHERE pre_id = ?
      `;
      await connection.execute(queryUpdateHistorial, [
        JSON.stringify(historial),
        prestamoId
      ]);
  
      // 6. Confirmar la transacción
      await connection.commit();
      connection.release();
  
      return prestamoId;
    } catch (error) {
      await connection.rollback(); // Revertir cambios en caso de error
      console.error("❌ Error al crear el préstamo:", error.message);
      throw error;
    }
  },
  

  // Actualizar estado de un préstamo y agregarlo al historial JSON
  actualizarEstado: async (pre_id, est_id, usr_cedula) => {
    let pre_fin = null;
    // 4 = Entregado, 5 = Cancelado
    if (est_id == 4 || est_id == 5) {
      pre_fin = new Date().toISOString().slice(0, 19).replace("T", " ");
    }

    const conn = await db.getConnection();
    try {
      await conn.beginTransaction();

      // 1. Obtener el nombre completo del usuario a partir de la cédula
      const [rowsUser] = await conn.execute(`
      SELECT 
        usr_primer_nombre,
        usr_segundo_nombre,
        usr_primer_apellido,
        usr_segundo_apellido
      FROM usuarios
      WHERE usr_cedula = ?
    `, [usr_cedula]);

      // Por defecto, si no se encuentra el usuario, usamos la cédula
      let nombreCompleto = usr_cedula;

      if (rowsUser.length > 0) {
        const u = rowsUser[0];
        // Construimos el nombre completo
        const segNombre = u.usr_segundo_nombre ? ` ${u.usr_segundo_nombre}` : '';
        const segApellido = u.usr_segundo_apellido ? ` ${u.usr_segundo_apellido}` : '';
        nombreCompleto = `${u.usr_primer_nombre}${segNombre} ${u.usr_primer_apellido}${segApellido}`.trim();
      }

      // 2. Obtener historial actual del préstamo
      const [prestamo] = await conn.execute(
        "SELECT historial_estados FROM prestamos WHERE pre_id = ?",
        [pre_id]
      );

      let historial = [];
      if (prestamo.length > 0 && prestamo[0].historial_estados) {
        try {
          historial = JSON.parse(prestamo[0].historial_estados);
        } catch (error) {
          console.error('Error parseando historial_estados:', error);
          historial = [];
        }
      }

      // 3. Agregar nueva acción al historial, guardando el nombre en vez de la cédula
      historial.push({
        estado: est_id,
        usuario: nombreCompleto,
        fecha: new Date().toISOString().slice(0, 19).replace("T", " ")
      });

      // 4. Convertir historial a JSON y actualizar la tabla
      const historialJSON = JSON.stringify(historial);
      const queryUpdate = `
      UPDATE prestamos
      SET est_id = ?, 
          pre_fin = COALESCE(?, pre_fin), 
          historial_estados = ?
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

  // Obtener un préstamo por ID (modelo)
  obtenerPorId: async (pre_id) => {
    const query = `SELECT p.pre_id, p.est_id, e.est_nombre, p.historial_estados 
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

  // Obtener únicamente el historial_estados de un préstamo
  obtenerHistorialEstado: async (pre_id) => {
    const query = `SELECT historial_estados FROM prestamos WHERE pre_id = ?`;
    const [rows] = await db.execute(query, [pre_id]);

    // Si no se encuentra el préstamo, retornamos null o lanzamos un error
    if (rows.length === 0) {
      return null;
    }

    const historialStr = rows[0].historial_estados;
    let historial = [];

    if (historialStr) {
      try {
        historial = JSON.parse(historialStr);
      } catch (error) {
        console.error('Error parseando historial_estados:', error);
        // Podrías decidir devolver un arreglo vacío en caso de error
        historial = [];
      }
    }

    return historial; // Devuelve un arreglo con objetos { estado, usuario, fecha }, etc.
  },

  cancelarPrestamo: async (pre_id) => {
    const connection = await db.getConnection();
    try {
      // 1️⃣ Verificar si el préstamo existe y su estado
      const [rows] = await connection.query(
        "SELECT est_id FROM prestamos WHERE pre_id = ?",
        [pre_id]
      );

      if (rows.length === 0) {
        throw new Error("No se encontró el préstamo");
      }

      const estadoActual = rows[0].est_id;

      // 2️⃣ Validar si el estado es "Creado"
      const ESTADO_CREADO = 1; // Asegúrate de que este sea el ID correcto en tu BD
      const ESTADO_CANCELADO = 5; // ID del estado "Cancelado"

      if (estadoActual !== ESTADO_CREADO) {
        throw new Error("Solo se pueden cancelar préstamos en estado 'Creado'");
      }

      // 3️⃣ Actualizar el estado a "Cancelado"
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
  },
};

module.exports = Prestamo;
