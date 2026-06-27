const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');

router.post('/', invoiceController.createInvoice);
router.get('/:code', invoiceController.getInvoiceByCode);
router.post('/:code/verify', invoiceController.verifyInvoice);

module.exports = router;