const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { validateBody } = require("../middlewares/validate");
const { strictLimiter } = require("../middlewares/rateLimiter");

const registerSchema = {
  stellar_wallet: { required: true, type: "string", isStellarWallet: true },
  display_name: { required: true, type: "string", maxLength: 100 },
};

router.post(
  "/",
  strictLimiter,
  validateBody(registerSchema),
  userController.registerUser,
);

module.exports = router;
