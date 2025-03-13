const CentroDeFormacion = require('../models/centroDeFormacion');

/**
 * Controlador para obtener todos los centros de formación.
 *
 * Consulta la base de datos para obtener la lista de centros de formación y envía una respuesta
 * JSON con los datos obtenidos o un mensaje de error si no se encuentran resultados.
 *
 * @async
 * @function getCentros
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} res - Objeto de respuesta HTTP.
 * @returns {Promise<void>} No retorna ningún valor explícito.
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
 *
 * Consulta la base de datos para obtener la información de un centro de formación específico,
 * utilizando el ID proporcionado en los parámetros de la solicitud. Envía una respuesta JSON
 * con los datos del centro o un mensaje de error si no se encuentra.
 *
 * @async
 * @function obtenerCentroDeFormacionPorID
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} req.params - Parámetros de la solicitud.
 * @param {string} req.params.id - ID del centro de formación a obtener.
 * @param {Object} res - Objeto de respuesta HTTP.
 * @returns {Promise<void>} No retorna ningún valor explícito.
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
