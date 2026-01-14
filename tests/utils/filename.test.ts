import { describe, it, expect } from 'vitest';
import {
  generatePdfFilename,
  generateDateFolder,
  parsePdfFilename,
  generateScreenshotFilename,
  parseScreenshotFilename,
} from '../../src/utils/filename.js';

describe('Filename Utilities', () => {
  describe('generateDateFolder', () => {
    it('should generate folder with dd-mm-yyyy format', () => {
      const date = new Date('2024-01-15T10:30:45.000Z');
      const folder = generateDateFolder(date);

      expect(folder).toBe('15-01-2024');
    });

    it('should pad single digit values with zeros', () => {
      const date = new Date('2024-01-05T08:05:09.000Z');
      const folder = generateDateFolder(date);

      expect(folder).toBe('05-01-2024');
    });

    it('should use current date when not provided', () => {
      const folder = generateDateFolder();

      expect(folder).toMatch(/^\d{2}-\d{2}-\d{4}$/);
    });
  });

  describe('generatePdfFilename', () => {
    it('should generate filename with date and time format', () => {
      const date = new Date('2024-01-15T10:30:45.000Z');
      const filename = generatePdfFilename('invoice-123', date);

      // Note: The hour will depend on the timezone
      expect(filename).toMatch(/^invoice-123__15-01-2024_\d{2}-30-45\.pdf$/);
    });

    it('should use current date/time when not provided', () => {
      const filename = generatePdfFilename('test-key');

      expect(filename).toMatch(/^test-key__\d{2}-\d{2}-\d{4}_\d{2}-\d{2}-\d{2}\.pdf$/);
    });

    it('should handle requestedKey with dashes and underscores', () => {
      const date = new Date('2024-06-20T15:45:30.000Z');
      const filename = generatePdfFilename('my-test_key-123', date);

      expect(filename).toContain('my-test_key-123__');
      expect(filename.endsWith('.pdf')).toBe(true);
    });

    it('should pad single digit values with zeros', () => {
      const date = new Date('2024-01-05T08:05:09.000Z');
      const filename = generatePdfFilename('test', date);

      // Should have padded date and time values
      expect(filename).toMatch(/test__05-01-2024_\d{2}-05-09\.pdf/);
    });
  });

  describe('parsePdfFilename', () => {
    it('should parse valid filename correctly', () => {
      const filename = 'invoice-123__15-01-2024_10-30-45.pdf';
      const result = parsePdfFilename(filename);

      expect(result).not.toBeNull();
      expect(result?.requestedKey).toBe('invoice-123');
      expect(result?.timestamp).toBeInstanceOf(Date);
      expect(result?.timestamp.getFullYear()).toBe(2024);
      expect(result?.timestamp.getMonth()).toBe(0); // January is 0
      expect(result?.timestamp.getDate()).toBe(15);
      expect(result?.timestamp.getHours()).toBe(10);
      expect(result?.timestamp.getMinutes()).toBe(30);
      expect(result?.timestamp.getSeconds()).toBe(45);
    });

    it('should parse filename with complex requestedKey', () => {
      const filename = 'my-complex_key-with-123__31-12-2024_23-59-59.pdf';
      const result = parsePdfFilename(filename);

      expect(result).not.toBeNull();
      expect(result?.requestedKey).toBe('my-complex_key-with-123');
    });

    it('should return null for invalid filename format', () => {
      const invalidFilenames = [
        'invalid-filename.pdf',
        'no-timestamp__.pdf',
        'missing__extension',
        'wrong__10-30-45.pdf', // old format without date
        '',
      ];

      for (const filename of invalidFilenames) {
        const result = parsePdfFilename(filename);
        expect(result).toBeNull();
      }
    });

    it('should return null for filename without .pdf extension', () => {
      const filename = 'test__15-01-2024_10-30-45.txt';
      const result = parsePdfFilename(filename);

      expect(result).toBeNull();
    });

    it('should handle roundtrip (generate then parse)', () => {
      const originalKey = 'roundtrip-test-key';
      const originalDate = new Date('2024-06-15T14:30:00.000Z');

      const filename = generatePdfFilename(originalKey, originalDate);
      const parsed = parsePdfFilename(filename);

      expect(parsed).not.toBeNull();
      expect(parsed?.requestedKey).toBe(originalKey);
    });
  });

  describe('generateScreenshotFilename', () => {
    it('should generate PNG filename with date and time format', () => {
      const date = new Date('2024-01-15T10:30:45.000Z');
      const filename = generateScreenshotFilename('screenshot-123', 'png', date);

      expect(filename).toMatch(/^screenshot-123__15-01-2024_\d{2}-30-45\.png$/);
    });

    it('should generate JPEG filename with .jpg extension', () => {
      const date = new Date('2024-01-15T10:30:45.000Z');
      const filename = generateScreenshotFilename('screenshot-123', 'jpeg', date);

      expect(filename).toMatch(/^screenshot-123__15-01-2024_\d{2}-30-45\.jpg$/);
    });

    it('should use current date/time when not provided', () => {
      const filename = generateScreenshotFilename('test-key', 'png');

      expect(filename).toMatch(/^test-key__\d{2}-\d{2}-\d{4}_\d{2}-\d{2}-\d{2}\.png$/);
    });

    it('should handle requestedKey with dashes and underscores', () => {
      const date = new Date('2024-06-20T15:45:30.000Z');
      const filename = generateScreenshotFilename('my-test_key-123', 'png', date);

      expect(filename).toContain('my-test_key-123__');
      expect(filename.endsWith('.png')).toBe(true);
    });
  });

  describe('parseScreenshotFilename', () => {
    it('should parse valid PNG filename correctly', () => {
      const filename = 'screenshot-123__15-01-2024_10-30-45.png';
      const result = parseScreenshotFilename(filename);

      expect(result).not.toBeNull();
      expect(result?.requestedKey).toBe('screenshot-123');
      expect(result?.format).toBe('png');
      expect(result?.timestamp).toBeInstanceOf(Date);
      expect(result?.timestamp.getFullYear()).toBe(2024);
      expect(result?.timestamp.getMonth()).toBe(0);
      expect(result?.timestamp.getDate()).toBe(15);
    });

    it('should parse valid JPEG filename correctly', () => {
      const filename = 'screenshot-123__15-01-2024_10-30-45.jpg';
      const result = parseScreenshotFilename(filename);

      expect(result).not.toBeNull();
      expect(result?.requestedKey).toBe('screenshot-123');
      expect(result?.format).toBe('jpeg');
    });

    it('should parse filename with complex requestedKey', () => {
      const filename = 'my-complex_key-with-123__31-12-2024_23-59-59.png';
      const result = parseScreenshotFilename(filename);

      expect(result).not.toBeNull();
      expect(result?.requestedKey).toBe('my-complex_key-with-123');
    });

    it('should return null for invalid filename format', () => {
      const invalidFilenames = [
        'invalid-filename.png',
        'no-timestamp__.png',
        'missing__extension',
        '',
      ];

      for (const filename of invalidFilenames) {
        const result = parseScreenshotFilename(filename);
        expect(result).toBeNull();
      }
    });

    it('should return null for unsupported extension', () => {
      const filename = 'test__15-01-2024_10-30-45.gif';
      const result = parseScreenshotFilename(filename);

      expect(result).toBeNull();
    });

    it('should handle roundtrip for PNG (generate then parse)', () => {
      const originalKey = 'roundtrip-png-test';
      const originalDate = new Date('2024-06-15T14:30:00.000Z');

      const filename = generateScreenshotFilename(originalKey, 'png', originalDate);
      const parsed = parseScreenshotFilename(filename);

      expect(parsed).not.toBeNull();
      expect(parsed?.requestedKey).toBe(originalKey);
      expect(parsed?.format).toBe('png');
    });

    it('should handle roundtrip for JPEG (generate then parse)', () => {
      const originalKey = 'roundtrip-jpeg-test';
      const originalDate = new Date('2024-06-15T14:30:00.000Z');

      const filename = generateScreenshotFilename(originalKey, 'jpeg', originalDate);
      const parsed = parseScreenshotFilename(filename);

      expect(parsed).not.toBeNull();
      expect(parsed?.requestedKey).toBe(originalKey);
      expect(parsed?.format).toBe('jpeg');
    });
  });
});
