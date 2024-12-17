// Para iniciar el servidor.
const app = require('./src/app');

const PORT = process.env.PORT || 3000;

console.log('Configurando el servidor...');

// Iniciar el servidor
app.listen(PORT, (err) => {
  if (err) {
    console.error('Error al iniciar el servidor:', err);
  } else {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
  }
});
