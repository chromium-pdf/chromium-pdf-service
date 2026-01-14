import { describe, it, expect } from 'vitest';
import {
  htmlScreenshotRequestSchema,
  urlScreenshotRequestSchema,
  screenshotOptionsSchema,
} from '../../src/schemas/screenshot.schema.js';

describe('Screenshot Schemas', () => {
  describe('htmlScreenshotRequestSchema', () => {
    it('should validate a valid HTML request', () => {
      const validRequest = {
        requestedKey: 'test-key-123',
        html: '<html><body>Hello</body></html>',
      };

      const result = htmlScreenshotRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should validate request with all options', () => {
      const fullRequest = {
        requestedKey: 'screenshot-001',
        html: '<html><body>Screenshot</body></html>',
        options: {
          browser: {
            timeout: 30000,
            viewport: { width: 1920, height: 1080 },
          },
          screenshot: {
            type: 'png',
            fullPage: true,
            omitBackground: true,
          },
          queue: {
            priority: 5,
          },
        },
      };

      const result = htmlScreenshotRequestSchema.safeParse(fullRequest);
      expect(result.success).toBe(true);
    });

    it('should reject empty requestedKey', () => {
      const invalidRequest = {
        requestedKey: '',
        html: '<html></html>',
      };

      const result = htmlScreenshotRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should reject requestedKey with invalid characters', () => {
      const invalidRequest = {
        requestedKey: 'test key with spaces',
        html: '<html></html>',
      };

      const result = htmlScreenshotRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should accept requestedKey with dashes and underscores', () => {
      const validRequest = {
        requestedKey: 'test-key_123',
        html: '<html></html>',
      };

      const result = htmlScreenshotRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should accept reCreate option', () => {
      const validRequest = {
        requestedKey: 'test-key',
        html: '<html></html>',
        reCreate: true,
      };

      const result = htmlScreenshotRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should reject empty html', () => {
      const invalidRequest = {
        requestedKey: 'test-key',
        html: '',
      };

      const result = htmlScreenshotRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should reject missing html field', () => {
      const invalidRequest = {
        requestedKey: 'test-key',
      };

      const result = htmlScreenshotRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });
  });

  describe('urlScreenshotRequestSchema', () => {
    it('should validate a valid URL request', () => {
      const validRequest = {
        requestedKey: 'website-123',
        url: 'https://example.com',
      };

      const result = urlScreenshotRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should reject invalid URL', () => {
      const invalidRequest = {
        requestedKey: 'test',
        url: 'not-a-valid-url',
      };

      const result = urlScreenshotRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should reject URL without protocol', () => {
      const invalidRequest = {
        requestedKey: 'test',
        url: 'example.com',
      };

      const result = urlScreenshotRequestSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });

    it('should accept URL with path and query params', () => {
      const validRequest = {
        requestedKey: 'test',
        url: 'https://example.com/page?param=value&other=123',
      };

      const result = urlScreenshotRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('should accept request with screenshot options', () => {
      const validRequest = {
        requestedKey: 'test',
        url: 'https://example.com',
        options: {
          screenshot: {
            type: 'jpeg',
            quality: 80,
          },
        },
      };

      const result = urlScreenshotRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });
  });

  describe('screenshotOptionsSchema', () => {
    it('should validate valid PNG options', () => {
      const options = {
        type: 'png',
        fullPage: true,
        omitBackground: true,
      };

      const result = screenshotOptionsSchema.safeParse(options);
      expect(result.success).toBe(true);
    });

    it('should validate valid JPEG options with quality', () => {
      const options = {
        type: 'jpeg',
        quality: 80,
        fullPage: true,
      };

      const result = screenshotOptionsSchema.safeParse(options);
      expect(result.success).toBe(true);
    });

    it('should reject quality for PNG type', () => {
      const options = {
        type: 'png',
        quality: 80,
      };

      const result = screenshotOptionsSchema.safeParse(options);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Quality option is only valid for JPEG');
      }
    });

    it('should accept empty object', () => {
      const result = screenshotOptionsSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should validate clip region', () => {
      const options = {
        fullPage: false,
        clip: {
          x: 0,
          y: 0,
          width: 800,
          height: 600,
        },
      };

      const result = screenshotOptionsSchema.safeParse(options);
      expect(result.success).toBe(true);
    });

    it('should reject both fullPage and clip', () => {
      const options = {
        fullPage: true,
        clip: {
          x: 0,
          y: 0,
          width: 800,
          height: 600,
        },
      };

      const result = screenshotOptionsSchema.safeParse(options);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Cannot use both fullPage and clip');
      }
    });

    it('should accept scale option', () => {
      const options = {
        scale: 'device',
      };

      const result = screenshotOptionsSchema.safeParse(options);
      expect(result.success).toBe(true);
    });

    it('should reject invalid scale option', () => {
      const options = {
        scale: 'invalid',
      };

      const result = screenshotOptionsSchema.safeParse(options);
      expect(result.success).toBe(false);
    });

    it('should reject quality out of range', () => {
      const options = {
        type: 'jpeg',
        quality: 150,
      };

      const result = screenshotOptionsSchema.safeParse(options);
      expect(result.success).toBe(false);
    });

    it('should accept quality at boundaries', () => {
      const minQuality = screenshotOptionsSchema.safeParse({ type: 'jpeg', quality: 0 });
      const maxQuality = screenshotOptionsSchema.safeParse({ type: 'jpeg', quality: 100 });

      expect(minQuality.success).toBe(true);
      expect(maxQuality.success).toBe(true);
    });

    it('should reject negative clip dimensions', () => {
      const options = {
        clip: {
          x: -10,
          y: 0,
          width: 800,
          height: 600,
        },
      };

      const result = screenshotOptionsSchema.safeParse(options);
      expect(result.success).toBe(false);
    });

    it('should reject clip dimensions exceeding max', () => {
      const options = {
        clip: {
          x: 0,
          y: 0,
          width: 15000,
          height: 600,
        },
      };

      const result = screenshotOptionsSchema.safeParse(options);
      expect(result.success).toBe(false);
    });

    it('should accept all valid types', () => {
      const pngResult = screenshotOptionsSchema.safeParse({ type: 'png' });
      const jpegResult = screenshotOptionsSchema.safeParse({ type: 'jpeg' });

      expect(pngResult.success).toBe(true);
      expect(jpegResult.success).toBe(true);
    });

    it('should reject invalid type', () => {
      const options = {
        type: 'gif',
      };

      const result = screenshotOptionsSchema.safeParse(options);
      expect(result.success).toBe(false);
    });
  });
});
