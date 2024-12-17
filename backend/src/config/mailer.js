const nodemailer = require('nodemailer');

// Crear el transportador con la configuración necesaria para Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'quiomaraos@gmail.com', // Reemplaza con tu correo electrónico de Gmail
    pass: 'jlbp qvvk ldbd ioje' // Reemplaza con tu contraseña de Gmail
  }
});

/**
 * Función para enviar el correo electrónico de restablecimiento de contraseña
 * @param {string} to - Dirección de correo del destinatario
 * @param {string} resetToken - Token de restablecimiento de contraseña
 */
const sendResetEmail = (to, resetToken) => {
  const mailOptions = {
    from: 'quiomaraos@gmail.com', // Remitente
    to: to, // Destinatario
    subject: 'Restablecimiento de Contraseña',
    text: `Haga clic en el siguiente enlace para restablecer su contraseña: http://localhost:4200/reset-password?token=${resetToken}`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error al enviar el correo:', error);
    } else {
      console.log('Correo enviado:', info.response);
    }
  });
};

module.exports = sendResetEmail;








