# Security

This page covers the security features available in Chromium PDF Service.

::: tip Suitable Use Cases
This service is designed for internal tools, proof of concepts, development environments, and trusted networks. For public-facing production deployments, enable the security features described below.
:::

## Rate Limiting

Prevent abuse by limiting the number of requests per client.

```bash
# Environment variables
RATE_LIMIT_MAX=100        # Max requests per window (default: 100)
RATE_LIMIT_WINDOW=60000   # Window in milliseconds (default: 60000 = 1 minute)
```

Rate limit headers are included in responses:
- `x-ratelimit-limit` - Maximum requests allowed
- `x-ratelimit-remaining` - Requests remaining in current window
- `x-ratelimit-reset` - Time when the window resets
- `retry-after` - Seconds to wait (when limit exceeded)

## API Key Authentication

Restrict access to authorized clients using API keys.

```bash
# Single key
API_KEYS=my-secret-key

# Multiple keys (comma-separated)
API_KEYS=key1,key2,key3
```

Clients must include the key in the `X-API-Key` header:

```bash
curl -H "X-API-Key: my-secret-key" http://localhost:3000/api/pdf/html
```

### Public Endpoints

These endpoints do not require authentication:
- `GET /` - Service info
- `GET /health` - Health check
- `GET /health/ready` - Readiness probe
- `GET /health/live` - Liveness probe
- `GET /docs/*` - API documentation (development only)

## CORS Configuration

Control which origins can access the API.

```bash
# Allow specific origins (comma-separated)
ALLOWED_ORIGINS=https://app.example.com,https://admin.example.com

# Leave empty to allow all origins (default)
ALLOWED_ORIGINS=
```

## Security Headers

HTTP security headers are automatically added via Helmet:

| Header | Value |
|--------|-------|
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `SAMEORIGIN` |
| `X-XSS-Protection` | `0` |
| `Strict-Transport-Security` | Enabled for HTTPS |

## URL Validation (SSRF Protection)

Prevent Server-Side Request Forgery when generating PDFs from URLs.

### Block Private IPs

By default, private IP addresses are blocked:

```bash
# Enabled by default
BLOCK_PRIVATE_IPS=true

# Blocked ranges:
# - localhost, 127.x.x.x
# - 10.x.x.x
# - 172.16-31.x.x
# - 192.168.x.x
# - 169.254.x.x (link-local)
```

### Domain Allowlist

Restrict URLs to specific domains:

```bash
# Only allow these domains
ALLOWED_URL_DOMAINS=example.com,trusted.org

# Subdomains are automatically allowed
# e.g., api.example.com is allowed when example.com is in the list
```

### Blocked Protocols

These protocols are always blocked:
- `file://`
- `javascript:`
- `data:`
- `vbscript:`

Only `http://` and `https://` are allowed.

## HTML Sanitization

Prevent XSS attacks in HTML content.

```bash
# Enable sanitization (disabled by default for compatibility)
SANITIZE_HTML=true
```

When enabled, the following are removed:

### Blocked Tags
- `<script>`
- `<iframe>`
- `<object>`
- `<embed>`
- `<form>`

### Blocked Attributes
- `onerror`
- `onload`
- `onclick`
- `onmouseover`
- `onfocus`
- `onblur`

::: warning
Enabling HTML sanitization may affect complex HTML layouts. Test thoroughly before enabling in production.
:::

## Production Checklist

For production deployments, consider enabling:

| Feature | Environment Variable | Recommended |
|---------|---------------------|-------------|
| Rate Limiting | `RATE_LIMIT_MAX` | `100` |
| API Authentication | `API_KEYS` | Set secure keys |
| CORS Restriction | `ALLOWED_ORIGINS` | Your app domains |
| Block Private IPs | `BLOCK_PRIVATE_IPS` | `true` (default) |
| Domain Allowlist | `ALLOWED_URL_DOMAINS` | Trusted domains |
| HTML Sanitization | `SANITIZE_HTML` | `true` if accepting user HTML |

## Example Production Configuration

```bash
# .env for production
NODE_ENV=production

# Rate limiting
RATE_LIMIT_MAX=50
RATE_LIMIT_WINDOW=60000

# Authentication
API_KEYS=prod-key-abc123,prod-key-xyz789

# CORS
ALLOWED_ORIGINS=https://myapp.com,https://admin.myapp.com

# URL Security
BLOCK_PRIVATE_IPS=true
ALLOWED_URL_DOMAINS=myapp.com,cdn.myapp.com

# HTML Sanitization
SANITIZE_HTML=true
```
