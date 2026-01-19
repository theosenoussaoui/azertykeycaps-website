# Server Architecture

## Overview

The Hono server (`apps/server/`) is a thin middleware layer deployed as a Cloudflare Worker. It handles:

- tRPC API routing (proxied from `packages/api/`)
- Better-Auth authentication (`/api/auth/*`)
- Media proxy to hide CMS URLs (`/api/media/*`)
- Cache invalidation webhook (`/api/cache/invalidate`)

## Directory Structure

```
apps/server/src/
├── index.ts              # App entry point (middleware + error handling)
├── routes/
│   ├── index.ts          # Route aggregator
│   ├── health.ts         # GET / (health check)
│   ├── media.ts          # GET /api/media/* (CMS media proxy)
│   └── cache.ts          # POST /api/cache/invalidate
├── middleware/
│   ├── index.ts          # Re-exports
│   ├── cache.ts          # Media caching middleware
│   └── security.ts       # CORS, secure headers
├── services/
│   └── cloudflare.ts     # Cloudflare CDN purge API
└── lib/
    └── cache-keys.ts     # Cache key/URL builders
```

## File Responsibilities

### Entry Point

**`index.ts`** (~50 lines)

- Creates Hono app instance
- Applies global middleware (logger, requestId, security, CORS)
- Mounts all routes
- Handles errors with `onError` (HTTPException support)
- Handles 404s with `notFound`

### Routes

**`routes/index.ts`**

- Aggregates all route modules using `app.route()`
- Mounts tRPC and Better-Auth handlers
- Single export consumed by `index.ts`

**`routes/health.ts`**

- Simple health check endpoint
- Returns "OK" text response

**`routes/media.ts`**

- Proxies media requests to CMS using Hono's `proxy()` helper
- Applies timeout middleware (30s)
- Applies cache middleware
- Sets CORP headers for cross-origin embedding
- Throws `HTTPException` on errors

**`routes/cache.ts`**

- Webhook endpoint for CMS cache invalidation
- Uses `bodyLimit` middleware (50KB max)
- Uses `bearerAuth` middleware for authentication
- Uses `@hono/zod-validator` for request validation
- Orchestrates cache invalidation across layers

### Middleware

**`middleware/cache.ts`**

- `mediaCacheMiddleware`: Hono cache middleware for media
- `invalidateCache()`: Workers Cache API invalidation
- `CACHE_NAMES`: Cache name constants
- Dev mode detection and logging

**`middleware/security.ts`**

- `createCorsMiddleware()`: CORS configuration factory
- `createSecureHeadersMiddleware()`: Secure headers with path exclusions

### Services

**`services/cloudflare.ts`**

- `purgeCloudflareCDN()`: Cloudflare API integration for CDN purge
- Isolated from route logic for testability

### Lib

**`lib/cache-keys.ts`**

- `buildCacheKeys()`: Maps content types to tRPC cache keys
- `buildUrlsToPurge()`: Maps content changes to page URLs

## Request Flow

```
Request
   │
   ▼
┌──────────────────────────────────────┐
│ index.ts                             │
│  └─ logger()                         │
│  └─ requestId()                      │
│  └─ secureHeaders (skip /api/media/) │
│  └─ cors()                           │
└──────────────────────────────────────┘
   │
   ▼
┌──────────────────────────────────────┐
│ routes/index.ts                      │
│  ├─ GET /          → health.ts       │
│  ├─ /api/auth/*    → Better-Auth     │
│  ├─ /trpc/*        → tRPC Server     │
│  ├─ /api/media/*   → media.ts        │
│  └─ /api/cache/*   → cache.ts        │
└──────────────────────────────────────┘
   │
   ▼ (on error)
┌──────────────────────────────────────┐
│ onError handler                      │
│  └─ HTTPException → structured JSON  │
│  └─ Other errors  → 500 JSON         │
└──────────────────────────────────────┘
```

## Built-in Middleware

| Middleware             | Location            | Purpose                              |
| ---------------------- | ------------------- | ------------------------------------ |
| `logger()`             | Global              | Request/response logging             |
| `requestId()`          | Global              | Unique ID for each request (tracing) |
| `secureHeaders()`      | Global (skip media) | Security headers                     |
| `cors()`               | Global              | Cross-origin resource sharing        |
| `timeout()`            | Media route         | 30s request timeout                  |
| `bodyLimit()`          | Cache route         | 50KB max payload                     |
| `bearerAuth()`         | Cache route         | Token authentication                 |
| `mediaCacheMiddleware` | Media route         | Edge caching                         |

## Error Handling

All errors are handled centrally in `index.ts`:

```typescript
import { HTTPException } from "hono/http-exception";

throw new HTTPException(404, { message: "Not found" });
```

The `onError` handler returns structured JSON responses:

```json
{
  "error": "Not found",
  "status": 404,
  "requestId": "abc-123"
}
```

## Adding New Routes

1. Create route file in `routes/`:

```typescript
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

const myRoute = new Hono()
  .get("/", (c) => c.json({ message: "Hello" }))
  .get("/:id", (c) => {
    const id = c.req.param("id");
    if (!id) {
      throw new HTTPException(400, { message: "ID required" });
    }
    return c.json({ id });
  });

export default myRoute;
```

2. Mount in `routes/index.ts`:

```typescript
import myRoute from "./my-route";

const routes = new Hono()
  // ...existing routes
  .route("/api/my-route", myRoute);
```

## Adding New Middleware

1. Create middleware in `middleware/`:

```typescript
import type { MiddlewareHandler } from "hono";

export const myMiddleware: MiddlewareHandler = async (c, next) => {
  // Pre-processing
  await next();
  // Post-processing
};
```

2. Export from `middleware/index.ts`
3. Apply in `index.ts` or specific routes

## Validation

All request validation uses Zod schemas from `@azertykeycaps-app/schemas`:

```typescript
import { mySchema } from "@azertykeycaps-app/schemas";
import { zValidator } from "@hono/zod-validator";

app.post("/endpoint", zValidator("json", mySchema), (c) => {
  const data = c.req.valid("json"); // Fully typed
});
```

## Authentication

Bearer token authentication for webhooks:

```typescript
import { bearerAuth } from "hono/bearer-auth";

app.use("/protected", bearerAuth({ token: env.SECRET }));
```

Session-based auth via Better-Auth (for user routes):

```typescript
app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));
```

## Environment Variables

Required in `packages/env/src/server.ts`:

- `CORS_ORIGIN` - Allowed origin for CORS
- `CMS_API_URL` - Payload CMS base URL
- `CMS_API_KEY` - Payload API key (optional)
- `CACHE_INVALIDATION_SECRET` - Bearer token for cache webhook
- `SERVER_URL` - This server's public URL
- `CF_ZONE_ID` - Cloudflare zone (optional)
- `CF_API_TOKEN` - Cloudflare API token (optional)

## Hono Features Used

| Feature           | Import                | Usage                      |
| ----------------- | --------------------- | -------------------------- |
| `proxy()`         | `hono/proxy`          | Media proxy to CMS         |
| `HTTPException`   | `hono/http-exception` | Structured error throwing  |
| `timeout()`       | `hono/timeout`        | Request timeout protection |
| `bodyLimit()`     | `hono/body-limit`     | Payload size limiting      |
| `requestId()`     | `hono/request-id`     | Request tracing            |
| `bearerAuth()`    | `hono/bearer-auth`    | Token authentication       |
| `cors()`          | `hono/cors`           | CORS headers               |
| `secureHeaders()` | `hono/secure-headers` | Security headers           |
| `logger()`        | `hono/logger`         | Request logging            |
| `cache()`         | `hono/cache`          | Edge caching               |

## Testing

Run type checks:

```bash
bun run check-types
```

Start dev server:

```bash
bun run dev:server
```

## Related Documentation

- [CACHING.md](./CACHING.md) - Cache invalidation details
- [packages/schemas/](../packages/schemas/) - Validation schemas
- [packages/api/](../packages/api/) - tRPC procedures
- [Hono Docs](https://hono.dev/llms-full.txt) - Full Hono documentation
