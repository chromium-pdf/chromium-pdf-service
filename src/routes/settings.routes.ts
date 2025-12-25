import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { settingsManager } from '../services/settings-manager.js';
import { settingsUpdateSchema, SettingsUpdate } from '../schemas/settings.schema.js';
import { ZodError } from 'zod';

export async function settingsRoutes(app: FastifyInstance): Promise<void> {
  // GET /api/settings - Get current settings
  app.get('/api/settings', async (_request: FastifyRequest, reply: FastifyReply) => {
    const settings = settingsManager.get();
    return reply.send(settings);
  });

  // PUT /api/settings - Update settings
  app.put(
    '/api/settings',
    async (request: FastifyRequest<{ Body: SettingsUpdate }>, reply: FastifyReply) => {
      try {
        const body = settingsUpdateSchema.parse(request.body);

        const updatedSettings = await settingsManager.update(body);

        return reply.send({
          message: 'Settings updated successfully',
          settings: updatedSettings,
        });
      } catch (error) {
        if (error instanceof ZodError) {
          return reply.status(400).send({
            error: 'Validation failed',
            details: error.errors,
          });
        }
        throw error;
      }
    }
  );

  // POST /api/settings/reset - Reset settings to defaults
  app.post('/api/settings/reset', async (_request: FastifyRequest, reply: FastifyReply) => {
    const defaultSettings = await settingsManager.reset();

    return reply.send({
      message: 'Settings reset to defaults',
      settings: defaultSettings,
    });
  });
}
