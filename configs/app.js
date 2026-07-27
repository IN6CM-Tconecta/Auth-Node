import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { dbConnection } from './db.js';
import { corsOptions } from './cors-configuration.js';
import { helmetConfiguration } from './helmet-configuration.js';
import { globalRateLimit } from '../middlewares/request-limit.js';
import { errorHandler, notFound } from '../middlewares/error-handler.js';

// Importar modelos para que Sequelize los registre antes del sync
import '../models/user.model.js';

// Importar rutas de los módulos
import authRoutes from '../src/auth/auth.routes.js';
import transactionRoutes from '../src/transaction/transaction.routes.js';

const BASE_PATH = '/api';

/**
 * Registra los middlewares globales de la aplicación.
 * Orden replicado del pipeline de ASP.NET Core:
 * 1. Parsing de body
 * 2. CORS
 * 3. Helmet (cabeceras seguras)
 * 4. Rate limiting global
 * 5. Logger HTTP
 */
const applyMiddlewares = (app) => {
  app.use(express.urlencoded({ extended: false, limit: '1mb' }));
  app.use(express.json({ limit: '1mb' }));
  app.use(cors(corsOptions));
  app.use(helmet(helmetConfiguration));
  app.use(globalRateLimit);
  app.use(morgan(process.env.NODE_ENV === 'development' ? 'dev' : 'combined'));
};

/**
 * Registra todas las rutas de la aplicación.
 * Equivalente a MapControllers() + routing del .NET.
 */
const applyRoutes = (app) => {
  // ── Módulos principales ──────────────────────────────────
  app.use(`${BASE_PATH}/auth`, authRoutes);
  app.use(`${BASE_PATH}/transaction`, transactionRoutes);

  // ── Health check ─────────────────────────────────────────
  app.get(`${BASE_PATH}/health`, (_req, res) => {
    res.status(200).json({
      status: 'Healthy',
      service: 'TransmetroConecta Auth Node Service',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  // ── Bienvenida ───────────────────────────────────────────
  app.get('/', (_req, res) => {
    res.status(200).json({
      success: true,
      service: 'TransmetroConecta Auth Node Service',
      version: '1.0.0',
      status: 'online',
      endpoints: {
        health: `${BASE_PATH}/health`,
        auth: `${BASE_PATH}/auth`,
        transaction: `${BASE_PATH}/transaction`,
      },
      timestamp: new Date().toISOString(),
    });
  });

  // ── 404 Handler (debe ir al final) ───────────────────────
  app.use(notFound);
};

/**
 * Inicializa y arranca el servidor Express.
 * Equivalente al bloque `app.Run()` del Program.cs.
 */
export const initServer = async () => {
  const app = express();
  const PORT = process.env.PORT || 5001;

  // Confiar en el proxy inverso (nginx, ELB, etc.)
  app.set('trust proxy', 1);

  try {
    // 1. Conectar a BD y sincronizar modelos (equivalente a ApplyPendingMigrationsAsync)
    await dbConnection();

    // 2. Aplicar middlewares globales
    applyMiddlewares(app);

    // 3. Registrar rutas
    applyRoutes(app);

    // 4. Manejador global de errores (debe ir DESPUÉS de las rutas)
    app.use(errorHandler);

    // 5. Arrancar servidor
    app.listen(PORT, () => {
      console.log(`[TransmetroAuth] Servidor corriendo en http://localhost:${PORT}`);
      console.log(`[TransmetroAuth] Health check: http://localhost:${PORT}${BASE_PATH}/health`);
      console.log(`[TransmetroAuth] Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
    console.error(`[TransmetroAuth] Error fatal al iniciar el servidor: ${err.message}`);
    process.exit(1);
  }
};
