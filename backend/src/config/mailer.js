const nodemailer = require('nodemailer');

/**
 * Configura el transportador de correo electrónico utilizando Gmail.
 * Asegúrate de habilitar "Acceso de aplicaciones menos seguras" en la configuración de Gmail 
 * o usa OAuth2 para mayor seguridad.
 *
 * @constant
 * @type {nodemailer.Transporter}
 */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'servicereplymailer@gmail.com', // Correo del remitente (reemplazar con datos reales)
    pass: 'xsax ejjc ufrs uoog' // Contraseña o clave de aplicación (NO recomendable dejarla en el código)
  }
});

/**
 * Envía un correo electrónico con el enlace para restablecer la contraseña.
 *
 * @param {string} to - Dirección de correo del destinatario.
 * @param {string} resetToken - Token único para restablecer la contraseña.
 * @returns {void}
 */
const sendResetEmail = (to, resetToken) => {
  const mailOptions = {
    from: 'servicereplymailer@gmail.com', // Remitente del correo
    to: to, // Destinatario
    subject: 'Restablecimiento de Contraseña',
    text: `Haga clic en el siguiente enlace para restablecer su contraseña: http://localhost:4200/reset-password?token=${resetToken}`
  };

  transporter.sendMail(mailOptions, (error) => {
    if (error) {
      console.error('Error al enviar el correo:', error);
    }
  });
};

module.exports = sendResetEmail;
