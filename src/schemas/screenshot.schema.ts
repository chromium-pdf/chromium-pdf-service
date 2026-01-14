import { z } from 'zod';
import { browserOptionsSchema, queueOptionsSchema } from './pdf.schema.js';

// Screenshot options schema
export const screenshotOptionsSchema = z
  .object({
    type: z.enum(['png', 'jpeg']).optional().default('png'),
    quality: z.number().int().min(0).max(100).optional(),
    fullPage: z.boolean().optional().default(true),
    clip: z
      .object({
        x: z.number().int().min(0),
        y: z.number().int().min(0),
        width: z.number().int().positive().max(10000),
        height: z.number().int().positive().max(10000),
      })
      .optional(),
    omitBackground: z.boolean().optional(),
    scale: z.enum(['css', 'device']).optional(),
  })
  .refine(
    (data) => {
      // Quality is only valid for jpeg
      if (data.quality !== undefined && data.type !== 'jpeg') {
        return false;
      }
      return true;
    },
    { message: 'Quality option is only valid for JPEG format' }
  )
  .refine(
    (data) => {
      // Can't use both fullPage and clip
      if (data.fullPage && data.clip) {
        return false;
      }
      return true;
    },
    { message: 'Cannot use both fullPage and clip. Use either fullPage OR clip.' }
  );

// Combined options schema for screenshot requests
export const screenshotRequestOptionsSchema = z.object({
  browser: browserOptionsSchema.optional(),
  screenshot: screenshotOptionsSchema.optional(),
  queue: queueOptionsSchema.optional(),
});

// Base screenshot request schema
const baseScreenshotRequestSchema = z.object({
  requestedKey: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-zA-Z0-9_-]+$/, 'requestedKey must be alphanumeric with dashes and underscores'),
  options: screenshotRequestOptionsSchema.optional(),
  reCreate: z.boolean().optional(),
});

// HTML screenshot request schema
export const htmlScreenshotRequestSchema = baseScreenshotRequestSchema.extend({
  html: z.string().min(1).max(10_000_000), // Max 10MB HTML
});

// URL screenshot request schema
export const urlScreenshotRequestSchema = baseScreenshotRequestSchema.extend({
  url: z.string().url().max(2048),
});

// File screenshot request schema (requestedKey only, file comes as multipart)
export const fileScreenshotRequestSchema = baseScreenshotRequestSchema;

// Type exports
export type ScreenshotOptions = z.infer<typeof screenshotOptionsSchema>;
export type ScreenshotRequestOptions = z.infer<typeof screenshotRequestOptionsSchema>;
export type HtmlScreenshotRequest = z.infer<typeof htmlScreenshotRequestSchema>;
export type UrlScreenshotRequest = z.infer<typeof urlScreenshotRequestSchema>;
export type FileScreenshotRequest = z.infer<typeof fileScreenshotRequestSchema>;
