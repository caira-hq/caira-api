const { verifyToken } = require('../config/jwt');
const { AppError } = require('./errorHandler');

/**
 * Middleware untuk memproteksi route.
 * Mengekstrak dan memverifikasi Bearer token dari header Authorization.
 * Menambahkan `req.user = { id, stellar_wallet }` jika token valid.
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Akses ditolak. Token autentikasi diperlukan.', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Token sudah kadaluarsa. Silakan login kembali.', 401));
    }
    return next(new AppError('Token tidak valid.', 401));
  }
};

module.exports = { authenticate };
