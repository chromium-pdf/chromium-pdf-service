import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import { env } from '../config/env.js';

const window = new JSDOM('').window;
const purify = DOMPurify(window);

// Configure DOMPurify
purify.setConfig({
  FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
  ALLOW_DATA_ATTR: false,
});

export function sanitizeHtml(html: string): string {
  // Skip sanitization if disabled
  if (!env.sanitizeHtml) {
    return html;
  }

  return purify.sanitize(html, {
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
  }) as string;
}
