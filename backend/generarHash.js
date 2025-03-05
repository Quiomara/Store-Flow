const bcrypt = require('bcryptjs');

/**
 * Genera un hash para una contraseña específica.
 * 
 * - Se define una contraseña (`adminpassword`).
 * - Se genera un hash con un factor de costo de 10.
 * - El hash generado puede ser utilizado para almacenamiento seguro de contraseñas.
 */
const generarHash = () => {
  const contrasena = 'adminpassword'; // La contraseña que quieres encriptar
  const hash = bcrypt.hashSync(contrasena, 10); // Genera el hash de la contraseña
  return hash; // Retorna el hash generado
};

// Se llama a la función para generar el hash.
const hashGenerado = generarHash();
