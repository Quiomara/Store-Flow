const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
      console.error('Authorization header missing');
      return res.status(401).json({ message: 'Authorization header missing' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      console.error('Token missing');
      return res.status(401).json({ message: 'Token missing' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        console.error('Token verification failed', err);
        return res.status(403).json({ message: 'Token verification failed' });
      }
      req.user = user;
      next();
    });
  } catch (error) {
    console.error('Error en authenticateToken:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

module.exports = authenticateToken;
