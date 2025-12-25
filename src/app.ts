import Fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import { isDevelopment } from './config/env.js';
import { pdfRoutes } from './routes/pdf.routes.js';
import { statusRoutes } from './routes/status.routes.js';
import { settingsRoutes } from './routes/settings.routes.js';
import { healthRoutes } from './routes/health.routes.js';
import { errorHandler } from './middleware/error-handler.js';

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: isDevelopment
      ? {
          transport: {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'SYS:standard',
              ignore: 'pid,hostname',
            },
          },
        }
      : true,
  });

  // Register error handler
  app.setErrorHandler(errorHandler);

  // Register CORS
  await app.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  });

  // Register routes
  await app.register(healthRoutes);
  await app.register(pdfRoutes);
  await app.register(statusRoutes);
  await app.register(settingsRoutes);

  // Root route
  app.get('/', async () => {
    return {
      service: 'chromium-pdf-service',
      version: '1.0.0',
      status: 'running',
    };
  });

  return app;
}
