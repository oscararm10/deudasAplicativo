const { verifyToken } = require('../utils/auth');

const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token proporcionado' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ message: 'Token inválido o expirado' });
    }

    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Error en autenticación' });
  }
};

module.exports = authMiddleware;
