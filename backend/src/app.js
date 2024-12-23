// Para la configuración de la aplicación Express y definición de rutas.
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const usuarioRoutes = require('./routes/usuarioRoutes');
const ubicacionElementoRoutes = require('./routes/ubicacionElementoRoutes');
const elementoRoutes = require('./routes/elementoRoutes');
const prestamoRoutes = require('./routes/prestamoRoutes');
const authRoutes = require('./routes/authRoutes');
const centroDeFormacionRoutes = require('./routes/centroDeFormacionRoutes');
const tipoDeUsuarioRoutes = require('./routes/tipoDeUsuarioRoutes');
const authenticateToken = require('./middleware/authenticateToken');

const app = express();

console.log('Configurando middlewares...');
app.use(cors());
app.use(bodyParser.json());

console.log('Definiendo rutas...');
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes); 
app.use('/api/ubicacion-elementos', ubicacionElementoRoutes); 
app.use('/api/elementos', elementoRoutes); 
app.use('/api/prestamos', prestamoRoutes); 

app.use('/api/centros', authenticateToken, centroDeFormacionRoutes);
app.use('/api/tipos-usuario', authenticateToken, tipoDeUsuarioRoutes);

app.get('/', (req, res) => {
  res.send('¡El servidor está funcionando!');
});

console.log('Exportando la aplicación...');
module.exports = app;
