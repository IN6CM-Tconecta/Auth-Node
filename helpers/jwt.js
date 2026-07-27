import jwt from 'jsonwebtoken';
import { config } from '../configs/config.js';

/**
 * Claim name del rol que ASP.NET Core emite por defecto.
 * El Client-User decodifica el JWT buscando este claim exacto:
 *   decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
 *
 * Lo incluimos en el payload para garantizar compatibilidad total con
 * todos los clientes que antes consumían el Auth-Server .NET.
 */
const DOTNET_ROLE_CLAIM = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

/**
 * Genera un JWT de acceso para el usuario autenticado.
 *
 * Replica exactamente el GenerateToken del TokenService.cs:
 *   - Algoritmo: HS256
 *   - Claims: sub (userId), cui, role (ClaimTypes.Role)
 *   - Claim adicional: claim namespace .NET para compatibilidad con Client-User
 *   - Expiración: 2h (configurable via JWT_EXPIRES_IN)
 *
 * @param {object} user - Instancia del modelo User de Sequelize
 * @returns {Promise<string>} JWT firmado
 */
export const generateAccessToken = (user) => {
  return new Promise((resolve, reject) => {
    const payload = {
      sub: user.Id.toString(),
      cui: user.CUI,
      // Claim estándar de rol (leído por nuestro middleware validateJWT)
      role: user.Role,
      // Claim namespace de ASP.NET Identity — compatibilidad con Client-User:
      // decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
      [DOTNET_ROLE_CLAIM]: user.Role,
    };

    const options = {
      expiresIn: config.jwt.expiresIn,
      issuer: config.jwt.issuer,
      audience: config.jwt.audience,
      algorithm: 'HS256',
    };

    jwt.sign(payload, config.jwt.secret, options, (err, token) => {
      if (err) {
        console.error('[TransmetroAuth] Error generando access token:', err.message);
        return reject(err);
      }
      resolve(token);
    });
  });
};

/**
 * Genera un JWT temporal para el flujo de restablecimiento de contraseña.
 *
 * Replica exactamente el GeneratePasswordResetToken del TokenService.cs:
 *   - Claims: sub (userId), email (ClaimTypes.Email), purpose ("PasswordReset")
 *   - Expiración: 15 minutos
 *
 * @param {object} user - Instancia del modelo User de Sequelize
 * @returns {Promise<string>} JWT de reset firmado
 */
export const generatePasswordResetToken = (user) => {
  return new Promise((resolve, reject) => {
    const payload = {
      sub: user.Id.toString(),
      email: user.Email,
      purpose: 'PasswordReset',
    };

    const options = {
      expiresIn: config.jwt.resetExpiresIn,
      issuer: config.jwt.issuer,
      audience: config.jwt.audience,
      algorithm: 'HS256',
    };

    jwt.sign(payload, config.jwt.secret, options, (err, token) => {
      if (err) {
        console.error('[TransmetroAuth] Error generando reset token:', err.message);
        return reject(err);
      }
      resolve(token);
    });
  });
};

/**
 * Valida un JWT de reset verificando firma, expiración, issuer, audience
 * y que el claim 'purpose' sea exactamente "PasswordReset".
 *
 * Replica exactamente el ValidatePasswordResetToken del TokenService.cs.
 *
 * @param {string} token - JWT a validar
 * @param {string} email - Email que debe coincidir con el claim del token
 * @returns {boolean}
 */
export const validatePasswordResetToken = (token, email) => {
  try {
    const decoded = jwt.verify(token, config.jwt.secret, {
      issuer: config.jwt.issuer,
      audience: config.jwt.audience,
      algorithms: ['HS256'],
    });

    return decoded.email === email && decoded.purpose === 'PasswordReset';
  } catch {
    return false;
  }
};

/**
 * Verifica y decodifica un Bearer JWT de acceso.
 *
 * @param {string} token - JWT sin el prefijo "Bearer "
 * @returns {Promise<object>} Payload decodificado
 */
export const verifyAccessToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(
      token,
      config.jwt.secret,
      {
        issuer: config.jwt.issuer,
        audience: config.jwt.audience,
        algorithms: ['HS256'],
      },
      (err, decoded) => {
        if (err) return reject(err);
        resolve(decoded);
      }
    );
  });
};
