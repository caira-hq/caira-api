const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');

router.post('/', invoiceController.createInvoice);
router.get('/:code', invoiceController.getInvoiceDetails);
router.post('/:code/verify', invoiceController.checkPaymentStatus);

module.exports = router;