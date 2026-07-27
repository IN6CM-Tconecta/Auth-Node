import { randomUUID } from 'crypto';

/**
 * Manejador global de errores de Express.
 *
 * Replica el comportamiento del GlobalExceptionMiddleware.cs del .NET:
 *   - UnauthorizedAccessException → 401
 *   - ArgumentException / ValidationException → 400
 *   - Resto → 500
 *
 * Respuesta estructurada compatible con los clientes existentes:
 *   { StatusCode, Message, Detailed }
 *
 * @param {Error} err - Error capturado
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} _next
 */
export const errorHandler = (err, req, res, _next) => {
  const traceId = randomUUID();
  const isDev = process.env.NODE_ENV === 'development';

  console.error(`[TransmetroAuth][${traceId}] Error en ${req.method} ${req.path}:`, err.message);
  if (isDev) console.error(err.stack);

  // ── JWT Errors ──────────────────────────────────────────
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      StatusCode: 401,
      Message: 'Token expirado.',
      Detailed: isDev ? err.message : null,
    });
  }

  if (err.name === 'JsonWebTokenError' || err.name === 'NotBeforeError') {
    return res.status(401).json({
      StatusCode: 401,
      Message: 'Token inválido.',
      Detailed: isDev ? err.message : null,
    });
  }

  // ── Error de acceso no autorizado (UnauthorizedAccessException) ─
  if (err.name === 'UnauthorizedError' || err.statusCode === 401) {
    return res.status(401).json({
      StatusCode: 401,
      Message: err.message || 'No autorizado.',
      Detailed: isDev ? err.stack : null,
    });
  }

  // ── Errores de validación / argumento (ArgumentException, ValidationError) ─
  if (
    err.name === 'ValidationError' ||
    err.name === 'SequelizeValidationError' ||
    err.name === 'SequelizeUniqueConstraintError' ||
    err.statusCode === 400
  ) {
    return res.status(400).json({
      StatusCode: 400,
      Message: err.message || 'Error de validación.',
      Detailed: isDev ? err.message : null,
    });
  }

  // ── Error con statusCode explícito ─────────────────────
  if (err.statusCode) {
    return res.status(err.statusCode).json({
      StatusCode: err.statusCode,
      Message: err.message || 'Error del servidor.',
      Detailed: isDev ? err.stack : null,
    });
  }

  // ── Error interno genérico (500) ────────────────────────
  return res.status(500).json({
    StatusCode: 500,
    Message: 'Error interno del servidor.',
    Detailed: isDev ? err.message : null,
  });
};

/**
 * Manejador de rutas no encontradas (404).
 * Equivalente al comportamiento por defecto de ASP.NET cuando
 * no existe un controlador para la ruta solicitada.
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
export const notFound = (req, res) => {
  res.status(404).json({
    StatusCode: 404,
    Message: `Ruta ${req.originalUrl} no encontrada.`,
    Detailed: null,
  });
};
