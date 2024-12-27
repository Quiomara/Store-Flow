const CentroDeFormacion = require('../models/centroDeFormacion');

// Método para obtener todos los centros de formación
const getCentros = (req, res) => {
  CentroDeFormacion.obtenerCentrosDeFormacion((error, resultados) => {
    if (error) {
      console.error('Error al obtener centros de formación:', error.stack);
      return res.status(500).json({ respuesta: false, mensaje: 'Error al obtener centros de formación.' });
    }
    res.json({ respuesta: true, mensaje: 'Centros de formación obtenidos con éxito.', data: resultados });
  });
};

// Método para obtener centro de formación por ID
const obtenerCentroDeFormacionPorID = (req, res) => {
  const id = req.params.id;
  CentroDeFormacion.obtenerCentroDeFormacionPorID(id, (error, resultado) => {
    if (error) {
      console.error('Error al obtener centro de formación por ID:', error.stack);
      return res.status(500).json({ respuesta: false, mensaje: 'Error al obtener centro de formación.' });
    }
    res.json({ respuesta: true, mensaje: 'Centro de formación obtenido con éxito.', data: resultado });
  });
};

module.exports = {
  getCentros,
  obtenerCentroDeFormacionPorID
};

