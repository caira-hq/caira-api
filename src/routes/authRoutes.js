import express from 'express';
const router = express.Router();
import * as authController from '../controllers/authController.js';
import { validateBody } from '../middlewares/validate.js';
import { strictLimiter } from '../middlewares/rateLimiter.js';

const challengeSchema = {
  stellar_wallet: { required: true, type: 'string', isStellarWallet: true },
};

const verifySchema = {
  stellar_wallet: { required: true, type: 'string', isStellarWallet: true },
  signature:      { required: true, type: 'string' },
};

router.post('/challenge', strictLimiter, validateBody(challengeSchema), authController.requestChallenge);
router.post('/verify',    strictLimiter, validateBody(verifySchema),    authController.verifyAndLogin);

export default router;
