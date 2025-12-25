import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { queueManager } from '../services/queue-manager.js';

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  // GET /health - Basic health check
  app.get('/health', async (_request: FastifyRequest, reply: FastifyReply) => {
    return reply.send({
      status: 'healthy',
      timestamp: new Date().toISOString(),
    });
  });

  // GET /health/ready - Readiness check (for k8s)
  app.get('/health/ready', async (_request: FastifyRequest, reply: FastifyReply) => {
    // Check if the service is ready to accept requests
    // In a real scenario, you might check database connections, etc.
    return reply.send({
      status: 'ready',
      timestamp: new Date().toISOString(),
    });
  });

  // GET /health/live - Liveness check (for k8s)
  app.get('/health/live', async (_request: FastifyRequest, reply: FastifyReply) => {
    const queueStats = queueManager.getQueueStats();

    return reply.send({
      status: 'alive',
      timestamp: new Date().toISOString(),
      queue: queueStats,
    });
  });
}
