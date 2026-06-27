const prisma = require('../config/db');

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
        amount_xlm
    }
  });
  return newInvoice;
};

const getInvoiceByCode = async (code) => {
  const invoice = await prisma.invoice.findUnique({
    where: { invoice_code: code }
  });
  return invoice;
};

const verifyInvoice = async (code) => {
  const invoice = await prisma.invoice.update({
    where: { invoice_code: code },
    data: {
      status: 'paid'
    }
  });
  return invoice;
};

module.exports = {
  createInvoice,
  getInvoiceByCode,
  verifyInvoice
};