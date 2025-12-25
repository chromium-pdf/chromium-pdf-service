import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';

// Mock the PDF generator
vi.mock('../../src/services/pdf-generator.js', () => ({
  pdfGenerator: {
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
        pdf: options?.pdf ?? {},
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
        pdf: options?.pdf ?? {},
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
        pdf: options?.pdf ?? {},
      },
    })),
  },
}));

// Import after mocking
const { pdfRoutes } = await import('../../src/routes/pdf.routes.js');

describe('PDF Routes', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = Fastify({ logger: false });
    await app.register(pdfRoutes);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/pdf/from-html', () => {
    it('should accept valid HTML request', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/pdf/from-html',
        payload: {
          requestedKey: 'test-html-001',
          html: '<html><body>Test</body></html>',
        },
      });

      expect(response.statusCode).toBe(202);

      const body = JSON.parse(response.body);
      expect(body.message).toBe('PDF generation job queued');
      expect(body.requestedKey).toBe('test-html-001');
      expect(body.status).toBe('queued');
    });

    it('should accept request with options', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/pdf/from-html',
        payload: {
          requestedKey: 'test-html-002',
          html: '<html><body>Test</body></html>',
          options: {
            pdf: {
              format: 'A4',
              printBackground: true,
            },
            browser: {
              timeout: 30000,
            },
            queue: {
              priority: 10,
            },
          },
        },
      });

      expect(response.statusCode).toBe(202);
    });

    it('should reject missing requestedKey', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/pdf/from-html',
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
        url: '/api/pdf/from-html',
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
        url: '/api/pdf/from-html',
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
        url: '/api/pdf/from-html',
        payload: {
          requestedKey: 'test-key',
          html: '',
        },
      });

      expect(response.statusCode).toBe(400);
    });
  });

  describe('POST /api/pdf/from-url', () => {
    it('should accept valid URL request', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/pdf/from-url',
        payload: {
          requestedKey: 'test-url-001',
          url: 'https://example.com',
        },
      });

      expect(response.statusCode).toBe(202);

      const body = JSON.parse(response.body);
      expect(body.message).toBe('PDF generation job queued');
      expect(body.requestedKey).toBe('test-url-001');
    });

    it('should reject invalid URL', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/pdf/from-url',
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
        url: '/api/pdf/from-url',
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
        url: '/api/pdf/from-url',
        payload: {
          requestedKey: 'test-url-002',
          url: 'https://example.com/page?param=value',
        },
      });

      expect(response.statusCode).toBe(202);
    });
  });
});
