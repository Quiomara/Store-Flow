const CentroDeFormacion = require('../models/centroDeFormacion');

// Método para obtener todos los centros de formación
const getCentros = (req, res) => {
  console.log('Solicitud recibida para obtenerCentros');
  CentroDeFormacion.obtenerCentrosDeFormacion((error, resultados) => {
    if (error) {
      console.error('Error al obtener centros de formación:', error.stack);
      return res.status(500).json({ respuesta: false, mensaje: 'Error al obtener centros de formación.' });
    }
    console.log('Resultados obtenidos:', resultados);
    res.json({ respuesta: true, mensaje: 'Centros de formación obtenidos con éxito.', data: resultados });
  });
};

// Método para obtener centro de formación por ID
const obtenerCentroDeFormacionPorID = (req, res) => {
  const id = req.params.id;
  console.log(`Solicitud recibida para obtenerCentroDeFormacionPorID con ID: ${id}`);
  CentroDeFormacion.obtenerCentroDeFormacionPorID(id, (error, resultado) => {
    if (error) {
      console.error('Error al obtener centro de formación por ID:', error.stack);
      return res.status(500).json({ respuesta: false, mensaje: 'Error al obtener centro de formación.' });
    }
    console.log('Resultado obtenido:', resultado);
    res.json({ respuesta: true, mensaje: 'Centro de formación obtenido con éxito.', data: resultado });
  });
};

module.exports = {
  getCentros,
  obtenerCentroDeFormacionPorID
};

