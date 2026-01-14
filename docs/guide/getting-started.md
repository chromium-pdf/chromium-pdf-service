# Getting Started

Chromium PDF Service is a simple PDF generation service built with Fastify, TypeScript, Playwright, and Docker.

::: tip Suitable Use Cases
This service is designed for internal tools, proof of concepts, development environments, and trusted networks. For public-facing production deployments, additional security hardening (authentication, rate limiting, etc.) is recommended.
:::

## Features

- **PDF Generation**: Generate PDFs from HTML content, URLs, or uploaded HTML files
- **Screenshot Capture**: PNG/JPEG screenshots with full-page, viewport, or region clipping
- **Queue System**: Built-in job queue with priority support, status tracking, and cancellation
- **Queue Persistence**: Jobs survive service restarts (saved to `data/queue.json`)
- **Idempotent Requests**: Same `requestedKey` returns existing file if already completed
- **Custom Dimensions**: Use predefined formats (A4, Letter) or custom width/height
- **Disable Animations**: Option to disable CSS animations for reliable rendering
- **Error Screenshots**: Captures page screenshot on failure for debugging
- **Docker Ready**: Pre-built multi-arch images on GitHub Container Registry
- **Health Checks**: Kubernetes-compatible health, readiness, and liveness endpoints
- **Security**: Rate limiting, API authentication, CORS, URL validation, HTML sanitization
- **Logging**: Structured JSON logging with Pino (stdout + daily log files)

## Quick Start

### Using Pre-built Docker Image (Recommended)

The fastest way to get started:

```bash
# Pull and run the latest image
docker run -d \
  --name pdf-service \
  -p 3000:3000 \
  -v $(pwd)/pdf-files:/app/pdf-files \
  ghcr.io/relliv/chromium-pdf-service:latest

# Test the service
curl http://localhost:3000/health
```

Or with Docker Compose:

```yaml
# docker-compose.yml
services:
  pdf-service:
    image: ghcr.io/relliv/chromium-pdf-service:latest
    ports:
      - "3000:3000"
    volumes:
      - ./pdf-files:/app/pdf-files
```

```bash
docker-compose up -d
```

### Build Locally with Docker Compose

```bash
# Build and start the service
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop the service
docker-compose down
```

### Local Development

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium

# Run in development mode
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Job Status Values

| Status | Description |
|--------|-------------|
| `queued` | Job is waiting in queue |
| `processing` | Job is being processed |
| `completed` | PDF generated successfully |
| `failed` | PDF generation failed (screenshot captured) |
| `cancelled` | Job was cancelled |
