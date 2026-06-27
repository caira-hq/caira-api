const { randomBytes, createHash } = require("crypto");
const { Keypair } = require("@stellar/stellar-sdk");
const prisma = require("../config/db");
const { signToken } = require("../config/jwt");
const { AppError } = require("../middlewares/errorHandler");
const logger = require("../utils/logger");

/**
 * Simpan challenge sementara di memori.
 * Key: stellar_wallet, Value: { nonce, expiresAt }
 *
 * Catatan: Untuk produksi multi-instance, ganti dengan Redis.
 */
const challengeStore = new Map();
const CHALLENGE_TTL_MS = 5 * 60 * 1000; // 5 menit

const storeChallenge = (wallet, nonce) => {
  challengeStore.set(wallet, {
    nonce,
    expiresAt: Date.now() + CHALLENGE_TTL_MS,
  });
};

const consumeChallenge = (wallet) => {
  const entry = challengeStore.get(wallet);
  if (!entry) return null;

  challengeStore.delete(wallet);

  if (Date.now() > entry.expiresAt) return null;

  return entry.nonce;
};

/**
 * Langkah 1 — Buat challenge yang harus ditandatangani oleh client.
 * Challenge hanya berlaku 5 menit.
 */
const generateChallenge = async (walletAddress) => {
  const user = await prisma.user.findUnique({
    where: { stellar_wallet: walletAddress },
  });

  if (!user) {
    throw new AppError("Wallet Stellar ini belum terdaftar di Caira.", 404);
  }

  const nonce = randomBytes(16).toString("hex");
  const message = buildChallengeMessage(walletAddress, nonce);

  storeChallenge(walletAddress, nonce);

  logger.info(`[AUTH] Challenge dibuat untuk wallet: ${walletAddress}`);

  return { message };
};

/**
 * Langkah 2 — Verifikasi signature dan keluarkan JWT.
 * Signature harus dibuat menggunakan private key dari wallet yang terdaftar.
 */
const verifySignatureAndLogin = async (walletAddress, signature) => {
  const nonce = consumeChallenge(walletAddress);

  if (!nonce) {
    throw new AppError(
      "Challenge tidak ditemukan atau sudah kadaluarsa. Minta challenge baru.",
      401,
    );
  }

  const message = buildChallengeMessage(walletAddress, nonce);
  const isValid = verifyStellarSignature(walletAddress, message, signature);

  if (!isValid) {
    logger.warn(`[AUTH] Signature tidak valid untuk wallet: ${walletAddress}`);
    throw new AppError("Signature tidak valid.", 401);
  }

  const user = await prisma.user.findUnique({
    where: { stellar_wallet: walletAddress },
  });

  if (!user) {
    throw new AppError("User tidak ditemukan.", 404);
  }

  const token = signToken({ id: user.id, stellar_wallet: user.stellar_wallet });

  logger.info(`[AUTH] Login berhasil untuk wallet: ${walletAddress}`);

  return {
    token,
    user: {
      id: user.id,
      display_name: user.display_name,
      stellar_wallet: user.stellar_wallet,
    },
  };
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const buildChallengeMessage = (wallet, nonce) =>
  `Caira Authentication\n\nWallet: ${wallet}\nNonce: ${nonce}\n\nTandatangani pesan ini untuk masuk ke Caira. Tindakan ini tidak memerlukan biaya apapun.`;

const verifyStellarSignature = (walletAddress, message, signatureBase64) => {
  try {
    const keypair = Keypair.fromPublicKey(walletAddress);
    const signatureBuffer = Buffer.from(signatureBase64, "base64");

    // Freighter's signMessage (SUBMIT_BLOB protocol) signs:
    //   SHA256( "Stellar Signed Message:\n" + message )
    // — NOT the raw message bytes. We must verify against the same hash.
    const prefixed = `Stellar Signed Message:\n${message}`;
    const messageBuffer = createHash("sha256").update(prefixed).digest();

    return keypair.verify(messageBuffer, signatureBuffer);
  } catch {
    return false;
  }
};

module.exports = { generateChallenge, verifySignatureAndLogin };
