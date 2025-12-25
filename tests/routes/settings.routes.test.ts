import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import Fastify, { FastifyInstance } from 'fastify';

// Mock the settings manager
const mockSettings = {
  browser: {
    maxConcurrent: 3,
    defaultTimeout: 30000,
    defaultViewport: { width: 1920, height: 1080 },
    launchOptions: { headless: true, args: [] },
  },
  pdf: {
    defaultFormat: 'A4',
    defaultMargin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
    printBackground: true,
  },
  queue: {
    maxSize: 100,
    processingTimeout: 60000,
    retryAttempts: 2,
    retryDelay: 1000,
  },
  storage: {
    outputDir: 'pdf-files',
    cleanupAfterHours: 24,
  },
};

vi.mock('../../src/services/settings-manager.js', () => ({
  settingsManager: {
    get: vi.fn(() => ({ ...mockSettings })),
    update: vi.fn(async (newSettings) => ({
      ...mockSettings,
      ...newSettings,
    })),
    reset: vi.fn(async () => ({ ...mockSettings })),
  },
}));

// Import after mocking
const { settingsRoutes } = await import('../../src/routes/settings.routes.js');

describe('Settings Routes', () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = Fastify({ logger: false });
    await app.register(settingsRoutes);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/settings', () => {
    it('should return current settings', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/settings',
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('browser');
      expect(body).toHaveProperty('pdf');
      expect(body).toHaveProperty('queue');
      expect(body).toHaveProperty('storage');
      expect(body.browser.maxConcurrent).toBe(3);
      expect(body.pdf.defaultFormat).toBe('A4');
    });
  });

  describe('PUT /api/settings', () => {
    it('should update settings with valid data', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/api/settings',
        payload: {
          browser: {
            maxConcurrent: 5,
          },
        },
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.message).toBe('Settings updated successfully');
      expect(body.settings).toBeDefined();
    });

    it('should reject invalid settings', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/api/settings',
        payload: {
          browser: {
            maxConcurrent: 100, // exceeds max of 10
          },
        },
      });

      expect(response.statusCode).toBe(400);

      const body = JSON.parse(response.body);
      expect(body.error).toBe('Validation failed');
      expect(body.details).toBeDefined();
    });

    it('should accept partial updates', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/api/settings',
        payload: {
          queue: {
            maxSize: 50,
          },
        },
      });

      expect(response.statusCode).toBe(200);
    });

    it('should accept empty object', async () => {
      const response = await app.inject({
        method: 'PUT',
        url: '/api/settings',
        payload: {},
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('POST /api/settings/reset', () => {
    it('should reset settings to defaults', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/settings/reset',
      });

      expect(response.statusCode).toBe(200);

      const body = JSON.parse(response.body);
      expect(body.message).toBe('Settings reset to defaults');
      expect(body.settings).toBeDefined();
    });
  });
});
