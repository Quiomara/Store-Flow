// Para la configuración de la aplicación Express y definición de rutas.
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const usuarioRoutes = require('./routes/usuarioRoutes');
const ubicacionElementoRoutes = require('./routes/ubicacionElementoRoutes');
const elementoRoutes = require('./routes/elementoRoutes');
const prestamoRoutes = require('./routes/prestamoRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();

console.log('Configurando middlewares...');

app.use(cors());
app.use(bodyParser.json());

console.log('Definiendo rutas...');

// Rutas de autenticación
app.use('/auth', authRoutes);
app.use('/usuarios', usuarioRoutes);
app.use('/ubicacion-elementos', ubicacionElementoRoutes);
app.use('/elementos', elementoRoutes);
app.use('/prestamos', prestamoRoutes);

app.get('/', (req, res) => {
  res.send('¡El servidor está funcionando!');
});

console.log('Exportando la aplicación...');

module.exports = app;

