# Browser Options

Browser options control how the page is loaded and rendered.

## Options Reference

| Option | Type | Description |
|--------|------|-------------|
| `timeout` | number | Navigation timeout in ms (max 120000) |
| `viewport` | object | `{ width, height }` |
| `userAgent` | string | Custom user agent |
| `extraHTTPHeaders` | object | Additional HTTP headers |
| `waitForSelector` | string | CSS selector to wait for before generating PDF |
| `waitAfter` | number | Additional wait time (ms) after page load or selector appears (max 60000) |
| `disableAnimations` | boolean | Disable all CSS animations and transitions |
| `colorScheme` | string | Emulate preferred color scheme: `"light"`, `"dark"`, or `"no-preference"` |
| `launchOptions` | object | Custom browser launch options `{ headless, args }` |

## Examples

### Custom Viewport

```json
{
  "options": {
    "browser": {
      "viewport": {
        "width": 1920,
        "height": 1080
      }
    }
  }
}
```

### Custom User Agent

```json
{
  "options": {
    "browser": {
      "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    }
  }
}
```

### Custom Headers

```json
{
  "options": {
    "browser": {
      "extraHTTPHeaders": {
        "Authorization": "Bearer your-token",
        "Accept-Language": "en-US"
      }
    }
  }
}
```

### Wait for Element

```json
{
  "options": {
    "browser": {
      "waitForSelector": "#content-loaded",
      "waitAfter": 1000
    }
  }
}
```

### Disable Animations

```json
{
  "options": {
    "browser": {
      "disableAnimations": true
    }
  }
}
```

::: tip
Use `disableAnimations: true` when your page has CSS animations that might cause elements to be invisible or transformed when the PDF is captured.
:::

### Dark Mode

```json
{
  "options": {
    "browser": {
      "colorScheme": "dark"
    }
  }
}
```

### Light Mode

```json
{
  "options": {
    "browser": {
      "colorScheme": "light"
    }
  }
}
```

::: tip
The `colorScheme` option emulates the `prefers-color-scheme` CSS media feature. Use `"dark"` to render pages in dark mode, `"light"` for light mode, or `"no-preference"` to use the system default. This is useful for websites that support both light and dark themes.
:::

## Launch Options

The `launchOptions` parameter allows you to customize how the Chromium browser is launched. When provided, a dedicated browser instance is created for that specific job.

### Available Launch Options

| Option | Type | Description |
|--------|------|-------------|
| `headless` | boolean | Run browser in headless mode (default: `true`) |
| `args` | string[] | Array of Chromium command-line arguments (max 50 args, each max 500 chars) |

### Non-Headless Mode (Debugging)

Run the browser with a visible UI for debugging:

```json
{
  "options": {
    "browser": {
      "launchOptions": {
        "headless": false
      }
    }
  }
}
```

::: warning
Non-headless mode is useful for debugging but not recommended for production use. The browser window will be visible on the server, which may cause issues in containerized or headless environments.
:::

### Common Chromium Arguments

```json
{
  "options": {
    "browser": {
      "launchOptions": {
        "args": [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-gpu",
          "--window-size=1920,1080"
        ]
      }
    }
  }
}
```

**Useful Arguments:**

- `--no-sandbox` - Disable sandbox (required in some Docker environments)
- `--disable-setuid-sandbox` - Disable setuid sandbox
- `--disable-gpu` - Disable GPU hardware acceleration
- `--window-size=WIDTH,HEIGHT` - Set initial window size
- `--disable-dev-shm-usage` - Avoid /dev/shm usage issues in containers
- `--disable-web-security` - Disable CORS (development only!)
- `--disable-font-subpixel-positioning` - Improve font rendering consistency
- `--single-process` - Run browser in single process mode (debugging only)

::: danger Security Warning
Some arguments like `--no-sandbox` and `--disable-web-security` reduce browser security. Only use these in development or when absolutely necessary in trusted environments.
:::

### Performance Considerations

When you provide custom `launchOptions`:

- A **dedicated browser instance** is created for that specific job
- The browser is **automatically closed** after the job completes
- This adds overhead compared to using the shared browser instance
- Use only when necessary (debugging, special requirements)

Without custom `launchOptions`, jobs use the shared browser instance configured in global settings, which is more efficient for most use cases.

### Example: Docker-Optimized Launch

```json
{
  "requestedKey": "docker-pdf",
  "url": "https://example.com",
  "options": {
    "browser": {
      "launchOptions": {
        "args": [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-gpu"
        ]
      }
    }
  }
}
```

### Example: Debug with Visible Browser

```json
{
  "requestedKey": "debug-pdf",
  "html": "<h1>Test Page</h1>",
  "options": {
    "browser": {
      "launchOptions": {
        "headless": false,
        "args": [
          "--window-size=1920,1080",
          "--start-maximized"
        ]
      },
      "waitAfter": 3000
    }
  }
}
```

::: tip Debugging Workflow
1. Start with `headless: false` to visually inspect the page
2. Add `waitAfter` to give yourself time to see the rendered page
3. Once satisfied, remove `launchOptions` or set `headless: true` for production
:::
