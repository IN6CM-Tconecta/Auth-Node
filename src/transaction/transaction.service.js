import { isValidLuhn } from '../../helpers/luhn.js';
import {
  initializeWallet,
  addFunds,
  hasCitizenCard,
} from './wallet.integration.js';

/**
 * Helper: extrae valor aceptando PascalCase y camelCase.
 * Client-User envía: { cardNumber, expirationDate, cvv, amount }
 * Contrato .NET:     { CardNumber, ExpirationDate, CVV, Amount }
 */
const pick = (obj, pascal, camel) => obj[pascal] ?? obj[camel];

/**
 * Servicio de transacciones — replica TransactionService.cs del .NET.
 * Acepta tanto PascalCase como camelCase en los campos de entrada.
 */

/**
 * Procesa una recarga de saldo validando la tarjeta con Luhn y llamando S2S.
 * Replica: ProcessPaymentAsync(Guid userId, TransactionRequestDto request)
 *
 * @param {string} userId
 * @param {object} dto - { CardNumber|cardNumber, Amount|amount, ... }
 * @returns {{ isSuccess, message, transactionId }}
 */
export const processPayment = async (userId, dto) => {
  const CardNumber = pick(dto, 'CardNumber', 'cardNumber');
  const Amount     = pick(dto, 'Amount', 'amount');

  if (!isValidLuhn(CardNumber)) {
    return { isSuccess: false, message: 'Número de tarjeta inválido.', transactionId: '' };
  }

  // Simula latencia de procesador de pagos (replica Task.Delay(1500))
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const walletUpdated = await addFunds(userId, Amount);

  if (!walletUpdated) {
    return {
      isSuccess: false,
      message: 'Transacción aprobada, pero falló la sincronización con la billetera.',
      transactionId: '',
    };
  }

  return {
    isSuccess: true,
    message: 'Recarga procesada exitosamente.',
    transactionId: crypto.randomUUID(),
  };
};

/**
 * Procesa la compra inicial de la Tarjeta Ciudadana (monto fijo Q20.00).
 * Replica: PurchaseCardAsync(Guid userId, TransactionRequestDto request)
 *
 * @param {string} userId
 * @param {object} dto - { CardNumber|cardNumber, Amount|amount, ... }
 * @returns {{ isSuccess, message, transactionId }}
 */
export const purchaseCard = async (userId, dto) => {
  const CardNumber = pick(dto, 'CardNumber', 'cardNumber');
  const Amount     = pick(dto, 'Amount', 'amount');

  if (parseFloat(Amount) !== 20.00) {
    return {
      isSuccess: false,
      message: 'El costo de emisión de la Tarjeta Ciudadana es exactamente Q20.00.',
      transactionId: '',
    };
  }

  if (!isValidLuhn(CardNumber)) {
    return { isSuccess: false, message: 'Número de tarjeta inválido.', transactionId: '' };
  }

  const alreadyHasCard = await hasCitizenCard(userId);
  if (alreadyHasCard) {
    return {
      isSuccess: false,
      message: 'Transacción denegada. El usuario ya posee una Tarjeta Ciudadana activa.',
      transactionId: '',
    };
  }

  // Simula latencia (replica Task.Delay(1500))
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const walletInitialized = await initializeWallet(userId);

  if (!walletInitialized) {
    return {
      isSuccess: false,
      message: 'Transacción aprobada, pero falló la creación de la billetera. Contacte soporte.',
      transactionId: '',
    };
  }

  return {
    isSuccess: true,
    message: 'Tarjeta Ciudadana adquirida exitosamente. Se han acreditado Q20.00 de saldo y 5 viajes de cortesía.',
    transactionId: crypto.randomUUID(),
  };
};
