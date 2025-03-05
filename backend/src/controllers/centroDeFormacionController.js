const CentroDeFormacion = require('../models/centroDeFormacion');

/**
 * Controlador para obtener todos los centros de formación.
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} res - Objeto de respuesta HTTP.
 */
const getCentros = async (req, res) => {
  try {
    // Consultar los centros de formación en la base de datos
    const resultados = await CentroDeFormacion.obtenerCentrosDeFormacion();

    if (resultados.length === 0) {
      return res.status(404).json({ respuesta: false, mensaje: 'No se encontraron centros de formación.' });
    }

    res.json({ respuesta: true, mensaje: 'Centros de formación obtenidos con éxito.', data: resultados });
  } catch (error) {
    res.status(500).json({ respuesta: false, mensaje: 'Error al obtener centros de formación.' });
  }
};

/**
 * Controlador para obtener un centro de formación por su ID.
 * @param {Object} req - Objeto de solicitud HTTP con el ID del centro en los parámetros.
 * @param {Object} res - Objeto de respuesta HTTP.
 */
const obtenerCentroDeFormacionPorID = async (req, res) => {
  const id = req.params.id;

  try {
    // Consultar el centro de formación por ID en la base de datos
    const resultado = await CentroDeFormacion.obtenerCentroDeFormacionPorID(id);

    if (!resultado) {
      return res.status(404).json({ respuesta: false, mensaje: 'Centro de formación no encontrado.' });
    }

    res.json({ respuesta: true, mensaje: 'Centro de formación obtenido con éxito.', data: resultado });
  } catch (error) {
    res.status(500).json({ respuesta: false, mensaje: 'Error al obtener centro de formación.' });
  }
};

module.exports = {
  getCentros,
  obtenerCentroDeFormacionPorID,
};
