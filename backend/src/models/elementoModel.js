const db = require('../config/db');

const Elemento = {
  // Crear un nuevo elemento
  crear: async (data) => {
    if (!data.ele_nombre) {
      throw new Error("El campo 'ele_nombre' es obligatorio.");
    }
    const query = `
      INSERT INTO Elementos (ele_nombre, ele_cantidad_total, ele_cantidad_actual, ele_imagen, ubi_ele_id)
      VALUES (?, ?, ?, ?, ?)
    `;
    const values = [
      data.ele_nombre,
      data.ele_cantidad_total,
      data.ele_cantidad_actual || data.ele_cantidad_total,
      data.ele_imagen,
      data.ubi_ele_id
    ];
    console.log('Datos a insertar:', values); // Agregar log para verificar los datos
    const [result] = await db.query(query, values);
    return result;
  },

  // Actualizar un elemento
  actualizar: async (data) => {
    const query = `
      UPDATE Elementos
      SET ele_nombre = ?, ele_cantidad_total = ?, ele_cantidad_actual = ?, ele_imagen = ?, ubi_ele_id = ?
      WHERE ele_id = ?
    `;
    const values = [
      data.ele_nombre,
      data.ele_cantidad_total,
      data.ele_cantidad_actual,
      data.ele_imagen,
      data.ubi_ele_id,
      data.ele_id
    ];
    console.log('Datos a actualizar en la base de datos:', values); // Log para verificar los datos

    try {
      const [result] = await db.query(query, values);
      console.log('Resultado de la consulta de actualización:', result); // Log para verificar el resultado
      return result;
    } catch (err) {
      console.error('Error en la consulta de actualización:', err); // Log para verificar el error
      throw err;
    }
  },

  // Actualizar el stock (cantidad actual)
  actualizarStock: async (ele_id, cantidad) => {
    const query = `UPDATE Elementos SET ele_cantidad_actual = ele_cantidad_actual + ? WHERE ele_id = ?`;
    const [result] = await db.query(query, [cantidad, ele_id]);
    
    if (result.affectedRows === 0) {
      throw new Error('No se encontró el elemento con el ID proporcionado.');
    }
    
    return result;
  },

  // Eliminar un elemento
  eliminar: async (ele_id) => {
    const query = `DELETE FROM Elementos WHERE ele_id = ?`;
    const [result] = await db.query(query, [ele_id]);
    return result;
  },

  // Obtener todos los elementos
  obtenerTodos: async () => {
    const query = `
      SELECT e.ele_id, e.ele_nombre, e.ele_cantidad_total, e.ele_cantidad_actual, e.ele_imagen, e.ubi_ele_id, u.ubi_nombre
      FROM Elementos e
      JOIN UbicacionElementos u ON e.ubi_ele_id = u.ubi_ele_id
    `;
    const [results] = await db.query(query);
    return results;
  },

  // Obtener un elemento por su ID
  obtenerPorId: async (ele_id) => {
    const query = `
      SELECT e.ele_id, e.ele_nombre, e.ele_cantidad_total, e.ele_cantidad_actual, e.ele_imagen, e.ubi_ele_id, u.ubi_nombre
      FROM Elementos e
      JOIN UbicacionElementos u ON e.ubi_ele_id = u.ubi_ele_id
      WHERE e.ele_id = ?
    `;
    const [results] = await db.query(query, [ele_id]);
    return results[0] || null;
  },
};

module.exports = Elemento;
