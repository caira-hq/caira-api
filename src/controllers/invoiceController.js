const invoiceService = require("../services/invoiceService");
const response = require("../utils/response");

const createInvoice = async (req, res, next) => {
  try {
    const { client_name, client_email, description, amount_xlm } = req.body;
    const newInvoice = await invoiceService.createInvoice({
      user_id: req.user.id,
      client_name,
      client_email,
      description,
      amount_xlm,
    });
    return response.created(res, newInvoice, "Invoice berhasil dibuat.");
  } catch (error) {
    next(error);
  }
};

const getInvoiceDetails = async (req, res, next) => {
  try {
    const invoice = await invoiceService.getInvoiceByCode(req.params.code);
    return response.success(res, invoice);
  } catch (error) {
    next(error);
  }
};

const checkPaymentStatus = async (req, res, next) => {
  try {
    const result = await invoiceService.verifyAndSettleInvoice(
      req.params.code,
      req.user.id,
    );
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = { createInvoice, getInvoiceDetails, checkPaymentStatus };
