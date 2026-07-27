import bcrypt from 'bcryptjs';
import { config } from '../configs/config.js';

/**
 * Hashea una contraseña en texto plano usando BCrypt.
 *
 * Usa bcryptjs que es 100% compatible con el hash generado por
 * BCrypt.Net.BCrypt.HashPassword() del Auth-Server .NET.
 * Esto garantiza que los hashes existentes en la BD sean verificables.
 *
 * @param {string} plainPassword - Contraseña en texto plano
 * @returns {Promise<string>} Hash BCrypt
 */
export const hashPassword = async (plainPassword) => {
  const saltRounds = config.security.bcryptSaltRounds;
  return bcrypt.hash(plainPassword, saltRounds);
};

/**
 * Verifica una contraseña en texto plano contra un hash BCrypt.
 *
 * Compatible con hashes generados por BCrypt.Net.BCrypt.HashPassword().
 *
 * @param {string} plainPassword - Contraseña en texto plano a verificar
 * @param {string} hashedPassword - Hash BCrypt almacenado en BD
 * @returns {Promise<boolean>} true si la contraseña coincide
 */
export const verifyPassword = async (plainPassword, hashedPassword) => {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (err) {
    console.error('[TransmetroAuth] Error verificando contraseña:', err.message);
    return false;
  }
};
