const { randomBytes } = require("crypto");
const prisma = require("../config/db");
const { verifyPayment } = require("./stellarService");
const { AppError } = require("../middlewares/errorHandler");

/**
 * Menghasilkan kode invoice unik.
 * Format: INV-<timestamp>-<4 byte hex acak>
 * Contoh: INV-1719480000000-A3F2B1C4
 */
const generateInvoiceCode = () =>
  `INV-${Date.now()}-${randomBytes(4).toString("hex").toUpperCase()}`;

const createInvoice = async ({
  user_id,
  client_name,
  client_email,
  description,
  amount_xlm,
}) => {
  const invoice = await prisma.invoice.create({
    data: {
      invoice_code: generateInvoiceCode(),
      user_id,
      client_name,
      client_email,
      description: description ?? null,
      amount_xlm,
      status: "PENDING",
    },
  });

  return invoice;
};

const getInvoiceByCode = async (code) => {
  const invoice = await prisma.invoice.findUnique({
    where: { invoice_code: code },
    include: {
      user: {
        select: { display_name: true, stellar_wallet: true },
      },
    },
  });

  if (!invoice) {
    throw new AppError("Invoice tidak ditemukan.", 404);
  }

  return invoice;
};

const verifyAndSettleInvoice = async (invoiceCode, userId) => {
  const invoice = await getInvoiceByCode(invoiceCode);

  if (invoice.user_id !== userId) {
    throw new AppError("Anda tidak memiliki akses ke invoice ini.", 403);
  }

  if (invoice.status === "PAID") {
    return {
      success: true,
      message: "Invoice ini sudah lunas sebelumnya.",
      invoice,
    };
  }

  const stellarCheck = await verifyPayment(
    invoice.user.stellar_wallet,
    invoice.invoice_code,
  );

  if (!stellarCheck.paid) {
    return {
      success: false,
      message:
        "Pembayaran belum terdeteksi di jaringan Stellar. Klien mungkin belum membayar atau transaksi masih pending.",
    };
  }

  const updatedInvoice = await prisma.invoice.update({
    where: { invoice_code: invoiceCode },
    data: { status: "PAID" },
  });

  return {
    success: true,
    message:
      "Pembayaran berhasil diverifikasi di jaringan Stellar. Tagihan lunas.",
    invoice: updatedInvoice,
  };
};

module.exports = { createInvoice, getInvoiceByCode, verifyAndSettleInvoice };
