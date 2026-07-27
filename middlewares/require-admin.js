/**
 * Middleware de verificación de rol Administrador.
 *
 * Replica el [Authorize(Roles = "Admin")] attribute del .NET.
 * Debe usarse DESPUÉS de validateJWT.
 *
 * Verifica que req.user.Role sea exactamente "Admin"
 * (mismo valor de string que el enum Role.Admin.ToString() en .NET).
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      message: 'Token inválido o usuario no identificado.',
    });
  }

  if (req.user.Role !== 'Admin') {
    return res.status(403).json({
      message: 'Acceso denegado. Se requieren privilegios de Administrador.',
    });
  }

  next();
};
