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

console.log('Configurando middlewares...');
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

console.log('Definiendo rutas...');
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', auth(['Administrador', 'Instructor']), usuarioRoutes);
app.use('/api/ubicacion-elementos', auth(['Administrador', 'Almacen']), ubicacionElementoRoutes); 
app.use('/api/elementos', auth(['Administrador', 'Instructor', 'Almacen']), elementoRoutes); 
app.use('/api/prestamos', auth(['Administrador', 'Instructor', 'Almacen']), prestamoRoutes);
app.use('/api/estados', auth(['Administrador', 'Instructor', 'Almacen']), estadoRoutes); // Registrar las rutas de estado
app.use('/api/centros', auth(['Administrador']), centroDeFormacionRoutes);
app.use('/api/tipos-usuario', auth(['Administrador']), tipoDeUsuarioRoutes);

app.get('/', (req, res) => {
  res.send('¡El servidor está funcionando!');
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Ocurrió un error en el servidor.' });
});


console.log('Exportando la aplicación...');
module.exports = app;
