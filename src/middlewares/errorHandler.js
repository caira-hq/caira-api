import logger from '../utils/logger.js';

/**
 * AppError digunakan untuk error operasional yang aman ditampilkan ke client.
 * System error (bug, crash DB) tidak menggunakan class ini dan pesannya
 * disembunyikan dari response publik.
 */
class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

/**
 * Global error handler — harus didaftarkan paling terakhir di Express.
 */
const globalErrorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational === true;

  logger.error(`${req.method} ${req.path} → ${statusCode}: ${err.message}`);

  const message = isOperational
    ? err.message
    : 'Terjadi kesalahan internal pada server.';

  const payload = { success: false, message };

  if (process.env.NODE_ENV === 'development' && !isOperational) {
    payload.stack = err.stack;
  }

  res.status(statusCode).json(payload);
};

/**
 * Handler untuk route yang tidak ditemukan.
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route '${req.method} ${req.path}' tidak ditemukan.`,
  });
};

export { AppError, globalErrorHandler, notFoundHandler };
