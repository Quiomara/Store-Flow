const TipoDeUsuario = require('../models/tipoDeUsuario');

const getTiposUsuario = (req, res) => {
  TipoDeUsuario.obtenerTiposDeUsuario((error, resultados) => {
    if (error) {
      console.error('Error al obtener tipos de usuario:', error.stack);
      return res.status(500).json({ respuesta: false, mensaje: 'Error al obtener tipos de usuario.' });
    }
    res.json({ respuesta: true, mensaje: 'Tipos de usuario obtenidos con éxito.', data: resultados });
  });
};

module.exports = {
  getTiposUsuario,
};
