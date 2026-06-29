import express from "express";
const router = express.Router();
import { registerUser } from "../controllers/userController.js";
import { validateBody } from "../middlewares/validate.js";
import { strictLimiter } from "../middlewares/rateLimiter.js";

const registerSchema = {
  stellar_wallet: { required: true, type: "string", isStellarWallet: true },
  display_name: { required: true, type: "string", maxLength: 100 },
};

router.post(
  "/",
  strictLimiter,
  validateBody(registerSchema),
  registerUser,
);

export default router;
