const bcrypt = require('bcryptjs');

const generarHash = () => {
  const contrasena = 'adminpassword'; // La contraseña que quieres encriptar
  const hash = bcrypt.hashSync(contrasena, 10); // Genera el hash
  console.log(hash); // Imprime el hash en la consola
};

generarHash();
