const invoiceService = require('../services/invoiceService');

const createInvoice = async (req, res) => {
  try {
    const { 
        user_id,
        client_name,
        client_email,
        description,
        amount_xlm 
    } = req.body;
    
    if (!user_id || !client_name || !client_email || !description || !amount_xlm) {
      return res.status(400).json({ success: false, message: "Wallet dan Nama wajib diisi!" });
    }
    

    const newInvoice = await invoiceService.createInvoice(user_id, client_name, client_email, description, amount_xlm);
    
    res.status(201).json({
      success: true,
      message: "Invoice berhasil didaftarkan di Caira!",
      data: newInvoice
    });
  } catch (error) {
    console.log(1);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const getInvoiceByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const invoice = await invoiceService.getInvoiceByCode(code);
    res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const verifyInvoice = async (req, res) => {
  try {
    const { code } = req.params;
    const invoice = await invoiceService.getInvoiceByCode(code);

    if (!invoice) {
      return res.status(404).json({ success: false, message: "Invoice tidak ditemukan!" });
    }

    const transaction = await invoiceService.verifyInvoice(invoice.invoice_code);
    

    res.status(200).json({ 
      success: true,
      message: "Pembayaran berhasil diverifikasi di jaringan Stellar!",
      invoice: {
        invoice_code: transaction.invoice_code,
        status: transaction.status,
      }
    });
  } catch (error) {
    res.status(400).json({ success: false, message: "Pembayaran belum terdeteksi di jaringan. Silakan coba beberapa saat lagi." });
  }
};

module.exports = {
  createInvoice,
  getInvoiceByCode,
  verifyInvoice
};