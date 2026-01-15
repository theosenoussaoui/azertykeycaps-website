# AzertyKeycaps

Monorepo for AzertyKeycaps website built with Better-T-Stack.

## Tech Stack

| Layer    | Tech                             |
| -------- | -------------------------------- |
| Frontend | TanStack Start + Router + Vite 7 |
| Backend  | Hono (Cloudflare Workers)        |
| Database | Cloudflare D1 + Drizzle ORM      |
| Auth     | Better-Auth                      |
| CMS      | Payload CMS (Next.js + D1)       |
| API      | tRPC (end-to-end type safety)    |
| Infra    | Alchemy (IaC for Cloudflare)     |
| UI       | Tailwind v4 + shadcn/ui          |

## Structure

```
apps/
  web/      # TanStack Start frontend (port 3001)
  server/   # Hono API backend (port 3000)
  cms/      # Payload CMS admin (port 3002)

packages/
  api/      # tRPC routers & procedures
  auth/     # Better-Auth config
  db/       # Drizzle schemas & migrations
  env/      # T3 Env validation
  infra/    # Alchemy Cloudflare resources
```

## Quick Start

```bash
bun install
bun run dev          # Start all apps
```

## Scripts

| Command              | Description          |
| -------------------- | -------------------- |
| `bun run dev`        | Start all apps       |
| `bun run dev:web`    | Web only             |
| `bun run dev:server` | Server only          |
| `bun run db:push`    | Push schema to D1    |
| `bun run db:studio`  | Open Drizzle Studio  |
| `bun run deploy`     | Deploy to Cloudflare |

## Database

All commands run from root:

```bash
bun run db:push      # Push schema changes
bun run db:generate  # Generate migrations
bun run db:migrate   # Apply migrations
bun run db:studio    # Open studio UI
```

Schemas: `packages/db/src/schema/`
Migrations: `packages/db/src/migrations/` (auto-applied by Alchemy)

## Deployment

```bash
# Set production env vars first
bun run deploy       # Deploy all workers
bun run destroy      # Tear down resources
```

**Required env vars:**

- `apps/web/.env`: `VITE_SERVER_URL`
- `apps/server/.env`: `CORS_ORIGIN`, `BETTER_AUTH_URL`, `BETTER_AUTH_SECRET`

## Auth Notes

For cross-domain cookies in production, uncomment `session.cookieCache` and `advanced.crossSubDomainCookies` in `apps/server/src/lib/auth.ts`.
