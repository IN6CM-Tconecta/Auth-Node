import dotenv from 'dotenv';
import 'pg';
import { initServer } from './configs/app.js';

// Cargar variables de entorno antes de cualquier otra importación
dotenv.config();

// ──────────────────────────────────────────────
// Manejo de errores no capturados a nivel de proceso
// ──────────────────────────────────────────────
process.on('uncaughtException', (err) => {
  console.error('[TransmetroAuth] Uncaught Exception:', err.message);
  console.error(err.stack);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[TransmetroAuth] Unhandled Rejection at:', promise);
  console.error('[TransmetroAuth] Reason:', reason);
  process.exit(1);
});

// Inicializar el servidor Express
initServer();
