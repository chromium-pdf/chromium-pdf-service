# Docker Setup

## Quick Start with Pre-built Image

The easiest way to get started is using the pre-built image from GitHub Container Registry:

```bash
# Pull the latest image
docker pull ghcr.io/relliv/chromium-pdf-service:latest

# Or pull a specific version
docker pull ghcr.io/relliv/chromium-pdf-service:0.0.2-alpha
```

### Run the Container

```bash
docker run -d \
  --name pdf-service \
  -p 3000:3000 \
  -v $(pwd)/pdf-files:/app/pdf-files \
  ghcr.io/relliv/chromium-pdf-service:latest
```

### Available Tags

| Tag | Description |
|-----|-------------|
| `latest` | Latest stable release |
| `x.y.z` | Specific version (e.g., `0.0.2-alpha`) |
| `x.y` | Latest patch of minor version |
| `x` | Latest minor of major version |

## Using Docker Compose

### With Pre-built Image

```yaml
services:
  pdf-service:
    image: ghcr.io/relliv/chromium-pdf-service:latest
    ports:
      - "3000:3000"
    volumes:
      - ./pdf-files:/app/pdf-files
      - ./data:/app/data
      - ./logs:/app/logs
    environment:
      - NODE_ENV=production
```

### Build Locally

```bash
# Build and start the service
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the service
docker-compose down
```

## Using in Another Docker Compose Project

Add the service to your project's `docker-compose.yml`:

```yaml
services:
  your-app:
    # your app config...
    depends_on:
      - pdf-service

  pdf-service:
    image: ghcr.io/relliv/chromium-pdf-service:latest
    ports:
      - "4500:3000"
    volumes:
      - ./pdf-files:/app/pdf-files
      - ./data:/app/data
      - ./logs:/app/logs
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

Access from your app container:

```
http://pdf-service:3000/api/pdf/from-url
http://pdf-service:3000/api/screenshot/from-url
```

Access from host machine:

```
http://localhost:4500/api/pdf/from-url
http://localhost:4500/api/screenshot/from-url
```

## Environment Variables

Configure the service with environment variables:

```yaml
services:
  pdf-service:
    image: ghcr.io/relliv/chromium-pdf-service:latest
    environment:
      - NODE_ENV=production
      - LOG_LEVEL=info
      - RATE_LIMIT_MAX=100
      - API_KEYS=your-secret-key
      - BLOCK_PRIVATE_IPS=true
```

See [Environment Variables](/config/env-variables) for all options.

## Multi-Platform Support

The pre-built images support both `linux/amd64` and `linux/arm64` architectures, making them compatible with:

- Standard x86_64 servers
- Apple Silicon Macs (M1/M2/M3)
- ARM-based cloud instances (AWS Graviton, etc.)
