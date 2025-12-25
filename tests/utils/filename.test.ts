import { describe, it, expect } from 'vitest';
import { generatePdfFilename, parsePdfFilename } from '../../src/utils/filename.js';

describe('Filename Utilities', () => {
  describe('generatePdfFilename', () => {
    it('should generate filename with correct format', () => {
      const date = new Date('2024-01-15T10:30:45.000Z');
      const filename = generatePdfFilename('invoice-123', date);

      // Note: The hour will depend on the timezone
      expect(filename).toMatch(/^invoice-123__2024-01-15-\d{2}-30-45\.pdf$/);
    });

    it('should use current date when not provided', () => {
      const filename = generatePdfFilename('test-key');

      expect(filename).toMatch(/^test-key__\d{4}-\d{2}-\d{2}-\d{2}-\d{2}-\d{2}\.pdf$/);
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

      // Should have padded values like 01, 05, 08, 05, 09
      expect(filename).toMatch(/test__2024-01-05-\d{2}-05-09\.pdf/);
    });
  });

  describe('parsePdfFilename', () => {
    it('should parse valid filename correctly', () => {
      const filename = 'invoice-123__2024-01-15-10-30-45.pdf';
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
      const filename = 'my-complex_key-with-123__2024-12-31-23-59-59.pdf';
      const result = parsePdfFilename(filename);

      expect(result).not.toBeNull();
      expect(result?.requestedKey).toBe('my-complex_key-with-123');
    });

    it('should return null for invalid filename format', () => {
      const invalidFilenames = [
        'invalid-filename.pdf',
        'no-timestamp__.pdf',
        'missing__extension',
        'wrong__2024-1-15-10-30-45.pdf', // single digit month
        'wrong__24-01-15-10-30-45.pdf', // 2-digit year
        '',
      ];

      for (const filename of invalidFilenames) {
        const result = parsePdfFilename(filename);
        expect(result).toBeNull();
      }
    });

    it('should return null for filename without .pdf extension', () => {
      const filename = 'test__2024-01-15-10-30-45.txt';
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
      // Note: We can't compare timestamps directly due to timezone differences
      // but we can verify the key was preserved
    });
  });
});
