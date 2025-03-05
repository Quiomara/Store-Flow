const TipoDeUsuario = require('../models/tipoDeUsuario');

/**
 * Obtiene todos los tipos de usuario desde la base de datos.
 * 
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} res - Objeto de respuesta HTTP.
 */
const getTiposUsuario = async (req, res) => {
  try {
    // Consultar los tipos de usuario en la base de datos
    const resultados = await TipoDeUsuario.obtenerTiposDeUsuario();
    
    // Enviar respuesta con los datos obtenidos
    res.json({ respuesta: true, mensaje: 'Tipos de usuario obtenidos con éxito.', data: resultados });
  } catch (error) {
    res.status(500).json({ respuesta: false, mensaje: 'Error al obtener tipos de usuario.' });
  }
};

module.exports = {
  getTiposUsuario,
};