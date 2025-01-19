const jwt = require('jsonwebtoken');
require('dotenv').config(); 

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!authHeader || !token) {
    return res.status(401).json({ message: 'Token o encabezado de autorización faltante' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token no válido' });
    }
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
