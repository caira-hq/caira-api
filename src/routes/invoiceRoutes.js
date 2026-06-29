import express from "express";
const router = express.Router();
import * as invoiceController from "../controllers/invoiceController.js";
import { validateBody } from "../middlewares/validate.js";
import { strictLimiter } from "../middlewares/rateLimiter.js";
import { authenticate } from "../middlewares/authenticate.js";

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
  invoiceController.createInvoices,
);
router.get("/:code", invoiceController.getInvoiceDetails); // publik — siapapun bisa lihat invoice untuk bayar
router.post(
  "/:code/verify",
  authenticate,
  strictLimiter,
  invoiceController.checkPaymentStatus,
);

export default router;
