import { createInvoice, getInvoiceByCode, verifyAndSettleInvoice } from "../services/invoiceService.js";
import { success, created } from "../utils/response.js";

const createInvoices = async (req, res, next) => {
  try {
    const { client_name, client_email, description, amount_xlm } = req.body;
    const newInvoice = await createInvoice({
      user_id: req.user.id,
      client_name,
      client_email,
      description,
      amount_xlm,
    });
    return created(res, newInvoice, "Invoice berhasil dibuat.");
  } catch (error) {
    next(error);
  }
};

const getInvoiceDetails = async (req, res, next) => {
  try {
    const invoice = await getInvoiceByCode(req.params.code);
    return success(res, invoice);
  } catch (error) {
    next(error);
  }
};

const checkPaymentStatus = async (req, res, next) => {
  try {
    const result = await verifyAndSettleInvoice(
      req.params.code,
      req.user.id,
    );
    return success(res, result);
  } catch (error) {
    next(error);
  }
};

export { createInvoices, getInvoiceDetails, checkPaymentStatus };
