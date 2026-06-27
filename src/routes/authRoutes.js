const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateBody } = require('../middlewares/validate');
const { strictLimiter } = require('../middlewares/rateLimiter');

const challengeSchema = {
  stellar_wallet: { required: true, type: 'string', isStellarWallet: true },
};

const verifySchema = {
  stellar_wallet: { required: true, type: 'string', isStellarWallet: true },
  signature:      { required: true, type: 'string' },
};

router.post('/challenge', strictLimiter, validateBody(challengeSchema), authController.requestChallenge);
router.post('/verify',    strictLimiter, validateBody(verifySchema),    authController.verifyAndLogin);

module.exports = router;
