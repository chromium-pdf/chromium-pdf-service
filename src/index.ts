import { buildApp } from './app.js';
import { logger } from './utils/logger.js';
import { env, isDevelopment } from './config/env.js';
import { settingsManager } from './services/settings-manager.js';
import { pdfGenerator } from './services/pdf-generator.js';

async function start(): Promise<void> {
  // Initialize settings
  await settingsManager.initialize();

  // Initialize PDF generator (launches browser)
  await pdfGenerator.initialize();

  const app = await buildApp();

  try {
    await app.listen({ port: env.port, host: env.host });
    logger.info(`Server is running on http://${env.host}:${env.port}`);
    if (isDevelopment) {
      logger.info(`API documentation available at http://${env.host}:${env.port}/docs`);
    }
  } catch (err) {
    logger.error(err, 'Failed to start server');
    process.exit(1);
  }

  // Graceful shutdown handlers
  const shutdown = async (signal: string): Promise<void> => {
    logger.info(`Received ${signal}, shutting down gracefully...`);
    try {
      await app.close();
      await pdfGenerator.close();
      logger.info('Server closed successfully');
      process.exit(0);
    } catch (err) {
      logger.error(err, 'Error during shutdown');
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start();
