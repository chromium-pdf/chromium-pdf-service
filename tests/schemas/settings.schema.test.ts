import { describe, it, expect } from 'vitest';
import {
  settingsUpdateSchema,
  browserSettingsSchema,
  pdfSettingsSchema,
  queueSettingsSchema,
  storageSettingsSchema,
} from '../../src/schemas/settings.schema.js';

describe('Settings Schemas', () => {
  describe('browserSettingsSchema', () => {
    it('should validate valid browser settings', () => {
      const settings = {
        maxConcurrent: 5,
        defaultTimeout: 30000,
        defaultViewport: { width: 1920, height: 1080 },
      };

      const result = browserSettingsSchema.safeParse(settings);
      expect(result.success).toBe(true);
    });

    it('should reject maxConcurrent below minimum', () => {
      const settings = {
        maxConcurrent: 0,
      };

      const result = browserSettingsSchema.safeParse(settings);
      expect(result.success).toBe(false);
    });

    it('should reject maxConcurrent above maximum', () => {
      const settings = {
        maxConcurrent: 15,
      };

      const result = browserSettingsSchema.safeParse(settings);
      expect(result.success).toBe(false);
    });

    it('should reject timeout below minimum', () => {
      const settings = {
        defaultTimeout: 500, // min is 1000
      };

      const result = browserSettingsSchema.safeParse(settings);
      expect(result.success).toBe(false);
    });

    it('should reject timeout above maximum', () => {
      const settings = {
        defaultTimeout: 150000, // max is 120000
      };

      const result = browserSettingsSchema.safeParse(settings);
      expect(result.success).toBe(false);
    });

    it('should accept partial settings', () => {
      const settings = {
        maxConcurrent: 3,
      };

      const result = browserSettingsSchema.safeParse(settings);
      expect(result.success).toBe(true);
    });
  });

  describe('pdfSettingsSchema', () => {
    it('should validate valid PDF settings', () => {
      const settings = {
        defaultFormat: 'A4',
        printBackground: true,
        defaultMargin: { top: '20mm', bottom: '20mm' },
      };

      const result = pdfSettingsSchema.safeParse(settings);
      expect(result.success).toBe(true);
    });

    it('should reject invalid format', () => {
      const settings = {
        defaultFormat: 'B5',
      };

      const result = pdfSettingsSchema.safeParse(settings);
      expect(result.success).toBe(false);
    });

    it('should accept all valid formats', () => {
      const formats = ['A4', 'Letter', 'Legal', 'A3', 'A5'];

      for (const format of formats) {
        const result = pdfSettingsSchema.safeParse({ defaultFormat: format });
        expect(result.success).toBe(true);
      }
    });
  });

  describe('queueSettingsSchema', () => {
    it('should validate valid queue settings', () => {
      const settings = {
        maxSize: 100,
        processingTimeout: 60000,
        retryAttempts: 3,
        retryDelay: 1000,
      };

      const result = queueSettingsSchema.safeParse(settings);
      expect(result.success).toBe(true);
    });

    it('should reject maxSize below minimum', () => {
      const settings = {
        maxSize: 0,
      };

      const result = queueSettingsSchema.safeParse(settings);
      expect(result.success).toBe(false);
    });

    it('should reject maxSize above maximum', () => {
      const settings = {
        maxSize: 1500, // max is 1000
      };

      const result = queueSettingsSchema.safeParse(settings);
      expect(result.success).toBe(false);
    });

    it('should reject retryAttempts above maximum', () => {
      const settings = {
        retryAttempts: 10, // max is 5
      };

      const result = queueSettingsSchema.safeParse(settings);
      expect(result.success).toBe(false);
    });

    it('should accept zero retryAttempts', () => {
      const settings = {
        retryAttempts: 0,
      };

      const result = queueSettingsSchema.safeParse(settings);
      expect(result.success).toBe(true);
    });
  });

  describe('storageSettingsSchema', () => {
    it('should validate valid storage settings', () => {
      const settings = {
        outputDir: 'custom-pdf-dir',
        cleanupAfterHours: 48,
      };

      const result = storageSettingsSchema.safeParse(settings);
      expect(result.success).toBe(true);
    });

    it('should reject empty outputDir', () => {
      const settings = {
        outputDir: '',
      };

      const result = storageSettingsSchema.safeParse(settings);
      expect(result.success).toBe(false);
    });

    it('should reject cleanupAfterHours below minimum', () => {
      const settings = {
        cleanupAfterHours: 0,
      };

      const result = storageSettingsSchema.safeParse(settings);
      expect(result.success).toBe(false);
    });

    it('should reject cleanupAfterHours above maximum', () => {
      const settings = {
        cleanupAfterHours: 800, // max is 720 (30 days)
      };

      const result = storageSettingsSchema.safeParse(settings);
      expect(result.success).toBe(false);
    });
  });

  describe('settingsUpdateSchema', () => {
    it('should validate full settings update', () => {
      const settings = {
        browser: {
          maxConcurrent: 5,
          defaultTimeout: 30000,
        },
        pdf: {
          defaultFormat: 'Letter',
          printBackground: false,
        },
        queue: {
          maxSize: 200,
        },
        storage: {
          cleanupAfterHours: 12,
        },
      };

      const result = settingsUpdateSchema.safeParse(settings);
      expect(result.success).toBe(true);
    });

    it('should accept empty object', () => {
      const result = settingsUpdateSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should accept partial nested updates', () => {
      const settings = {
        browser: {
          maxConcurrent: 2,
        },
      };

      const result = settingsUpdateSchema.safeParse(settings);
      expect(result.success).toBe(true);
    });

    it('should reject invalid nested values', () => {
      const settings = {
        browser: {
          maxConcurrent: 100, // exceeds max of 10
        },
      };

      const result = settingsUpdateSchema.safeParse(settings);
      expect(result.success).toBe(false);
    });
  });
});
