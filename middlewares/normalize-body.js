/**
 * Middleware para normalizar las claves del body (camelCase a PascalCase).
 *
 * Resuelve el problema de compatibilidad entre los frontends existentes
 * que envían JSON en camelCase (cui, email, password) y las validaciones
 * de express-validator que esperan el contrato estricto del .NET (CUI, Email, Password).
 *
 * Al copiar los valores al formato PascalCase antes de llegar a los validadores,
 * logramos compatibilidad total sin tener que duplicar validaciones.
 */
export const normalizeAuthBody = (req, res, next) => {
  if (!req.body) return next();

  // Mapeo Auth
  if (req.body.cui !== undefined) req.body.CUI = req.body.cui;
  if (req.body.email !== undefined) req.body.Email = req.body.email;
  if (req.body.password !== undefined) req.body.Password = req.body.password;
  if (req.body.token !== undefined) req.body.Token = req.body.token;
  if (req.body.newPassword !== undefined) req.body.NewPassword = req.body.newPassword;

  // Mapeo Transaction
  if (req.body.cardNumber !== undefined) req.body.CardNumber = req.body.cardNumber;
  if (req.body.expirationDate !== undefined) req.body.ExpirationDate = req.body.expirationDate;
  if (req.body.cvv !== undefined) req.body.CVV = req.body.cvv;
  if (req.body.amount !== undefined) req.body.Amount = req.body.amount;

  next();
};
