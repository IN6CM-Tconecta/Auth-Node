import { Router } from 'express';
import {
  registerController,
  loginController,
  recoverPasswordController,
  resetPasswordController,
  getAllUsersController,
  registerAdminController,
} from './auth.controller.js';
import {
  registerValidation,
  loginValidation,
  recoverPasswordValidation,
  resetPasswordValidation,
} from './auth.validators.js';
import { validateSchema } from '../../middlewares/validate-schema.js';
import { validateJWT } from '../../middlewares/validate-jwt.js';
import { requireAdmin } from '../../middlewares/require-admin.js';
import { authRateLimit } from '../../middlewares/request-limit.js';
import { normalizeAuthBody } from '../../middlewares/normalize-body.js';

const router = Router();

router.post(
  '/register',
  authRateLimit,
  normalizeAuthBody,
  registerValidation,
  validateSchema,
  registerController
);

router.post(
  '/login',
  authRateLimit,
  normalizeAuthBody,
  loginValidation,
  validateSchema,
  loginController
);

router.post(
  '/recover-password',
  authRateLimit,
  normalizeAuthBody,
  recoverPasswordValidation,
  validateSchema,
  recoverPasswordController
);

router.post(
  '/reset-password',
  authRateLimit,
  normalizeAuthBody,
  resetPasswordValidation,
  validateSchema,
  resetPasswordController
);

router.get(
  '/users',
  validateJWT,
  requireAdmin,
  getAllUsersController
);

router.post(
  '/register-admin',
  validateJWT,
  requireAdmin,
  normalizeAuthBody,
  registerValidation,
  validateSchema,
  registerAdminController
);

export default router;
