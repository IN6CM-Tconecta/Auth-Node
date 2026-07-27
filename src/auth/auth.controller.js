import { asyncHandler } from '../../helpers/async-handler.js';
import * as authService from './auth.service.js';

/**
 * Controladores del módulo de autenticación.
 * Replica exactamente los action methods del AuthController.cs del .NET.
 *
 * Patrón: thin controller — delega toda la lógica al servicio.
 * El asyncHandler captura excepciones y las pasa al error handler global.
 */

/**
 * POST /api/auth/register
 * Replica: [HttpPost("register")] public async Task<IActionResult> Register
 *
 * Body: { CUI, Email, Password }
 * Response 200: { token, userId, role }
 * Response 400: { message }
 */
export const registerController = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  return res.status(200).json(result);
});

/**
 * POST /api/auth/login
 * Replica: [HttpPost("login")] public async Task<IActionResult> Login
 *
 * Body: { CUI, Password }
 * Response 200: { token, userId, role }
 * Response 401: { message } — Credenciales inválidas
 * Response 400: { message }
 */
export const loginController = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  return res.status(200).json(result);
});

/**
 * POST /api/auth/recover-password
 * Replica: [HttpPost("recover-password")] public async Task<IActionResult> RecoverPassword
 *
 * Body: { Email }
 * Response 200: { message: "Token generado exitosamente.", token }
 * Response 400: { message }
 */
export const recoverPasswordController = asyncHandler(async (req, res) => {
  const result = await authService.requestPasswordReset(req.body);
  return res.status(200).json(result);
});

/**
 * POST /api/auth/reset-password
 * Replica: [HttpPost("reset-password")] public async Task<IActionResult> ResetPassword
 *
 * Body: { Email, Token, NewPassword }
 * Response 200: { message: "Contraseña actualizada exitosamente." }
 * Response 400/401: { message }
 */
export const resetPasswordController = asyncHandler(async (req, res) => {
  await authService.resetPassword(req.body);
  return res.status(200).json({ message: 'Contraseña actualizada exitosamente.' });
});

/**
 * GET /api/auth/users
 * Replica: [HttpGet("users")] [Authorize(Roles = "Admin")]
 *
 * Headers: Authorization: Bearer <admin-token>
 * Response 200: [{ id, cui, email, role, isActive, createdAt }]
 * Response 401/403: { message }
 */
export const getAllUsersController = asyncHandler(async (req, res) => {
  const users = await authService.getAllUsers();
  return res.status(200).json(users);
});

/**
 * POST /api/auth/register-admin
 * Replica: [HttpPost("register-admin")] [Authorize(Roles = "Admin")]
 *
 * Headers: Authorization: Bearer <admin-token>
 * Body: { CUI, Email, Password }
 * Response 200: { token, userId, role }
 * Response 400/401/403: { message }
 */
export const registerAdminController = asyncHandler(async (req, res) => {
  const result = await authService.registerAdmin(req.body);
  return res.status(200).json(result);
});
