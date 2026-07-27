import { config } from './config.js';

/**
 * Configuración de CORS.
 * En producción solo permite los orígenes definidos en ALLOWED_ORIGINS.
 * En desarrollo permite cualquier origen para facilitar las pruebas locales.
 */
export const corsOptions = {
  origin: (origin, callback) => {
    // Permitir peticiones sin origin (ej. curl, Postman, servicios internos S2S)
    if (!origin) return callback(null, true);

    if (config.app.nodeEnv === 'development') {
      return callback(null, true);
    }

    const allowed = config.cors.allowedOrigins;
    if (allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS_VIOLATION: Origen '${origin}' no autorizado.`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-token', 'x-internal-secret'],
};
