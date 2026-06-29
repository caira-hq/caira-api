import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Membuat JWT untuk user yang berhasil login.
 * @param {{ id: string, stellar_wallet: string }} payload
 */
const signToken = (payload) => jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

/**
 * Memverifikasi dan mendekode JWT.
 * Melempar error jika token tidak valid atau kadaluarsa.
 * @param {string} token
 */
const verifyToken = (token) => jwt.verify(token, JWT_SECRET);

export { signToken, verifyToken };
