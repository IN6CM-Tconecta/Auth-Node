import { verifyAccessToken } from '../helpers/jwt.js';
import { User } from '../models/user.model.js';

/**
 * Middleware de validación de JWT Bearer Token.
 *
 * Replica el comportamiento del AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
 * del Program.cs combinado con el [Authorize] attribute del .NET.
 *
 * Flujo:
 *   1. Extrae el token del header Authorization: Bearer <token>
 *   2. Verifica firma, expiración, issuer y audience
 *   3. Busca el usuario en BD para confirmar existencia y estado activo
 *   4. Adjunta `req.user` y `req.userId` para uso en controladores
 *
 * Errores que replican el comportamiento del .NET:
 *   - Sin token → 401 { message: "Token inválido o usuario no identificado." }
 *   - Token inválido → 401
 *   - Usuario no existe o inactivo → 401
 */
export const validateJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'] || req.headers['x-token'];

    if (!authHeader) {
      return res.status(401).json({
        message: 'Token inválido o usuario no identificado.',
      });
    }

    // Soporte para "Bearer <token>" y token directo
    const token = authHeader.startsWith('Bearer ')
      ? authHeader.slice(7)
      : authHeader;

    if (!token) {
      return res.status(401).json({
        message: 'Token inválido o usuario no identificado.',
      });
    }

    // Verificar y decodificar el token (lanza error si es inválido/expirado)
    const decoded = await verifyAccessToken(token);

    // Buscar el usuario en BD para validar existencia y estado activo
    const user = await User.findByPk(decoded.sub);

    if (!user) {
      return res.status(401).json({
        message: 'Token inválido o usuario no identificado.',
      });
    }

    if (!user.IsActive) {
      return res.status(401).json({
        message: 'Cuenta desactivada. Contacta al administrador.',
      });
    }

    // Adjuntar usuario al request para uso en controladores
    req.user = user;
    req.userId = user.Id;

    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expirado.' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Token inválido.' });
    }
    return res.status(401).json({ message: 'Token inválido o usuario no identificado.' });
  }
};
