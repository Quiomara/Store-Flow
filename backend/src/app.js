require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const usuarioRoutes = require('./routes/usuarioRoutes');
const ubicacionElementoRoutes = require('./routes/ubicacionElementoRoutes');
const elementoRoutes = require('./routes/elementoRoutes');
const prestamoRoutes = require('./routes/prestamoRoutes');
const estadoRoutes = require('./routes/estadoRoutes'); // Importar las rutas de estado
const authRoutes = require('./routes/authRoutes');
const centroDeFormacionRoutes = require('./routes/centroDeFormacionRoutes');
const tipoDeUsuarioRoutes = require('./routes/tipoDeUsuarioRoutes');
const auth = require('./middleware/auth');

const app = express();

console.log('✅ Configurando middlewares...');

/**
 * Configura los middlewares globales para la aplicación Express.
 * 
 * @param {Object} app - La instancia de la aplicación Express.
 * @param {Function} bodyParser.json - Middleware para parsear JSON con un límite de 100MB.
 * @param {Function} bodyParser.urlencoded - Middleware para manejar datos URL codificados.
 * @param {Function} express.urlencoded - Middleware para habilitar el uso de datos URL codificados.
 * @param {Function} cors - Middleware para permitir solicitudes CORS desde diferentes dominios.
 */
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(cors());

console.log('✅ Definiendo rutas...');

/**
 * Configura las rutas de la API y las protege con el middleware de autenticación.
 * 
 * @param {Object} app - La instancia de la aplicación Express.
 * @param {Object} authRoutes - Rutas relacionadas con la autenticación.
 * @param {Object} usuarioRoutes - Rutas relacionadas con usuarios.
 * @param {Object} ubicacionElementoRoutes - Rutas relacionadas con la ubicación de elementos.
 * @param {Object} elementoRoutes - Rutas relacionadas con elementos.
 * @param {Object} prestamoRoutes - Rutas relacionadas con préstamos.
 * @param {Object} estadoRoutes - Rutas relacionadas con los estados.
 * @param {Object} centroDeFormacionRoutes - Rutas relacionadas con centros de formación.
 * @param {Object} tipoDeUsuarioRoutes - Rutas relacionadas con tipos de usuario.
 */
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', auth(['Administrador', 'Instructor']), usuarioRoutes);
app.use('/api/ubicacion-elementos', auth(['Administrador', 'Almacen']), ubicacionElementoRoutes);
app.use('/api/elementos', auth(['Administrador', 'Instructor', 'Almacen']), elementoRoutes);
app.use('/api/prestamos', auth(['Administrador', 'Instructor', 'Almacen']), prestamoRoutes);
app.use('/api/estados', auth(['Administrador', 'Instructor', 'Almacen']), estadoRoutes); // Registrar las rutas de estado
app.use('/api/centros', auth(['Administrador']), centroDeFormacionRoutes);
app.use('/api/tipos-usuario', auth(['Administrador']), tipoDeUsuarioRoutes);

/**
 * Ruta de prueba para verificar el estado del servidor.
 * 
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} res - Objeto de respuesta HTTP.
 * @returns {void} Responde con un mensaje indicando que el servidor está funcionando.
 */
app.get('/', (req, res) => {
  res.send('¡El servidor está funcionando!');
});

/**
 * Middleware para manejo global de errores.
 * Registra los errores en la consola y responde con un mensaje de error.
 * 
 * @param {Error} err - El error capturado.
 * @param {Object} req - Objeto de solicitud HTTP.
 * @param {Object} res - Objeto de respuesta HTTP.
 * @param {Function} next - Función para pasar al siguiente middleware.
 * @returns {void} Responde con un mensaje de error.
 */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Ocurrió un error en el servidor.' });
});

console.log('✅ Exportando la aplicación...');
module.exports = app;
