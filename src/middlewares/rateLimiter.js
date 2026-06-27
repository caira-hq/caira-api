const rateLimit = require('express-rate-limit');

/**
 * Limiter umum untuk semua route API.
 * 100 request per 15 menit per IP.
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Terlalu banyak permintaan dari IP ini. Coba lagi setelah 15 menit.',
  },
});

/**
 * Limiter ketat untuk endpoint sensitif (register, verify).
 * 10 request per menit per IP.
 */
const strictLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Terlalu banyak permintaan. Coba lagi setelah 1 menit.',
  },
});

module.exports = { globalLimiter, strictLimiter };
