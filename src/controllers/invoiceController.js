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
      return res.status(400).json({ success: false, message: "Data Invoice tidak lengkap!" });
    }
    

    const newInvoice = await invoiceService.createInvoice(user_id, client_name, client_email, description, amount_xlm);
    
    res.status(201).json({
      success: true,
      message: "Invoice berhasil dibuat!",
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

const getInvoiceDetails = async (req, res) => {
  try {
    const { code } = req.params;
    const invoice = await invoiceService.getInvoiceByCode(code);
    res.status(200).json({ success: true, data: invoice });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const checkPaymentStatus = async (req, res) => {
  try {
    const { code } = req.params;
    const result = await invoiceService.verifyAndSettledInvoice(code);

    if(result.success){
      res.status(200).json(result);
    } else {
      res.status(200).json(result);
    }

   
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createInvoice,
  getInvoiceDetails,
  checkPaymentStatus
};