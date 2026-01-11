# Schemas Package

Shared Zod schemas, constants, and TypeScript types used across the monorepo.

## Purpose

Single source of truth for:

- Data validation schemas (Zod)
- Constants (status values, material types, etc.)
- TypeScript types derived from schemas
- Route search params and tRPC input schemas

## File Structure

```
src/
  index.ts          # Re-exports all modules
  media.ts          # Media/image schemas
  profiles.ts       # KeycapProfile schemas + PROFILE_SHAPES constant
  articles.ts       # Article schemas + ARTICLE_STATUS, ARTICLE_MATERIALS constants
  dropshipping.ts   # DropshippingWebsite schemas + WEBSITE_CATEGORIES constant
  globals.ts        # Homepage, SocialNetworks, DropshippingInfoPage, DropshippingSitesPage
  filters.ts        # Route search params + tRPC input schemas
  responses.ts      # Paginated response schemas
```

## Key Exports

### Constants (used as i18n keys)

```typescript
import {
  ARTICLE_STATUS,        // { IN_STOCK: "in_stock", GB_RUNNING: "gb_running", ... }
  ARTICLE_STATUS_VALUES, // ["in_stock", "extras_gb", ...]
  ARTICLE_MATERIALS,     // { ABS_DOUBLE_SHOT: "abs_double_shot", ... }
  ARTICLE_MATERIAL_VALUES,
  PROFILE_SHAPES,        // { CHERRY: "cherry", SA: "sa", ... }
  WEBSITE_CATEGORIES,    // { KEYCAPS: "keycaps", KEYBOARDS: "keyboards", ... }
} from "@azertykeycaps-app/schemas";
```

### Schemas

```typescript
import {
  // Entity schemas
  articleSchema,
  keycapProfileSchema,
  keycapProfileRefSchema,
  dropshippingWebsiteSchema,
  mediaSchema,

  // Enum schemas
  articleStatusSchema,
  articleMaterialSchema,

  // Input schemas (tRPC)
  articleListInputSchema,
  articleBySlugInputSchema,
  profileListInputSchema,

  // Route search params (TanStack Router)
  articleFiltersSchema,

  // Response schemas
  articleListResponseSchema,
  profileListResponseSchema,
} from "@azertykeycaps-app/schemas";
```

### Types

```typescript
import type {
  Article,
  ArticleStatus,
  ArticleMaterial,
  KeycapProfile,
  KeycapProfileRef,
  DropshippingWebsite,
  Media,
  ArticleFilters,
  ArticleListInput,
  ArticleListResponse,
} from "@azertykeycaps-app/schemas";
```

## Usage Patterns

### In Payload CMS Collections

Constants are imported to define select field options:

```typescript
// apps/cms/src/collections/Articles.ts
import { ARTICLE_STATUS_VALUES } from "@azertykeycaps-app/schemas";

{
  name: "status",
  type: "select",
  options: ARTICLE_STATUS_VALUES.map((value) => ({ label: value, value })),
}
```

### In tRPC Routers

Input and output validation:

```typescript
// packages/api/src/routers/articles.ts
import {
  articleListInputSchema,
  articleListResponseSchema,
} from "@azertykeycaps-app/schemas";

publicProcedure
  .input(articleListInputSchema)
  .output(articleListResponseSchema)
  .query(async ({ input }) => { ... })
```

### In TanStack Router

Route search params validation:

```typescript
// apps/web/src/routes/index.tsx
import { articleFiltersSchema } from "@azertykeycaps-app/schemas";

export const Route = createFileRoute("/")({
  validateSearch: articleFiltersSchema,
});
```

### In Frontend i18n

Constants map to translation keys:

```typescript
// apps/web/src/i18n/fr.ts
export const fr = {
  status: {
    in_stock: "En stock",
    gb_running: "GB en cours",
    // Keys match ARTICLE_STATUS values
  },
};
```

## Adding New Schemas

1. Create schema file in `src/` with constants, Zod schemas, and types
2. Export from `src/index.ts`
3. Run `bun install` (workspace linking)
4. Import in consuming packages

## Dependencies

- `zod` - Schema validation library
