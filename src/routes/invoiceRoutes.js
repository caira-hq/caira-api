const express = require("express");
const router = express.Router();
const invoiceController = require("../controllers/invoiceController");
const { validateBody } = require("../middlewares/validate");
const { strictLimiter } = require("../middlewares/rateLimiter");
const { authenticate } = require("../middlewares/authenticate");

// user_id tidak perlu dari body — diambil dari JWT token
const createInvoiceSchema = {
  client_name: { required: true, type: "string", maxLength: 150 },
  client_email: { required: true, type: "string", isEmail: true },
  description: { required: false, type: "string", maxLength: 500 },
  amount_xlm: { required: true, type: "number", min: 0.0000001 },
};

router.post(
  "/",
  authenticate,
  strictLimiter,
  validateBody(createInvoiceSchema),
  invoiceController.createInvoice,
);
router.get("/:code", invoiceController.getInvoiceDetails); // publik — siapapun bisa lihat invoice untuk bayar
router.post(
  "/:code/verify",
  authenticate,
  strictLimiter,
  invoiceController.checkPaymentStatus,
);
router.post(
  "/",
  strictLimiter,
  validateBody(createInvoiceSchema),
  invoiceController.createInvoice,
);
router.get("/:code", invoiceController.getInvoiceDetails);
router.post(
  "/:code/verify",
  strictLimiter,
  invoiceController.checkPaymentStatus,
);

module.exports = router;
