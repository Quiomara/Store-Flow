/**
 * Maneja los errores en las respuestas HTTP, enviando un mensaje adecuado al cliente.
 *
 * @function manejarError
 * @param {Object} res - Objeto de respuesta de Express.
 * @param {string} mensaje - Mensaje personalizado para la respuesta.
 * @param {Error} error - Objeto de error capturado.
 */
const manejarError = (res, mensaje, error) => {
    res.status(error.statusCode || 500).json({
        success: false,
        message: mensaje || "Error interno del servidor",
        error: error.message || "Ocurrió un error"
    });
};

module.exports = manejarError;
