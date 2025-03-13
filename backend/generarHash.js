const bcrypt = require('bcryptjs');

/**
 * Genera un hash para una contraseña específica.
 *
 * @function generarHash
 * @returns {string} El hash generado a partir de la contraseña.
 *
 * @description
 * La función toma una contraseña (en este caso, 'adminpassword'), la encripta utilizando el algoritmo bcrypt
 * con un factor de costo de 10 y devuelve el hash generado.
 */
const generarHash = () => {
  const contrasena = 'adminpassword';
  const hash = bcrypt.hashSync(contrasena, 10); // Genera el hash de la contraseña
  return hash; // Retorna el hash generado
};

// Se llama a la función para generar el hash.
const hashGenerado = generarHash();
