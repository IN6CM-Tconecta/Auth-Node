/**
 * async-handler — Wrapper DRY para controladores async.
 *
 * Elimina la necesidad de bloques try-catch repetitivos en cada controlador,
 * delegando el manejo de errores al middleware global de Express.
 *
 * Equivalente al pipeline de excepciones del ASP.NET Core donde el
 * GlobalExceptionMiddleware captura todas las excepciones no controladas.
 *
 * Uso:
 *   router.post('/login', asyncHandler(loginController));
 *
 * @param {Function} fn - Función async del controlador (req, res, next)
 * @returns {Function} Middleware de Express con manejo de errores centralizado
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
