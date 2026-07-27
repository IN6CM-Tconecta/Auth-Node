import dotenv from 'dotenv';

dotenv.config();

/**
 * Configuración centralizada del servicio Auth-Node de TransmetroConecta.
 * Replica exactamente las claves de appsettings.json del Auth-Server .NET.
 */
export const config = {
  // ── Aplicación ──────────────────────────────────────────
  app: {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 5001,
  },

  // ── PostgreSQL — ConnectionStrings:DefaultConnection ───
  db: {
    url: process.env.DATABASE_URL || null,
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    name: process.env.DB_NAME || 'TransmetroAuthDb',
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  },

  // ── JWT — Jwt:Secret / Jwt:Issuer / Jwt:Audience ───────
  jwt: {
    secret: process.env.JWT_SECRET || 'A_SUPER_SECRET_KEY_FOR_TRANSMETRO_CONECTA_12345',
    issuer: process.env.JWT_ISSUER || 'TransmetroAuthServer',
    audience: process.env.JWT_AUDIENCE || 'TransmetroUsers',
    expiresIn: process.env.JWT_EXPIRES_IN || '2h',
    resetExpiresIn: process.env.JWT_RESET_EXPIRES_IN || '15m',
  },

  // ── WalletService — WalletService:BaseUrl ──────────────
  wallet: {
    baseUrl: process.env.WALLET_SERVICE_URL || 'http://server-client:3002',
    internalSecret: process.env.INTERNAL_SECRET || 'SuperSecretS2S_Transmetro2026',
  },

  // ── CORS ─────────────────────────────────────────────────
  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
      : [],
  },

  // ── Seguridad ─────────────────────────────────────────────
  security: {
    bcryptSaltRounds: 10,
  },

  // ── Rate Limiting ─────────────────────────────────────────
  rateLimit: {
    // Global: 100 req/min por IP
    windowMs: 60 * 1000,
    maxRequests: 100,
    // Auth endpoints: 10 req/min (anti-brute-force)
    authWindowMs: 60 * 1000,
    authMaxRequests: 10,
  },
};
