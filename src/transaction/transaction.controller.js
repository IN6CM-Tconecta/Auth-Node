import { asyncHandler } from '../../helpers/async-handler.js';
import { processPayment, purchaseCard } from './transaction.service.js';

/**
 * Controladores del módulo de transacciones.
 * Replica exactamente los action methods del TransactionController.cs del .NET.
 *
 * Extracción del userId desde req.userId (adjuntado por el middleware validateJWT),
 * que es equivalente a:
 *   User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value
 */

/**
 * POST /api/transaction/recharge
 * Replica: [HttpPost("recharge")] public async Task<IActionResult> Recharge
 *
 * Headers: Authorization: Bearer <token>
 * Body: { CardNumber, ExpirationDate, CVV, Amount }
 * Response 200: { isSuccess: true, message, transactionId }
 * Response 400: { isSuccess: false, message }
 * Response 401: { message } — Token inválido
 */
export const rechargeController = asyncHandler(async (req, res) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Token inválido o usuario no identificado.' });
  }

  const result = await processPayment(userId, req.body);

  // Replica el comportamiento del .NET: 400 si !result.IsSuccess, 200 si success
  if (!result.isSuccess) {
    return res.status(400).json(result);
  }

  return res.status(200).json(result);
});

/**
 * POST /api/transaction/purchase-card
 * Replica: [HttpPost("purchase-card")] public async Task<IActionResult> PurchaseCard
 *
 * Headers: Authorization: Bearer <token>
 * Body: { CardNumber, ExpirationDate, CVV, Amount }
 * Response 200: { isSuccess: true, message, transactionId }
 * Response 400: { isSuccess: false, message }
 * Response 401: { message } — Token inválido
 */
export const purchaseCardController = asyncHandler(async (req, res) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Token inválido o usuario no identificado.' });
  }

  const result = await purchaseCard(userId, req.body);

  if (!result.isSuccess) {
    return res.status(400).json(result);
  }

  return res.status(200).json(result);
});
