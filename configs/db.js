import { Sequelize } from 'sequelize';
import { config } from './config.js';

// ──────────────────────────────────────────────
// Opciones compartidas de Sequelize
// ──────────────────────────────────────────────
const sequelizeOptions = {
  dialect: 'postgres',
  logging: config.app.nodeEnv === 'development' ? console.log : false,
  define: {
    freezeTableName: true,
    timestamps: false, // Gestionamos createdAt manualmente igual que el .NET
    underscored: true,
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};

// Soporte para DATABASE_URL (Docker/PaaS) o variables individuales (local)
export const sequelize = config.db.url
  ? new Sequelize(config.db.url, sequelizeOptions)
  : new Sequelize(
      config.db.name,
      config.db.username,
      config.db.password,
      {
        host: config.db.host,
        port: config.db.port,
        ...sequelizeOptions,
      }
    );

/**
 * Establece la conexión a PostgreSQL, sincroniza los modelos y ejecuta el seeder
 * si la base de datos está vacía (equivalente a ApplyPendingMigrationsAsync del .NET).
 */
export const dbConnection = async () => {
  try {
    console.log('[TransmetroAuth] PostgreSQL | Intentando conectar...');

    await sequelize.authenticate();
    console.log('[TransmetroAuth] PostgreSQL | Conexión establecida correctamente.');

    // Sincronizar modelos (crea/altera tablas automáticamente)
    await sequelize.sync({ alter: true });
    console.log('[TransmetroAuth] PostgreSQL | Modelos sincronizados con la base de datos.');

    // Ejecutar seeder automático si la BD está vacía
    try {
      const { User } = await import('../models/user.model.js');
      const { seedDatabase } = await import('../models/seed.js');
      const count = await User.count();
      if (count === 0) {
        console.log('[TransmetroAuth] PostgreSQL | BD vacía detectada. Ejecutando seeder...');
        await seedDatabase();
        console.log('[TransmetroAuth] PostgreSQL | Seeder completado exitosamente.');
      }
    } catch (seedErr) {
      console.error('[TransmetroAuth] PostgreSQL | Error ejecutando seeder:', seedErr.message);
    }
  } catch (error) {
    console.error('[TransmetroAuth] PostgreSQL | Error al conectar:', error.message);
    process.exit(1);
  }
};

// ──────────────────────────────────────────────
// Cierre limpio de conexión al detener el proceso
// ──────────────────────────────────────────────
const gracefulShutdown = async (signal) => {
  console.log(`[TransmetroAuth] Recibida señal ${signal}. Cerrando conexión a BD...`);
  try {
    await sequelize.close();
    console.log('[TransmetroAuth] Conexión a BD cerrada correctamente.');
    process.exit(0);
  } catch (error) {
    console.error('[TransmetroAuth] Error al cerrar la BD:', error.message);
    process.exit(1);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
