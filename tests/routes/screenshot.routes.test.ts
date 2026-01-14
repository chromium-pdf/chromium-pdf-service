import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';

// Mock the screenshot generator
vi.mock('../../src/services/screenshot-generator.js', () => ({
  screenshotGenerator: {
    generateFromHtml: vi.fn(async (requestedKey, html, options) => ({
      requestedKey,
      type: 'html',
      source: html,
      status: 'queued',
      progress: 0,
      priority: options?.priority ?? 5,
      createdAt: new Date(),
      updatedAt: new Date(),
      options: {
        browser: options?.browser ?? {},
        screenshot: options?.screenshot ?? {},
      },
    })),
    generateFromUrl: vi.fn(async (requestedKey, url, options) => ({
      requestedKey,
      type: 'url',
      source: url,
      status: 'queued',
      progress: 0,
      priority: options?.priority ?? 5,
      createdAt: new Date(),
      updatedAt: new Date(),
      options: {
        browser: options?.browser ?? {},
        screenshot: options?.screenshot ?? {},
      },
    })),
    generateFromFile: vi.fn(async (requestedKey, htmlContent, options) => ({
      requestedKey,
      type: 'file',
      source: htmlContent,
      status: 'queued',
      progress: 0,
      priority: options?.priority ?? 5,
      createdAt: new Date(),
      updatedAt: new Date(),
      options: {
        browser: options?.browser ?? {},
        screenshot: options?.screenshot ?? {},
      },
    })),
  },
}));

// Mock the screenshot queue manager
vi.mock('../../src/services/screenshot-queue-manager.js', () => ({
  screenshotQueueManager: {
    getJobStatus: vi.fn(() => null),
    removeJob: vi.fn(async () => true),
    cancelJob: vi.fn(() => true),
  },
}));

// Import after mocking
const { screenshotRoutes } = await import('../../src/routes/screenshot.routes.js');

describe('Screenshot Routes', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = Fastify({ logger: false });
    await app.register(screenshotRoutes);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/screenshot/from-html', () => {
    it('should accept valid HTML request', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/screenshot/from-html',
        payload: {
          requestedKey: 'test-ss-html-001',
          html: '<html><body>Test</body></html>',
        },
      });

      expect(response.statusCode).toBe(202);

      const body = JSON.parse(response.body);
      expect(body.message).toBe('Screenshot generation job queued');
      expect(body.requestedKey).toBe('test-ss-html-001');
      expect(body.status).toBe('queued');
    });

    it('should accept request with screenshot options', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/screenshot/from-html',
        payload: {
          requestedKey: 'test-ss-html-002',
          html: '<html><body>Test</body></html>',
          options: {
            screenshot: {
              type: 'png',
              fullPage: true,
              omitBackground: true,
            },
            browser: {
              timeout: 30000,
              viewport: { width: 1920, height: 1080 },
            },
            queue: {
              priority: 10,
            },
          },
        },
      });

      expect(response.statusCode).toBe(202);
    });

    it('should accept request with JPEG options', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/screenshot/from-html',
        payload: {
          requestedKey: 'test-ss-html-003',
          html: '<html><body>JPEG Test</body></html>',
          options: {
            screenshot: {
              type: 'jpeg',
              quality: 80,
            },
          },
        },
      });

      expect(response.statusCode).toBe(202);
    });

    it('should reject missing requestedKey', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/screenshot/from-html',
        payload: {
          html: '<html></html>',
        },
      });

      expect(response.statusCode).toBe(400);

      const body = JSON.parse(response.body);
      expect(body.error).toBe('Validation failed');
    });

    it('should reject missing html', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/screenshot/from-html',
        payload: {
          requestedKey: 'test-key',
        },
      });

      expect(response.statusCode).toBe(400);

      const body = JSON.parse(response.body);
      expect(body.error).toBe('Validation failed');
    });

    it('should reject invalid requestedKey format', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/screenshot/from-html',
        payload: {
          requestedKey: 'invalid key with spaces',
          html: '<html></html>',
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should reject empty html', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/screenshot/from-html',
        payload: {
          requestedKey: 'test-key',
          html: '',
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('POST /api/screenshot/from-url', () => {
    it('should accept valid URL request', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/screenshot/from-url',
        payload: {
          requestedKey: 'test-ss-url-001',
          url: 'https://example.com',
        },
      });

      expect(response.statusCode).toBe(202);

      const body = JSON.parse(response.body);
      expect(body.message).toBe('Screenshot generation job queued');
      expect(body.requestedKey).toBe('test-ss-url-001');
    });

    it('should accept URL with screenshot options', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/screenshot/from-url',
        payload: {
          requestedKey: 'test-ss-url-002',
          url: 'https://example.com',
          options: {
            screenshot: {
              type: 'png',
              fullPage: true,
            },
          },
        },
      });

      expect(response.statusCode).toBe(202);
    });

    it('should reject invalid URL', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/screenshot/from-url',
        payload: {
          requestedKey: 'test-key',
          url: 'not-a-valid-url',
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should reject URL without protocol', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/screenshot/from-url',
        payload: {
          requestedKey: 'test-key',
          url: 'example.com',
        },
      });

      expect(response.statusCode).toBe(400);
    });

    it('should accept URL with path and query params', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/screenshot/from-url',
        payload: {
          requestedKey: 'test-ss-url-003',
          url: 'https://example.com/page?param=value',
        },
      });

      expect(response.statusCode).toBe(202);
    });
  });

  describe('GET /api/screenshot/status/:requestedKey', () => {
    it('should return 404 for non-existent job', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/screenshot/status/non-existent-key',
      });

      expect(response.statusCode).toBe(404);

      const body = JSON.parse(response.body);
      expect(body.error).toContain('not found');
    });
  });

  describe('DELETE /api/screenshot/:requestedKey', () => {
    it('should cancel/remove a job', async () => {
      const response = await app.inject({
        method: 'DELETE',
        url: '/api/screenshot/test-key',
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.message).toBe('Screenshot job cancelled/removed');
      expect(body.requestedKey).toBe('test-key');
    });
  });
});
