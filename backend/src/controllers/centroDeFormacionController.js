const CentroDeFormacion = require('../models/centroDeFormacion');

const getCentros = (req, res) => {
  CentroDeFormacion.obtenerCentrosDeFormacion((error, resultados) => {
    if (error) {
      console.error('Error al obtener centros de formación:', error.stack);
      return res.status(500).json({ respuesta: false, mensaje: 'Error al obtener centros de formación.' });
    }
    res.json({ respuesta: true, mensaje: 'Centros de formación obtenidos con éxito.', data: resultados });
  });
};

module.exports = {
  getCentros,
};

