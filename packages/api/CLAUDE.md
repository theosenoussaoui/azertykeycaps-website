# API Package

tRPC API layer providing type-safe procedures for the frontend. Fetches data from Payload CMS REST API.

## Tech Stack

- **tRPC** - Type-safe API procedures
- **Zod** - Input/output validation (schemas from `@azertykeycaps-app/schemas`)
- **Hono** - Mounted via `@hono/trpc-server` in `apps/server`

## File Structure

```
src/
  index.ts            # tRPC initialization, publicProcedure, protectedProcedure
  context.ts          # Context with session and env (CMS_API_URL)
  routers/
    index.ts          # appRouter combining all routers
    articles.ts       # Articles, profiles procedures
```

## Routers

### Articles Router (`src/routers/articles.ts`)

| Procedure  | Type  | Input                      | Output                      | Description                      |
| ---------- | ----- | -------------------------- | --------------------------- | -------------------------------- |
| `list`     | query | `articleListInputSchema`   | `articleListResponseSchema` | Paginated articles with filters  |
| `bySlug`   | query | `articleBySlugInputSchema` | `articleSchema \| null`     | Single article by slug           |
| `profiles` | query | `profileListInputSchema`   | `profileListResponseSchema` | List keycap profiles for filters |

## Usage

### In Server (Hono)

```typescript
// apps/server/src/index.ts
import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "@azertykeycaps-app/api/routers/index";
import { createContext } from "@azertykeycaps-app/api/context";

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    createContext: (_opts, context) => createContext({ context }),
  }),
);
```

### In Web (TanStack Start Server Functions)

For sensitive data, use direct caller (runs on server only):

```typescript
// apps/web/src/routes/articles.$slug.tsx
import { createServerFn } from "@tanstack/react-start";
import { appRouter } from "@azertykeycaps-app/api/routers/index";

const getArticle = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    const caller = appRouter.createCaller({
      session: null,
      env: process.env as unknown as Env,
    });
    return await caller.articles.bySlug({ slug: data.slug });
  });
```

### In Web (React Query via tRPC Client)

For public data with caching:

```typescript
import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc";

function Component() {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.articles.list.queryOptions({ page: 1, limit: 12 }));
}
```

## Context

```typescript
// src/context.ts
export type Context = {
  session: Session | null;  // From Better-Auth
  env: Env;                 // Contains CMS_API_URL
};
```

## Adding New Procedures

1. Import schemas from `@azertykeycaps-app/schemas`
2. Add procedure to appropriate router with `.input()` and `.output()` validation
3. Fetch from CMS using `ctx.env.CMS_API_URL`
4. Return validated data

Example:

```typescript
import { myInputSchema, myOutputSchema } from "@azertykeycaps-app/schemas";

export const myRouter = router({
  getData: publicProcedure
    .input(myInputSchema)
    .output(myOutputSchema)
    .query(async ({ ctx, input }) => {
      const response = await fetch(`${ctx.env.CMS_API_URL}/api/my-collection`);
      const data = await response.json();
      return data;
    }),
});
```

## CMS API Integration

Procedures fetch from Payload CMS REST API:

```typescript
// Build query params
const params = new URLSearchParams();
params.set("limit", String(input.limit));
params.set("page", String(input.page));
params.set("depth", "1");  // Populate relationships

// Filter with where clause
if (input.status) {
  params.set("where", JSON.stringify({ status: { equals: input.status } }));
}

const response = await fetch(`${ctx.env.CMS_API_URL}/api/articles?${params}`);
```

## Error Handling

- Return empty arrays/null for list operations on error (graceful degradation)
- Throw `TRPCError` for single-item queries when data is required

```typescript
// Graceful (list)
if (!response.ok) {
  return { docs: [], totalDocs: 0, totalPages: 0, page: 1 };
}

// Strict (single item)
if (!response.ok) {
  throw new TRPCError({
    code: "INTERNAL_SERVER_ERROR",
    message: "Failed to fetch article",
  });
}
```
