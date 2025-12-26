import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { queueManager } from '../services/queue-manager.js';

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  // GET /health - Basic health check
  app.get('/health', {
    schema: {
      description: 'Basic health check',
      tags: ['Health'],
      response: {
        200: {
          description: 'Service is healthy',
          type: 'object',
          additionalProperties: true,
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string' },
          },
        },
      },
    },
  }, async (_request: FastifyRequest, reply: FastifyReply) => {
    return reply.send({
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
  });

  // GET /health/ready - Readiness check (for k8s)
  app.get('/health/ready', {
    schema: {
      description: 'Readiness check for Kubernetes',
      tags: ['Health'],
      response: {
        200: {
          description: 'Service is ready',
          type: 'object',
          additionalProperties: true,
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string' },
          },
        },
      },
    },
  }, async (_request: FastifyRequest, reply: FastifyReply) => {
    // Check if the service is ready to accept requests
    // In a real scenario, you might check database connections, etc.
    return reply.send({
      status: 'ready',
      timestamp: new Date().toISOString(),
    });
  });

  // GET /health/live - Liveness check (for k8s)
  app.get('/health/live', {
    schema: {
      description: 'Liveness check for Kubernetes with queue stats',
      tags: ['Health'],
      response: {
        200: {
          description: 'Service is alive',
          type: 'object',
          additionalProperties: true,
          properties: {
            status: { type: 'string' },
            timestamp: { type: 'string' },
            queue: {
              type: 'object',
              additionalProperties: true,
              properties: {
                queued: { type: 'number' },
                processing: { type: 'number' },
                completed: { type: 'number' },
                failed: { type: 'number' },
                cancelled: { type: 'number' },
                total: { type: 'number' },
              },
            },
          },
        },
      },
    },
  }, async (_request: FastifyRequest, reply: FastifyReply) => {
    const queueStats = queueManager.getQueueStats();

    return reply.send({
      status: 'alive',
      timestamp: new Date().toISOString(),
      queue: queueStats,
    });
  });
}
