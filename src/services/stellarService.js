const { stellarServer, HORIZON_URL } = require("../config/stellar");
const logger = require("../utils/logger");

/**
 * Memverifikasi pembayaran di jaringan Stellar dengan mencocokkan
 * memo transaksi dengan invoice code.
 *
 * @param {string} walletAddress - Stellar public key penerima (merchant)
 * @param {string} invoiceCode   - Kode invoice yang digunakan sebagai memo transaksi
 * @returns {{ paid: boolean, txHash?: string }}
 */
const verifyPayment = async (walletAddress, invoiceCode) => {
  logger.info(
    `[STELLAR] Mengecek transaksi di wallet: ${walletAddress} | Memo: ${invoiceCode} | Network: ${HORIZON_URL}`,
  );

  const response = await stellarServer
    .transactions()
    .forAccount(walletAddress)
    .order("desc")
    .limit(20)
    .call();

  const matchedTx = response.records.find((tx) => tx.memo === invoiceCode);

  if (matchedTx) {
    logger.info(`[STELLAR] Transaksi ditemukan! Hash: ${matchedTx.hash}`);
    return { paid: true, txHash: matchedTx.hash };
  }

  logger.info(
    `[STELLAR] Belum ada transaksi masuk untuk invoice ${invoiceCode}.`,
  );
  return { paid: false };
};

module.exports = { verifyPayment };
