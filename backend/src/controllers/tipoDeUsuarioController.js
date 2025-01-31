const TipoDeUsuario = require('../models/tipoDeUsuario');

const getTiposUsuario = async (req, res) => {
  try {
    const resultados = await TipoDeUsuario.obtenerTiposDeUsuario();
    res.json({ respuesta: true, mensaje: 'Tipos de usuario obtenidos con éxito.', data: resultados });
  } catch (error) {
    console.error('Error al obtener tipos de usuario:', error.stack);
    res.status(500).json({ respuesta: false, mensaje: 'Error al obtener tipos de usuario.' });
  }
};

module.exports = {
  getTiposUsuario,
};