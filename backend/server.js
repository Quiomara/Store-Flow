// Importa la aplicación configurada desde el archivo `app.js`
/**
 * La aplicación Express configurada.
 * @constant {Express.Application}
 */
const app = require('./src/app');

// Define el puerto en el que se ejecutará el servidor, utilizando una variable de entorno o el puerto 3000 por defecto
/**
 * Puerto en el que se ejecutará el servidor.
 * @constant {number|string}
 */
const PORT = process.env.PORT || 3000;

console.log('✅ Configurando el servidor...');

/**
 * Inicia el servidor en el puerto definido.
 * <br><br>
 * Si ocurre un error al iniciar, se muestra un mensaje de error en la consola.
 * Si el servidor inicia correctamente, se muestra la URL de acceso en la consola.
 *
 * @function
 * @param {number|string} PORT - El puerto en el que se ejecuta el servidor.
 * @param {Function} callback - Función callback que maneja el resultado del inicio del servidor.
 */
app.listen(PORT, (err) => {
  if (err) {
    console.error('❌ Error al iniciar el servidor:', err);
  } else {
    console.log(`✅ Servidor iniciado en http://localhost:${PORT}`);
  }
});
