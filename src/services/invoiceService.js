const prisma = require('../config/db');
const { verifyPayment } = require('../services/stellarService');

const createInvoice = async (
    user_id,
    client_name,
    client_email,
    description,
    amount_xlm
) => {



 const newInvoice = await prisma.invoice.create({
    data: {
        invoice_code: 'INV' + Date.now(),
        user_id,
        client_name,
        client_email,
        description,
        amount_xlm,
        status: "PENDING"
    }
  });
  return newInvoice;
};

const getInvoiceByCode = async (code) => {
  const invoice = await prisma.invoice.findUnique({
    where: { invoice_code: code },
    include: {
      user: {
        select: { display_name: true, stellar_wallet: true }
      }
    }
  });

  if (!invoice) throw new Error('Invoice tidak ditemukan!');

  return invoice;
};

const verifyAndSettledInvoice = async (invoiceCode) => {

  const invoice = await getInvoiceByCode(invoiceCode);

  if(invoice.status === "PAID"){
    return { success: true, message: "Invoice ini sudah lunas sebelumnya.", invoice };
  }

  const stellarCheck = await verifyPayment(invoice.user.stellar_wallet, invoice.invoice_code);

  if(stellarCheck.paid){
    const updateInvoice = await prisma.invoice.update({
      where: { invoice_code: invoiceCode },
      data: { status: "PAID"}
    });
    return {
      success: true,
      message: "Uang berhasil diverifikasi di jaringan Stellar! Tagihan Lunas.",
      invoice: updateInvoice
    };
  }

  return {
    success: false,
    message: "Pembayaran belum terdeteksi di jaringan Stellar. Klien mungkin belum membayar atau transaksi masih pending"
  }

};

module.exports = {
  createInvoice,
  getInvoiceByCode,
  verifyAndSettledInvoice
};