import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';

// Mock the queue manager
const mockJobs = new Map();
mockJobs.set('existing-job', {
  requestedKey: 'existing-job',
  status: 'completed',
  progress: 100,
  createdAt: '2024-01-15T10:00:00.000Z',
  updatedAt: '2024-01-15T10:01:00.000Z',
  filePath: 'pdf-files/existing-job__2024-01-15-10-01-00.pdf',
});
mockJobs.set('processing-job', {
  requestedKey: 'processing-job',
  status: 'processing',
  progress: 50,
  createdAt: '2024-01-15T10:00:00.000Z',
  updatedAt: '2024-01-15T10:00:30.000Z',
});
mockJobs.set('queued-job', {
  requestedKey: 'queued-job',
  status: 'queued',
  progress: 0,
  createdAt: '2024-01-15T10:00:00.000Z',
  updatedAt: '2024-01-15T10:00:00.000Z',
});
mockJobs.set('failed-job', {
  requestedKey: 'failed-job',
  status: 'failed',
  progress: 0,
  createdAt: '2024-01-15T10:00:00.000Z',
  updatedAt: '2024-01-15T10:01:00.000Z',
  error: 'Timeout exceeded',
});

vi.mock('../../src/services/queue-manager.js', () => ({
  queueManager: {
    getJobStatus: vi.fn((requestedKey) => mockJobs.get(requestedKey)),
    cancelJob: vi.fn((requestedKey) => {
      const job = mockJobs.get(requestedKey);
      if (!job) return false;
      if (job.status === 'completed' || job.status === 'failed') return false;
      job.status = 'cancelled';
      return true;
    }),
    getQueueStats: vi.fn(() => ({
      total: 4,
      queued: 1,
      processing: 1,
      completed: 1,
      failed: 1,
      cancelled: 0,
    })),
  },
}));

// Import after mocking
const { statusRoutes } = await import('../../src/routes/status.routes.js');

describe('Status Routes', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = Fastify({ logger: false });
    await app.register(statusRoutes);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/pdf/status/:requestedKey', () => {
    it('should return status for existing job', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/pdf/status/existing-job',
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.requestedKey).toBe('existing-job');
      expect(body.status).toBe('completed');
      expect(body.progress).toBe(100);
      expect(body.filePath).toBeDefined();
    });

    it('should return 404 for non-existent job', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/pdf/status/non-existent',
      });

      expect(response.statusCode).toBe(404);

      const body = JSON.parse(response.body);
      expect(body.error).toBe('Job not found');
    });

    it('should reject invalid requestedKey format', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/pdf/status/invalid key',
      });

      expect(response.statusCode).toBe(400);
    });

    it('should return processing status with progress', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/pdf/status/processing-job',
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.status).toBe('processing');
      expect(body.progress).toBe(50);
    });

    it('should return failed status with error', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/pdf/status/failed-job',
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.status).toBe('failed');
      expect(body.error).toBe('Timeout exceeded');
    });
  });

  describe('DELETE /api/pdf/cancel/:requestedKey', () => {
    it('should cancel a queued job', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/api/pdf/cancel/queued-job',
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.message).toBe('Job cancelled successfully');
      expect(body.status).toBe('cancelled');
    });

    it('should return 404 for non-existent job', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/api/pdf/cancel/non-existent',
      });

      expect(response.statusCode).toBe(404);
    });

    it('should return 409 for already completed job', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/api/pdf/cancel/existing-job',
      });

      expect(response.statusCode).toBe(409);

      const body = JSON.parse(response.body);
      expect(body.error).toBe('Job cannot be cancelled');
    });
  });

  describe('GET /api/pdf/queue', () => {
    it('should return queue statistics', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/pdf/queue',
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('total');
      expect(body).toHaveProperty('queued');
      expect(body).toHaveProperty('processing');
      expect(body).toHaveProperty('completed');
      expect(body).toHaveProperty('failed');
      expect(body).toHaveProperty('cancelled');
    });
  });
});
