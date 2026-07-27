import { Router } from 'express';
import { rechargeController, purchaseCardController } from './transaction.controller.js';
import { transactionValidation } from './transaction.validators.js';
import { validateSchema } from '../../middlewares/validate-schema.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { normalizeAuthBody } from '../../middlewares/normalize-body.js';

const router = Router();

router.post(
  '/recharge',
  validateJWT,
  normalizeAuthBody,
  transactionValidation,
  validateSchema,
  rechargeController
);

router.post(
  '/purchase-card',
  validateJWT,
  normalizeAuthBody,
  transactionValidation,
  validateSchema,
  purchaseCardController
);

export default router;
