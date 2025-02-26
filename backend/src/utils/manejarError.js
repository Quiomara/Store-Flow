const manejarError = (res, mensaje, error) => {
    console.error(error);
    res.status(error.statusCode || 500).json({
        success: false,
        message: mensaje || "Error interno del servidor",
        error: error.message || "Ocurrió un error"
    });
};

module.exports = manejarError;
