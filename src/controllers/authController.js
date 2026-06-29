import * as authService from '../services/authService.js'
import * as response from '../utils/response.js'

/**
 * POST /api/auth/challenge
 * Menghasilkan challenge yang harus ditandatangani oleh client.
 */
const requestChallenge = async (req, res, next) => {
  try {
    const { stellar_wallet } = req.body;
    const data = await authService.generateChallenge(stellar_wallet);
    return response.success(res, data, 'Challenge berhasil dibuat. Tandatangani pesan ini dan kirim ke /api/auth/verify.');
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/verify
 * Memverifikasi signature dan mengeluarkan JWT.
 */
const verifyAndLogin = async (req, res, next) => {
  try {
    const { stellar_wallet, signature } = req.body;
    const data = await authService.verifySignatureAndLogin(stellar_wallet, signature);
    return response.success(res, data, 'Login berhasil.');
  } catch (error) {
    next(error);
  }
};

export { requestChallenge, verifyAndLogin };
