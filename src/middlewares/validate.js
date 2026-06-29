import { StrKey } from '@stellar/stellar-sdk';
import { AppError } from './errorHandler.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Middleware factory untuk validasi request body.
 *
 * Setiap field dalam schema bisa memiliki aturan berikut:
 *   required       {boolean} - wajib diisi
 *   type           {string}  - tipe JavaScript ('string', 'number', dll)
 *   isEmail        {boolean} - harus berformat email valid
 *   isStellarWallet {boolean} - harus berformat Stellar public key valid
 *   min            {number}  - nilai minimum (untuk number)
 *   maxLength      {number}  - panjang string maksimum
 */
const validateBody = (schema) => (req, res, next) => {
  const errors = [];

  for (const [field, rules] of Object.entries(schema)) {
    const value = req.body[field];
    const isEmpty = value === undefined || value === null || value === '';

    if (rules.required && isEmpty) {
      errors.push(`Field '${field}' wajib diisi.`);
      continue;
    }

    if (isEmpty) continue;

    if (rules.type && typeof value !== rules.type) {
      errors.push(`Field '${field}' harus bertipe ${rules.type}.`);
      continue;
    }

    if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
      errors.push(`Field '${field}' maksimal ${rules.maxLength} karakter.`);
    }

    if (rules.isEmail && !EMAIL_REGEX.test(value)) {
      errors.push(`Field '${field}' bukan alamat email yang valid.`);
    }

    if (rules.isStellarWallet && !StrKey.isValidEd25519PublicKey(value)) {
      errors.push(`Field '${field}' bukan Stellar wallet address yang valid.`);
    }

    if (rules.min !== undefined && typeof value === 'number' && value < rules.min) {
      errors.push(`Field '${field}' harus lebih besar dari ${rules.min}.`);
    }
  }

  if (errors.length > 0) {
    return next(new AppError(errors[0], 400));
  }

  next();
};

export { validateBody };
