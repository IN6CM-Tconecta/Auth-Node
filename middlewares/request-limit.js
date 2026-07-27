import rateLimit from 'express-rate-limit';
import { config } from '../configs/config.js';

/**
 * Rate limiter GLOBAL — aplicado a todas las rutas.
 * 100 solicitudes por minuto por IP.
 * Equivalente a una protección básica anti-DDoS.
 */
export const globalRateLimit = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      StatusCode: 429,
      Message: 'Demasiadas peticiones desde esta IP. Intenta de nuevo más tarde.',
      Detailed: null,
    });
  },
});

/**
 * Rate limiter para endpoints de AUTENTICACIÓN.
 * 10 solicitudes por minuto por IP — anti-brute-force.
 * Aplicar explícitamente en: /register, /login, /recover-password, /reset-password.
 */
export const authRateLimit = rateLimit({
  windowMs: config.rateLimit.authWindowMs,
  max: config.rateLimit.authMaxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.warn(`[TransmetroAuth] Rate limit de autenticación excedido — IP: ${req.ip} — Ruta: ${req.path}`);
    res.status(429).json({
      StatusCode: 429,
      Message: 'Demasiados intentos de autenticación. Intenta de nuevo en un minuto.',
      Detailed: null,
    });
  },
});
