# Adding CMS Collections

This guide covers how to add new Payload CMS collections (both global and regular) to the AzertyKeycaps application, including all dependencies and data flow integration.

## Table of Contents

- [Overview](#overview)
- [Global Collections vs Regular Collections](#global-collections-vs-regular-collections)
- [Adding a Global Collection](#adding-a-global-collection)
- [Adding a Regular Collection](#adding-a-regular-collection)
- [Complete Integration Checklist](#complete-integration-checklist)
- [Recurring Patterns](#recurring-patterns)

---

## Overview

The application uses a multi-layer architecture for CMS content:

```
┌─────────────────────────────────────────────────────────────┐
│  apps/cms/                                                   │
│  └─ Payload CMS Configuration                               │
│     ├─ collections/ (regular collections)                   │
│     ├─ globals/ (global collections)                        │
│     └─ payload.config.ts (registration)                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  packages/schemas/                                           │
│  └─ Zod Validation Schemas & TypeScript Types               │
│     ├─ globals.ts (global schemas)                          │
│     ├─ articles.ts / profiles.ts (collection schemas)       │
│     ├─ filters.ts (input validation)                        │
│     ├─ responses.ts (response formats)                      │
│     └─ index.ts (barrel exports)                            │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  packages/api/                                               │
│  └─ tRPC Server Procedures                                  │
│     └─ routers/                                             │
│        ├─ globals.ts (global endpoints)                     │
│        └─ articles.ts (collection endpoints)                │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  apps/web/                                                   │
│  └─ TanStack Start Web App                                  │
│     └─ features/*/api/                                      │
│        └─ get-*.ts (server functions wrapping tRPC)         │
└─────────────────────────────────────────────────────────────┘
```

---

## Global Collections vs Regular Collections

### Global Collections

**Characteristics:**

- Single instance per global (no list/pagination)
- Accessed at `apps/cms/src/globals/`
- Used for site-wide content (homepage, footer, settings)
- Always available, no CRUD operations from frontend

**Examples:** Homepage, SocialNetworks, InformationsPage, SuggestionPage, NotFoundPage

### Regular Collections

**Characteristics:**

- Multiple instances (list, create, update, delete)
- Accessed at `apps/cms/src/collections/`
- Support pagination, filtering, search
- Require list + detail endpoints

**Examples:** Articles, KeycapProfiles, Media, Users

---

## Adding a Global Collection

### Step 1: Create CMS Global Configuration

**File:** `apps/cms/src/globals/MyGlobal.ts`

```typescript
import type { GlobalConfig } from "payload";

import { isAuthenticated } from "@/access/authenticated";
import { globalAfterChangeHook } from "@/hooks/cache-invalidation";

export const MyGlobal: GlobalConfig = {
  slug: "my-global",
  label: { fr: "Mon Global", en: "My Global" },
  admin: {
    group: { fr: "Pages", en: "Pages" },
  },
  access: {
    read: isAuthenticated,
  },
  hooks: {
    afterChange: [globalAfterChangeHook],
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: { fr: "Contenu", en: "Content" },
          fields: [
            {
              name: "title",
              type: "text",
              required: true,
              label: { fr: "Titre", en: "Title" },
            },
            {
              name: "description",
              type: "textarea",
              required: true,
              label: { fr: "Description", en: "Description" },
            },
          ],
        },
      ],
    },
  ],
};
```

**Key patterns:**

- Use bilingual labels (`{ fr: "", en: "" }`)
- Group globals by category in admin panel
- Apply cache invalidation hooks
- Use tabs for organization
- Apply `isAuthenticated` access control

### Step 2: Register in Payload Config

**File:** `apps/cms/src/payload.config.ts`

```typescript
import { MyGlobal } from "./globals/MyGlobal";

export default buildConfig({
  // ...
  globals: [Homepage, SocialNetworks, MyGlobal], // Add here
  // ...
  plugins: [
    seoPlugin({
      globals: ["homepage", "my-global"], // Add slug here
    }),
  ],
});
```

### Step 3: Add Schema Definition

**File:** `packages/schemas/src/globals.ts`

```typescript
// ============================================
// MY GLOBAL
// ============================================

export const myGlobalSchema = z
  .object({
    title: z.string(),
    description: z.string(),
  })
  .merge(seoFieldsSchema);

// ============================================
// TYPES
// ============================================

export type MyGlobal = z.infer<typeof myGlobalSchema>;
```

**Note:** No need to update `index.ts` - barrel export automatically includes it.

### Step 4: Add tRPC Procedure

**File:** `packages/api/src/routers/globals.ts`

```typescript
import { myGlobalSchema, type MyGlobal } from "@azertykeycaps-app/schemas";

export const globalsRouter = router({
  // ... existing procedures

  myGlobal: publicProcedure
    .output(myGlobalSchema.nullable())
    .query(async ({ ctx }) => {
      try {
        const response = await fetchCMS(
          `${ctx.env.CMS_API_URL}/api/globals/my-global`,
          ctx.env.CMS_API_KEY,
          ctx.isDev ? undefined : CMS_CACHE_TTL,
        );

        if (!response.ok) {
          console.error(`CMS API error: ${response.status}`);
          return null;
        }

        const data = (await response.json()) as MyGlobal;

        const validation = myGlobalSchema.safeParse(data);
        if (!validation.success) {
          console.error(
            "[globals.myGlobal] Output validation failed:",
            JSON.stringify(validation.error.issues, null, 2),
          );
        }

        return data;
      } catch (error) {
        console.error("Failed to fetch my global:", error);
        return null;
      }
    }),
});
```

### Step 5: Create Server Function

**File:** `apps/web/src/features/globals/api/get-my-global-content.ts`

```typescript
import { createServerFn } from "@tanstack/react-start";

import { serverTRPCClient } from "@/lib/server-trpc";

export const getMyGlobalContent = createServerFn({ method: "GET" }).handler(
  async () => {
    return await serverTRPCClient.globals.myGlobal.query();
  },
);
```

### Step 6: Use in Route Loader

**File:** `apps/web/src/routes/_app/my-page.tsx`

```typescript
import { createFileRoute } from "@tanstack/react-router";

import { getMyGlobalContent } from "@/features/globals/api/get-my-global-content";
import { buildCacheHeaders } from "@/lib/cache-tags";

export const Route = createFileRoute("/_app/my-page")({
  loader: async () => {
    const content = await getMyGlobalContent();
    return { content };
  },
  headers: () => buildCacheHeaders({ global: ["my-global"] }),
  staleTime: 60 * 60_000, // 1 hour
  gcTime: 24 * 60 * 60_000, // 24 hours
  component: MyPage,
});

function MyPage() {
  const { content } = Route.useLoaderData();

  const title = content?.title ?? "Fallback Title";
  const description = content?.description ?? "Fallback description";

  return (
    <div>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  );
}
```

---

## Adding a Regular Collection

### Step 1: Create CMS Collection Configuration

**File:** `apps/cms/src/collections/MyCollection.ts`

```typescript
import type { CollectionConfig, FieldHook } from "payload";
import slugify from "slugify";

import { isAuthenticated } from "@/access/authenticated";
import {
  collectionAfterChangeHook,
  collectionAfterDeleteHook,
} from "@/hooks/cache-invalidation";

const generateSlugFromTitle: FieldHook = ({ data, operation, value }) => {
  if (operation === "create" && !value && data?.title) {
    return slugify(data.title, {
      lower: true,
      strict: true,
      locale: "fr",
    });
  }
  return value;
};

export const MyCollection: CollectionConfig = {
  slug: "my-collection",
  labels: {
    singular: { fr: "Mon Item", en: "My Item" },
    plural: { fr: "Mes Items", en: "My Items" },
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "status", "updatedAt"],
    listSearchableFields: ["title", "slug"],
    group: { fr: "Contenu", en: "Content" },
  },
  access: {
    read: isAuthenticated,
  },
  hooks: {
    afterChange: [collectionAfterChangeHook],
    afterDelete: [collectionAfterDeleteHook],
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: { fr: "Contenu", en: "Content" },
          fields: [
            {
              name: "title",
              type: "text",
              required: true,
              label: { fr: "Titre", en: "Title" },
            },
            {
              name: "slug",
              type: "text",
              required: true,
              unique: true,
              index: true,
              label: { fr: "Slug", en: "Slug" },
              hooks: {
                beforeValidate: [generateSlugFromTitle],
              },
              admin: {
                readOnly: true,
                description: {
                  fr: "Identifiant URL unique (généré automatiquement depuis le titre)",
                  en: "Unique URL identifier (auto-generated from title)",
                },
              },
            },
            {
              name: "description",
              type: "textarea",
              label: { fr: "Description", en: "Description" },
            },
          ],
        },
      ],
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: "draft",
      index: true,
      label: { fr: "Statut", en: "Status" },
      admin: {
        position: "sidebar",
      },
      options: [
        { label: { fr: "Brouillon", en: "Draft" }, value: "draft" },
        { label: { fr: "Publié", en: "Published" }, value: "published" },
      ],
    },
  ],
};
```

**Key patterns:**

- Auto-generate slug from title on create
- Use tabs for field organization
- Index fields used in queries/filters (slug, status, relationships)
- Apply cache invalidation hooks
- Sidebar fields for status/metadata

### Step 2: Register in Payload Config

**File:** `apps/cms/src/payload.config.ts`

```typescript
import { MyCollection } from "./collections/MyCollection";

export default buildConfig({
  // ...
  collections: [Users, Media, MyCollection], // Add here
  // ...
  plugins: [
    seoPlugin({
      collections: ["articles", "my-collection"], // Add slug here
    }),
    searchPlugin({
      collections: ["articles", "my-collection"], // Add slug here
    }),
  ],
});
```

### Step 3: Add Schema Definitions

**File:** `packages/schemas/src/my-collection.ts`

```typescript
import { z } from "zod";

import { payloadIdSchema, seoFieldsSchema } from "./common";
import { mediaSchema } from "./media";

// ============================================
// CONSTANTS
// ============================================

export const MY_COLLECTION_STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
} as const;

// ============================================
// BASE SCHEMAS
// ============================================

export const myCollectionStatusSchema = z.enum(["draft", "published"]);

// Full schema (for detail views)
export const myCollectionSchema = z
  .object({
    id: payloadIdSchema,
    title: z.string(),
    slug: z.string(),
    description: z.string().nullish(),
    status: myCollectionStatusSchema,
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .merge(seoFieldsSchema);

// Card schema (for list views - only selected fields)
export const myCollectionCardSchema = z.object({
  id: payloadIdSchema,
  title: z.string(),
  slug: z.string(),
  description: z.string().nullish(),
  status: myCollectionStatusSchema,
});

// ============================================
// TYPES
// ============================================

export type MyCollectionStatus = z.infer<typeof myCollectionStatusSchema>;
export type MyCollection = z.infer<typeof myCollectionSchema>;
export type MyCollectionCard = z.infer<typeof myCollectionCardSchema>;
```

**File:** `packages/schemas/src/index.ts` (auto-exported via barrel pattern)

```typescript
export * from "./my-collection";
```

### Step 4: Add Filter/Input Schemas

**File:** `packages/schemas/src/filters.ts`

```typescript
import { myCollectionStatusSchema } from "./my-collection";

// Route search params (TanStack Router)
export const myCollectionFiltersSchema = z.object({
  page: z.number().min(1).catch(1),
  status: myCollectionStatusSchema.optional(),
  search: z.string().optional(),
});

// tRPC input schemas
export const myCollectionListInputSchema = z.object({
  limit: z.number().min(1).max(100).default(12),
  page: z.number().min(1).default(1),
  status: myCollectionStatusSchema.optional(),
  search: z.string().optional(),
});

export const myCollectionBySlugInputSchema = z.object({
  slug: z.string().min(1),
});

export type MyCollectionFilters = z.infer<typeof myCollectionFiltersSchema>;
export type MyCollectionListInput = z.infer<typeof myCollectionListInputSchema>;
export type MyCollectionBySlugInput = z.infer<
  typeof myCollectionBySlugInputSchema
>;
```

### Step 5: Add Response Schemas

**File:** `packages/schemas/src/responses.ts`

```typescript
import { myCollectionCardSchema } from "./my-collection";

export const myCollectionListResponseSchema = createPaginatedResponseSchema(
  myCollectionCardSchema,
);

export type MyCollectionListResponse = z.infer<
  typeof myCollectionListResponseSchema
>;
```

### Step 6: Add tRPC Router

**File:** `packages/api/src/routers/my-collection.ts`

```typescript
import type { TRPCError } from "@trpc/server";
import qs from "qs-esm";

import {
  myCollectionBySlugInputSchema,
  myCollectionListInputSchema,
  myCollectionListResponseSchema,
  myCollectionSchema,
  type MyCollection,
  type MyCollectionListResponse,
} from "@azertykeycaps-app/schemas";

import { publicProcedure, router } from "../index";

const CMS_CACHE_TTL = 0;

function fetchCMS(
  url: string,
  apiKey: string | undefined,
  cacheTtl?: number,
): Promise<Response> {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (apiKey) {
    headers["Authorization"] = `users API-Key ${apiKey}`;
  }

  const fetchOptions: RequestInit & { cf?: object } = { headers };

  if (cacheTtl) {
    fetchOptions.cf = {
      cacheTtl,
      cacheEverything: true,
    };
  }

  return fetch(url, fetchOptions);
}

export const myCollectionRouter = router({
  /**
   * List my collection items with pagination and filters
   */
  list: publicProcedure
    .input(myCollectionListInputSchema)
    .output(myCollectionListResponseSchema)
    .query(async ({ ctx, input }) => {
      const { limit, page, status, search } = input;

      const query = qs.stringify(
        {
          limit,
          page,
          where: {
            ...(status && { status: { equals: status } }),
            ...(search && {
              title: { contains: search },
            }),
          },
          select: {
            id: true,
            title: true,
            slug: true,
            description: true,
            status: true,
          },
        },
        { addQueryPrefix: true },
      );

      try {
        const response = await fetchCMS(
          `${ctx.env.CMS_API_URL}/api/my-collection${query}`,
          ctx.env.CMS_API_KEY,
          ctx.isDev ? undefined : CMS_CACHE_TTL,
        );

        if (!response.ok) {
          console.error(`CMS API error: ${response.status}`);
          return {
            docs: [],
            totalDocs: 0,
            totalPages: 0,
            page: 1,
            hasNextPage: false,
            hasPrevPage: false,
            error: `CMS API returned status ${response.status}`,
          };
        }

        const data = (await response.json()) as MyCollectionListResponse;

        const validation = myCollectionListResponseSchema.safeParse(data);
        if (!validation.success) {
          console.error(
            "[myCollection.list] Output validation failed:",
            JSON.stringify(validation.error.issues, null, 2),
          );
        }

        return data;
      } catch (error) {
        console.error("Failed to fetch my collection list:", error);
        return {
          docs: [],
          totalDocs: 0,
          totalPages: 0,
          page: 1,
          hasNextPage: false,
          hasPrevPage: false,
          error: "Failed to fetch data",
        };
      }
    }),

  /**
   * Get single item by slug
   */
  bySlug: publicProcedure
    .input(myCollectionBySlugInputSchema)
    .output(myCollectionSchema.nullable())
    .query(async ({ ctx, input }) => {
      const query = qs.stringify(
        {
          where: { slug: { equals: input.slug } },
          limit: 1,
        },
        { addQueryPrefix: true },
      );

      try {
        const response = await fetchCMS(
          `${ctx.env.CMS_API_URL}/api/my-collection${query}`,
          ctx.env.CMS_API_KEY,
          ctx.isDev ? undefined : CMS_CACHE_TTL,
        );

        if (!response.ok) {
          console.error(`CMS API error: ${response.status}`);
          return null;
        }

        const { docs } = (await response.json()) as { docs: MyCollection[] };
        const item = docs[0] ?? null;

        if (item) {
          const validation = myCollectionSchema.safeParse(item);
          if (!validation.success) {
            console.error(
              "[myCollection.bySlug] Output validation failed:",
              JSON.stringify(validation.error.issues, null, 2),
            );
          }
        }

        return item;
      } catch (error) {
        console.error("Failed to fetch item by slug:", error);
        return null;
      }
    }),
});
```

**Key patterns:**

- Use `qs-esm` for query string building
- List endpoint: return paginated response with error field
- Detail endpoint: return single item or null
- Always validate responses with Zod
- Use `select` to minimize payload size for list queries

### Step 7: Register Router

**File:** `packages/api/src/routers/index.ts`

```typescript
import { myCollectionRouter } from "./my-collection";

export const appRouter = router({
  // ... existing routers
  myCollection: myCollectionRouter,
});
```

### Step 8: Create Server Functions

**File:** `apps/web/src/features/my-collection/api/get-my-collection-list.ts`

```typescript
import { createServerFn } from "@tanstack/react-start";

import type { MyCollectionListInput } from "@azertykeycaps-app/schemas";

import { serverTRPCClient } from "@/lib/server-trpc";

export const getMyCollectionList = createServerFn({ method: "GET" })
  .inputValidator((data: MyCollectionListInput) => data)
  .handler(async ({ data }) => {
    return await serverTRPCClient.myCollection.list.query(data);
  });
```

**File:** `apps/web/src/features/my-collection/api/get-my-collection-by-slug.ts`

```typescript
import { createServerFn } from "@tanstack/react-start";

import { serverTRPCClient } from "@/lib/server-trpc";

export const getMyCollectionBySlug = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    return await serverTRPCClient.myCollection.bySlug.query({
      slug: data.slug,
    });
  });
```

### Step 9: Use in Routes

**List Route:** `apps/web/src/routes/_app/my-collection/index.tsx`

```typescript
import { createFileRoute } from "@tanstack/react-router";

import { myCollectionFiltersSchema } from "@azertykeycaps-app/schemas";

import { getMyCollectionList } from "@/features/my-collection/api/get-my-collection-list";
import { buildCacheHeaders } from "@/lib/cache-tags";

export const Route = createFileRoute("/_app/my-collection/")({
  validateSearch: myCollectionFiltersSchema,
  loaderDeps: ({ search }) => search,
  loader: async ({ deps }) => {
    const data = await getMyCollectionList({
      page: deps.page,
      limit: 12,
      status: deps.status,
      search: deps.search,
    });
    return { data };
  },
  headers: () => buildCacheHeaders({ collection: ["my-collection"] }),
  staleTime: 60_000, // 1 minute
  gcTime: 5 * 60_000, // 5 minutes
  component: MyCollectionListPage,
});

function MyCollectionListPage() {
  const { data } = Route.useLoaderData();

  return (
    <div>
      {data.docs.map((item) => (
        <div key={item.id}>
          <h2>{item.title}</h2>
          <p>{item.description}</p>
        </div>
      ))}
    </div>
  );
}
```

**Detail Route:** `apps/web/src/routes/_app/my-collection/$slug.tsx`

```typescript
import { createFileRoute, notFound } from "@tanstack/react-router";

import { getMyCollectionBySlug } from "@/features/my-collection/api/get-my-collection-by-slug";
import { buildCacheHeaders } from "@/lib/cache-tags";

export const Route = createFileRoute("/_app/my-collection/$slug")({
  loader: async ({ params }) => {
    const item = await getMyCollectionBySlug({ slug: params.slug });
    if (!item) throw notFound();
    return { item };
  },
  headers: ({ loaderData }) =>
    buildCacheHeaders({ content: [`my-collection:${loaderData.item.slug}`] }),
  staleTime: 60_000, // 1 minute
  gcTime: 5 * 60_000, // 5 minutes
  component: MyCollectionDetailPage,
});

function MyCollectionDetailPage() {
  const { item } = Route.useLoaderData();

  return (
    <article>
      <h1>{item.title}</h1>
      <p>{item.description}</p>
    </article>
  );
}
```

---

## Complete Integration Checklist

### For Global Collections

- [ ] Create CMS global config (`apps/cms/src/globals/MyGlobal.ts`)
- [ ] Register in `payload.config.ts` globals array
- [ ] Add to SEO plugin globals array (if using SEO)
- [ ] Define schema in `packages/schemas/src/globals.ts`
- [ ] Add tRPC procedure to `packages/api/src/routers/globals.ts`
- [ ] Create server function in `apps/web/src/features/globals/api/`
- [ ] Use in route loader or layout context
- [ ] Add cache tags for invalidation

### For Regular Collections

- [ ] Create CMS collection config (`apps/cms/src/collections/MyCollection.ts`)
- [ ] Register in `payload.config.ts` collections array
- [ ] Add to SEO plugin collections array (if using SEO)
- [ ] Add to search plugin collections array (if using search)
- [ ] Define schemas in `packages/schemas/src/my-collection.ts`
- [ ] Add filter schemas in `packages/schemas/src/filters.ts`
- [ ] Add response schemas in `packages/schemas/src/responses.ts`
- [ ] Create tRPC router in `packages/api/src/routers/my-collection.ts`
- [ ] Register router in `packages/api/src/routers/index.ts`
- [ ] Create server functions in `apps/web/src/features/my-collection/api/`
- [ ] Create list route with pagination/filters
- [ ] Create detail route with slug parameter
- [ ] Add cache tags for invalidation

---

## Recurring Patterns

### 1. Field Hooks

Auto-generate slug from title:

```typescript
const generateSlugFromTitle: FieldHook = ({ data, operation, value }) => {
  if (operation === "create" && !value && data?.title) {
    return slugify(data.title, { lower: true, strict: true, locale: "fr" });
  }
  return value;
};
```

### 2. Access Control

All collections/globals use authenticated access:

```typescript
access: {
  read: isAuthenticated,
}
```

### 3. Cache Invalidation

All collections/globals trigger cache invalidation:

```typescript
hooks: {
  afterChange: [collectionAfterChangeHook], // or globalAfterChangeHook
  afterDelete: [collectionAfterDeleteHook],
}
```

### 4. Bilingual Labels

All admin UI uses French/English labels:

```typescript
label: { fr: "Mon Titre", en: "My Title" }
```

### 5. Schema Validation

All tRPC procedures validate output:

```typescript
const validation = mySchema.safeParse(data);
if (!validation.success) {
  console.error(
    "[router.procedure] Validation failed:",
    validation.error.issues,
  );
}
```

### 6. Error Handling

All tRPC queries return null or error object on failure:

```typescript
try {
  // ... fetch logic
  return data;
} catch (error) {
  console.error("Failed to fetch:", error);
  return null; // or error object for lists
}
```

### 7. Cache Headers

All routes specify cache configuration:

```typescript
headers: () => buildCacheHeaders({ global: ["my-global"] }),
staleTime: 60_000,
gcTime: 5 * 60_000,
```

### 8. Pagination Factory

Use factory for paginated responses:

```typescript
export const myListResponseSchema = createPaginatedResponseSchema(myCardSchema);
```

### 9. CMS Query Building

Use `qs-esm` for complex queries:

```typescript
const query = qs.stringify(
  {
    limit,
    page,
    where: { status: { equals: "published" } },
    select: { id: true, title: true },
  },
  { addQueryPrefix: true },
);
```

### 10. Server Function Pattern

All server functions wrap tRPC calls:

```typescript
export const getMyData = createServerFn({ method: "GET" })
  .inputValidator((data: MyInput) => data)
  .handler(async ({ data }) => {
    return await serverTRPCClient.myRouter.procedure.query(data);
  });
```

---

## Related Documentation

- [SERVER_ARCHITECTURE.md](./SERVER_ARCHITECTURE.md) - tRPC and Hono server architecture
- [CACHING.md](./CACHING.md) - Cache invalidation and CDN purging
- [apps/cms/README.md](../../apps/cms/README.md) - Payload CMS setup
- [Payload Docs](https://payloadcms.com/docs) - Official Payload documentation
