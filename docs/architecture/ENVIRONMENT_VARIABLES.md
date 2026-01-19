# Environment Variables

> How to configure and use environment variables in the Azertykeycaps monorepo.

## Quick Reference

| Variable          | Context      | Description                                  |
| ----------------- | ------------ | -------------------------------------------- |
| `VITE_SERVER_URL` | Client + SSR | API server URL for tRPC calls                |
| `VITE_SITE_URL`   | Client + SSR | Public site URL for SEO (canonical, OG tags) |
| `SERVER_URL`      | Server only  | API server URL for SSR server functions      |

## Architecture Overview

This project has **three distinct environments** for environment variables:

```
┌─────────────────────────────────────────────────────────────────┐
│                        packages/env/                            │
├─────────────────────────────────────────────────────────────────┤
│  src/web.ts     → Client-side (VITE_* via import.meta.env)     │
│  src/server.ts  → Cloudflare Workers (via cloudflare:workers)  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    apps/web/src/lib/                            │
├─────────────────────────────────────────────────────────────────┤
│  server-env.ts  → TanStack Start server functions (process.env)│
└─────────────────────────────────────────────────────────────────┘
```

## Context Rules

### 1. Client-Side (React Components)

**Use:** `import.meta.env.VITE_*`

```tsx
// ✅ Works in components
function MyComponent() {
  const apiUrl = import.meta.env.VITE_SERVER_URL;
  return <div>API: {apiUrl}</div>;
}
```

**Validated via:** `packages/env/src/web.ts`

```typescript
import { env } from "@azertykeycaps-app/env/web";

// Type-safe access
const serverUrl = env.VITE_SERVER_URL;
```

### 2. Server Functions (TanStack Start)

**Use:** `process.env` via `serverEnv`

```typescript
// apps/web/src/lib/server-env.ts
import { serverEnv } from "@/lib/server-env";

const getServerData = createServerFn({ method: "GET" }).handler(async () => {
  const serverUrl = serverEnv.SERVER_URL; // ✅ Server-only
  return fetch(`${serverUrl}/api/data`);
});
```

**Location:** `apps/web/src/lib/server-env.ts`

### 3. Cloudflare Workers (API Server)

**Use:** `env` from `cloudflare:workers`

```typescript
// packages/env/src/server.ts exports this
import { env } from "@azertykeycaps-app/env/server";

// In Hono routes
app.get("/api/data", (c) => {
  const db = c.env.DB; // D1 binding
  // ...
});
```

**Types defined in:** `packages/env/env.d.ts`

## File Locations

### `.env` Files

```
apps/web/.env              # Web app development
apps/web/.env.example      # Web app template (committed)
apps/server/.env           # API server development
apps/server/.env.example   # API server template (committed)
apps/cms/.env              # CMS development
packages/infra/.env        # Alchemy deployment secrets
```

### Environment Validation

```
packages/env/
├── src/
│   ├── web.ts             # VITE_* client variables
│   └── server.ts          # Cloudflare Workers bindings
├── env.d.ts               # Type definitions
└── package.json

apps/web/src/lib/
└── server-env.ts          # TanStack Start server functions
```

## Variable Definitions

### Web App (`apps/web/.env`)

```bash
# Client-side (bundled into JS, safe to expose)
VITE_SERVER_URL=http://localhost:1337    # API server for tRPC
VITE_SITE_URL=http://localhost:3001      # Site URL for SEO

# Server-side only (never bundled)
SERVER_URL=http://localhost:1337         # For SSR server functions
```

### API Server (`apps/server/.env`)

Managed by Alchemy. See `packages/infra/alchemy.run.ts` for bindings.

## Common Patterns

### Pattern 1: SEO Meta Tags (SSR-Safe)

The `head()` function in routes runs during SSR. Use `import.meta.env` which Vite replaces at build time:

```typescript
// apps/web/src/lib/seo.ts
function getSiteUrl(): string {
  // Replaced at build time - works in SSR and client
  return import.meta.env.VITE_SITE_URL || "https://azertykeycaps.fr";
}

// In route
export const Route = createFileRoute("/")({
  head: () => ({
    meta: [{ property: "og:url", content: `${getSiteUrl()}/` }],
  }),
});
```

### Pattern 2: Server Function Data Fetching

```typescript
// apps/web/src/features/articles/api/get-articles.ts
import { createServerFn } from "@tanstack/react-start";
import { serverEnv } from "@/lib/server-env";

export const getArticles = createServerFn({ method: "GET" }).handler(
  async () => {
    // serverEnv.SERVER_URL is only accessed on the server
    const response = await fetch(`${serverEnv.SERVER_URL}/api/articles`);
    return response.json();
  },
);
```

### Pattern 3: tRPC Client Configuration

```typescript
// apps/web/src/router.tsx
import { env } from "@azertykeycaps-app/env/web";

const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${env.VITE_SERVER_URL}/trpc`,
    }),
  ],
});
```

## Adding New Variables

### Step 1: Add to `.env` Files

```bash
# apps/web/.env
VITE_NEW_VARIABLE=value      # Client-safe (VITE_ prefix)
NEW_SERVER_VARIABLE=secret   # Server-only (no prefix)
```

### Step 2: Add Validation Schema

**For client variables:**

```typescript
// packages/env/src/web.ts
export const env = createEnv({
  clientPrefix: "VITE_",
  client: {
    VITE_SERVER_URL: z.url(),
    VITE_SITE_URL: z.url(),
    VITE_NEW_VARIABLE: z.string(), // Add here
  },
  runtimeEnv: (import.meta as any).env,
});
```

**For server variables (TanStack Start):**

```typescript
// apps/web/src/lib/server-env.ts
export const serverEnv = createEnv({
  server: {
    SERVER_URL: z.string().url(),
    NEW_SERVER_VARIABLE: z.string(), // Add here
  },
  runtimeEnv: process.env,
});
```

### Step 3: Add to Alchemy Bindings (if needed for deployment)

```typescript
// packages/infra/alchemy.run.ts
export const web = await TanStackStart("web", {
  bindings: {
    VITE_SERVER_URL: serverUrl,
    VITE_SITE_URL: webUrl,
    VITE_NEW_VARIABLE: "production-value", // Add here
  },
});
```

## Common Mistakes

### 1. Using `process.env` in Client Code

```typescript
// ❌ WRONG - process.env doesn't exist in browser
function MyComponent() {
  const url = process.env.SERVER_URL;
}

// ✅ CORRECT - use import.meta.env with VITE_ prefix
function MyComponent() {
  const url = import.meta.env.VITE_SERVER_URL;
}
```

### 2. Using `serverEnv` in Shared Modules

```typescript
// ❌ WRONG - serverEnv imports process.env, breaks client bundle
// apps/web/src/lib/shared-utils.ts
import { serverEnv } from "./server-env";

// ✅ CORRECT - use import.meta.env for shared modules
const siteUrl = import.meta.env.VITE_SITE_URL;
```

### 3. Forgetting VITE\_ Prefix

```bash
# ❌ WRONG - won't be available in client
SITE_URL=https://example.com

# ✅ CORRECT - VITE_ prefix exposes to client
VITE_SITE_URL=https://example.com
```

### 4. Accessing Server Env in Route Module Scope

```typescript
// ❌ WRONG - module scope runs on both client and server
import { serverEnv } from "@/lib/server-env";
const url = serverEnv.SERVER_URL; // Crashes on client!

export const Route = createFileRoute("/")({
  // ...
});

// ✅ CORRECT - access inside server function only
export const getData = createServerFn({ method: "GET" }).handler(async () => {
  const { serverEnv } = await import("@/lib/server-env");
  return serverEnv.SERVER_URL;
});
```

## Debugging

### Check Available Variables

```typescript
// In browser console
console.log(import.meta.env);

// In server function
console.log(process.env.SERVER_URL);
```

### Validate at Startup

The `createEnv` from `@t3-oss/env-core` validates variables at import time. If a required variable is missing, you'll get an error immediately.

### Build-Time vs Runtime

| Context                   | When Resolved | Access Pattern      |
| ------------------------- | ------------- | ------------------- |
| `import.meta.env.VITE_*`  | Build time    | Static replacement  |
| `process.env` (server fn) | Runtime       | Dynamic lookup      |
| Cloudflare bindings       | Runtime       | Via `c.env` in Hono |

## Security Checklist

- [ ] Secrets never have `VITE_` prefix
- [ ] Database URLs are server-only
- [ ] API keys are server-only
- [ ] `.env` files with secrets are in `.gitignore`
- [ ] `.env.example` files have placeholder values only
- [ ] Production secrets are in Cloudflare dashboard / Alchemy secrets

## Related Documentation

- [TanStack Start Environment Variables](https://tanstack.com/start/latest/docs/framework/react/environment-variables)
- [Vite Env Variables](https://vitejs.dev/guide/env-and-mode.html)
- [T3 Env](https://env.t3.gg/)
- [Alchemy Bindings](https://alchemy.run/concepts/bindings/)
