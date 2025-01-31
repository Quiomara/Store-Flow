const CentroDeFormacion = require('../models/centroDeFormacion');

// Método para obtener todos los centros de formación
const getCentros = async (req, res) => {
  console.log('Solicitud recibida para obtenerCentros');
  try {
    console.log('Ejecutando consulta para obtener centros de formación...');
    const resultados = await CentroDeFormacion.obtenerCentrosDeFormacion();
    console.log('Resultados obtenidos en el controlador:', resultados); // Agrega este log
    if (resultados.length === 0) {
      return res.status(404).json({ respuesta: false, mensaje: 'No se encontraron centros de formación.' });
    }
    res.json({ respuesta: true, mensaje: 'Centros de formación obtenidos con éxito.', data: resultados });
  } catch (error) {
    console.error('Error al obtener centros de formación:', error.stack);
    res.status(500).json({ respuesta: false, mensaje: 'Error al obtener centros de formación.' });
  }
};

// Método para obtener centro de formación por ID
const obtenerCentroDeFormacionPorID = async (req, res) => {
  const id = req.params.id;
  console.log(`Solicitud recibida para obtenerCentroDeFormacionPorID con ID: ${id}`);
  try {
    console.log('Ejecutando consulta para obtener centro de formación por ID...');
    const resultado = await CentroDeFormacion.obtenerCentroDeFormacionPorID(id);
    console.log('Resultado obtenido en el controlador:', resultado); // Agrega este log
    res.json({ respuesta: true, mensaje: 'Centro de formación obtenido con éxito.', data: resultado });
  } catch (error) {
    console.error('Error al obtener centro de formación por ID:', error.stack);
    res.status(500).json({ respuesta: false, mensaje: 'Error al obtener centro de formación.' });
  }
};

module.exports = {
  getCentros,
  obtenerCentroDeFormacionPorID,
};