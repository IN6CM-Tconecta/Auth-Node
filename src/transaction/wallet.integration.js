import axios from 'axios';
import { config } from '../../configs/config.js';

/**
 * Cliente HTTP S2S para comunicarse con el microservicio de billetera (server-client Node.js).
 *
 * Replica el WalletIntegrationService.cs del .NET:
 *   - BaseAddress: WalletService:BaseUrl → http://server-client:3002
 *   - Header x-internal-secret: SuperSecretS2S_Transmetro2026
 *
 * Las rutas S2S son exactamente las mismas que en el .NET:
 *   /TRANSMETRO-CONECTA-CLIENTE/v1/wallets/initialize
 *   /TRANSMETRO-CONECTA-CLIENTE/v1/wallets/recharge
 *   /TRANSMETRO-CONECTA-CLIENTE/v1/wallets/balance?userId=...
 */
const walletClient = axios.create({
  baseURL: config.wallet.baseUrl,
  headers: {
    'Content-Type': 'application/json',
    'x-internal-secret': config.wallet.internalSecret,
  },
  timeout: 8000,
});

/**
 * Inicializa la billetera del usuario con Q20.00 de saldo y 5 viajes de cortesía.
 * Replica: InitializeWalletAsync(Guid userId) en WalletIntegrationService.cs
 *
 * POST /TRANSMETRO-CONECTA-CLIENTE/v1/wallets/initialize
 * Body: { UserId, CourtesyTrips: 5, Balance: 20 }
 *
 * @param {string} userId - UUID del usuario
 * @returns {Promise<boolean>} true si la inicialización fue exitosa
 */
export const initializeWallet = async (userId) => {
  try {
    const response = await walletClient.post(
      '/TRANSMETRO-CONECTA-CLIENTE/v1/wallets/initialize',
      { UserId: userId, CourtesyTrips: 5, Balance: 20 }
    );
    return response.status >= 200 && response.status < 300;
  } catch (err) {
    console.error('[TransmetroAuth] WalletIntegration | initializeWallet error:', err.message);
    return false;
  }
};

/**
 * Acredita un monto de recarga a la billetera del usuario.
 * Replica: AddFundsAsync(Guid userId, decimal amount) en WalletIntegrationService.cs
 *
 * POST /TRANSMETRO-CONECTA-CLIENTE/v1/wallets/recharge
 * Body: { UserId, Amount }
 *
 * @param {string} userId - UUID del usuario
 * @param {number} amount - Monto a recargar
 * @returns {Promise<boolean>} true si la recarga fue exitosa
 */
export const addFunds = async (userId, amount) => {
  try {
    const response = await walletClient.post(
      '/TRANSMETRO-CONECTA-CLIENTE/v1/wallets/recharge',
      { UserId: userId, Amount: amount }
    );
    return response.status >= 200 && response.status < 300;
  } catch (err) {
    console.error('[TransmetroAuth] WalletIntegration | addFunds error:', err.message);
    return false;
  }
};

/**
 * Verifica si el usuario ya tiene una Tarjeta Ciudadana activa.
 * Replica: HasCitizenCardAsync(Guid userId) en WalletIntegrationService.cs
 *
 * GET /TRANSMETRO-CONECTA-CLIENTE/v1/wallets/balance?userId=...
 * Respuesta esperada: { success: true, data: { hasCitizenCard: bool } }
 *
 * @param {string} userId - UUID del usuario
 * @returns {Promise<boolean>} true si el usuario ya tiene la tarjeta
 */
export const hasCitizenCard = async (userId) => {
  try {
    const response = await walletClient.get(
      `/TRANSMETRO-CONECTA-CLIENTE/v1/wallets/balance?userId=${userId}`
    );
    if (response.status >= 200 && response.status < 300) {
      return response.data?.Data?.HasCitizenCard ?? false;
    }
  } catch (err) {
    // Fallback seguro: asumir que no tiene tarjeta en caso de error de conexión
    console.error('[TransmetroAuth] WalletIntegration | hasCitizenCard error:', err.message);
  }
  return false;
};
