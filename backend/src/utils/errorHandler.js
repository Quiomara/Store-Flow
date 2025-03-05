/**
 * @class ErrorHandler
 * @description Clase para manejar errores personalizados en la aplicación.
 * @extends Error
 */
class ErrorHandler extends Error {
    /**
     * @constructor
     * @param {string} message - Mensaje de error.
     * @param {number} statusCode - Código de estado HTTP asociado al error.
     */
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

module.exports = ErrorHandler;
