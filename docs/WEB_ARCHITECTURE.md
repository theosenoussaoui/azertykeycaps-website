# Web App Architecture

## Overview

The web application (`apps/web/`) follows a **feature-based architecture** inspired by [bulletproof-react](https://github.com/alan2207/bulletproof-react). This structure promotes scalability, maintainability, and clear separation of concerns.

## Directory Structure

```
apps/web/src/
├── routes/                      # TanStack Router routes (thin wrappers)
│   ├── __root.tsx              # Root layout
│   ├── _app.tsx                # Public layout with header/footer
│   ├── _app/                   # Routes using public layout
│   │   ├── index.tsx           # /
│   │   ├── about.tsx           # /about
│   │   ├── suggest.tsx         # /suggest
│   │   ├── articles.$slug.tsx  # /articles/:slug
│   │   └── profile.$slug.tsx   # /profile/:slug
│   ├── dashboard.tsx           # /dashboard (protected)
│   └── login.tsx               # /login
│
├── features/                    # Feature-based modules
│   ├── articles/               # Articles domain
│   │   ├── api/                # Server functions
│   │   ├── components/         # Feature components
│   │   └── utils/              # Feature utilities
│   ├── auth/                   # Authentication domain
│   │   ├── api/
│   │   ├── components/
│   │   └── lib/
│   └── globals/                # CMS global content
│       ├── api/
│       └── components/
│
├── components/                  # Shared components
│   ├── ui/                     # Base UI primitives
│   ├── errors/                 # Error components
│   └── layout/                 # Layout components
│
├── hooks/                       # Shared React hooks
├── i18n/                        # Internationalization
├── lib/                         # Shared utilities
├── middleware/                  # Route middleware
│
├── router.tsx                   # Router configuration
├── routeTree.gen.ts            # Auto-generated
└── index.css                    # Global styles
```

## Feature Structure

Each feature is a self-contained module:

```
features/[feature-name]/
├── api/                # Server functions (tRPC calls)
│   ├── get-data.ts
│   └── mutate-data.ts
├── components/         # Feature-specific React components
│   ├── my-component.tsx
│   └── my-other-component.tsx
├── hooks/              # Feature-specific hooks (optional)
├── utils/              # Feature-specific utilities (optional)
└── types/              # Feature-specific types (optional)
```

**Guidelines:**

- Only create folders that are needed
- Keep feature scope focused and cohesive
- If code is used by multiple features, move it to `components/`, `hooks/`, or `lib/`

## Import Rules

### Dependency Flow

```
┌─────────────────────────────────────────────────────┐
│                    routes/                           │
│            (imports from features + shared)          │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│                   features/                          │
│            (imports from shared only)                │
│         (CANNOT import from other features)          │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│            components/ hooks/ lib/ i18n/             │
│                   (shared)                           │
└─────────────────────────────────────────────────────┘
```

### Import Examples

```typescript
// ✅ Good: Route imports from features
// routes/_app/index.tsx
import { getLatestArticles } from "@/features/articles/api/get-latest-articles";
import { ArticleCard } from "@/features/articles/components/article-card";

// ✅ Good: Feature imports from shared
// features/articles/components/article-card.tsx
import { Badge } from "@/components/ui/badge";
import { t } from "@/i18n";

// ❌ Bad: Feature imports from another feature
// features/articles/components/article-card.tsx
import { getUser } from "@/features/auth/api/get-user"; // DON'T DO THIS

// ❌ Bad: Relative imports (always use @/ aliases)
import { Button } from "../ui/button"; // DON'T DO THIS
import { getUser } from "./get-user"; // DON'T DO THIS
```

### Path Aliases

**Always use `@/` path aliases**, even for imports in the same folder:

```typescript
// ✅ Good
import { getUser } from "@/features/auth/api/get-user";

// ❌ Bad
import { getUser } from "./get-user";
```

## Thin Routes Pattern

Routes should be **thin wrappers** that:

1. Import server functions from features
2. Import components from features
3. Configure route metadata (head, headers, cache)
4. Use shared error components
5. Compose the page layout

### Before (Monolithic Route)

```typescript
// ❌ Bad: Everything in one file (150+ lines)
export const Route = createFileRoute("/_app/")({
  component: HomeComponent,
  loader: async () => {
    // Server function defined inline
    const articles = await serverTRPCClient.articles.list.query({ ... });
    return { articles };
  },
  errorComponent: () => {
    // Error component defined inline (30 lines)
    const router = useRouter();
    return (
      <PageContainer>
        <Empty>...</Empty>
        <Button onClick={() => router.invalidate()}>Retry</Button>
      </PageContainer>
    );
  },
});

function HomeComponent() {
  // 100+ lines of component code
}
```

### After (Thin Route)

```typescript
// ✅ Good: ~50 lines, imports from features
import { PageError } from "@/components/errors/page-error";
import { getLatestArticles } from "@/features/articles/api/get-latest-articles";
import { ArticleCard } from "@/features/articles/components/article-card";

export const Route = createFileRoute("/_app/")({
  component: HomeComponent,
  loader: async () => getLatestArticles(),
  errorComponent: PageError,
  headers: () => ({
    "Cache-Control":
      "public, max-age=300, s-maxage=300, stale-while-revalidate=3600",
  }),
});

function HomeComponent() {
  const { articles } = Route.useLoaderData();
  // Clean, focused rendering logic
}
```

## Server Functions

### Pattern

All data fetching uses TanStack Start server functions:

```typescript
// features/articles/api/get-latest-articles.ts
import { createServerFn } from "@tanstack/react-start";
import { serverTRPCClient } from "@/lib/server-trpc";

/**
 * Server function to fetch latest articles.
 * Runs ONLY on the server - not exposed to browser.
 */
export const getLatestArticles = createServerFn({ method: "GET" }).handler(
  async () => {
    const articles = await serverTRPCClient.articles.list.query({
      page: 1,
      limit: 3,
    });
    return { articles };
  },
);
```

### With Input Validation

```typescript
// features/articles/api/get-article-by-slug.ts
export const getArticleBySlug = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    return await serverTRPCClient.articles.bySlug.query({ slug: data.slug });
  });
```

### Usage in Routes

```typescript
// In route loader
loader: async ({ params }) => {
  const article = await getArticleBySlug({ data: { slug: params.slug } });
  if (!article) throw notFound();
  return { article };
},
```

## Error Handling

### Shared Error Component

```typescript
// components/errors/page-error.tsx
export interface PageErrorProps {
  showBackButton?: boolean;
  backTo?: string;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

export function PageError({ ... }: PageErrorProps) { ... }
export function PageErrorWithBack(props) {
  return <PageError showBackButton {...props} />;
}
```

### Usage in Routes

```typescript
// Basic error page
errorComponent: PageError

// With back button (detail pages)
errorComponent: PageErrorWithBack

// Custom configuration
errorComponent: () => (
  <PageError
    showBackButton
    backTo="/articles"
    title="Article introuvable"
    description="Cet article n'existe pas ou a été supprimé."
  />
)
```

## Adding a New Feature

### Step 1: Create Directory Structure

```bash
mkdir -p src/features/my-feature/{api,components}
```

### Step 2: Create Server Functions

```typescript
// features/my-feature/api/get-my-data.ts
import { createServerFn } from "@tanstack/react-start";
import { serverTRPCClient } from "@/lib/server-trpc";

export const getMyData = createServerFn({ method: "GET" }).handler(async () => {
  return await serverTRPCClient.myRouter.getData.query();
});
```

### Step 3: Create Components

```typescript
// features/my-feature/components/my-component.tsx
import { Button } from "@/components/ui/button";
import { t } from "@/i18n";

interface MyComponentProps {
  data: MyData;
}

export function MyComponent({ data }: MyComponentProps) {
  const i18n = t();
  return (
    <div>
      <h1>{data.title}</h1>
      <Button>{i18n.common.action}</Button>
    </div>
  );
}
```

### Step 4: Create Route

```typescript
// routes/_app/my-page.tsx
import { createFileRoute } from "@tanstack/react-router";
import { PageError } from "@/components/errors/page-error";
import { PageContainer, PageHeader, PageTitle } from "@/components/ui/page-container";
import { getMyData } from "@/features/my-feature/api/get-my-data";
import { MyComponent } from "@/features/my-feature/components/my-component";
import { t } from "@/i18n";

export const Route = createFileRoute("/_app/my-page")({
  component: MyPage,
  loader: async () => getMyData(),
  head: () => ({
    meta: [
      { title: t().pages.myPage.metaTitle },
      { name: "description", content: t().pages.myPage.metaDescription },
    ],
  }),
  headers: () => ({
    "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=3600",
  }),
  errorComponent: PageError,
});

function MyPage() {
  const data = Route.useLoaderData();
  const i18n = t();

  return (
    <PageContainer size="md">
      <PageHeader>
        <PageTitle>{i18n.pages.myPage.title}</PageTitle>
      </PageHeader>
      <MyComponent data={data} />
    </PageContainer>
  );
}
```

### Step 5: Add Translations

```typescript
// i18n/fr.ts
pages: {
  myPage: {
    title: "Ma Page",
    metaTitle: "Ma Page - Azertykeycaps",
    metaDescription: "Description de ma page.",
  },
},

// i18n/en.ts
pages: {
  myPage: {
    title: "My Page",
    metaTitle: "My Page - Azertykeycaps",
    metaDescription: "Description of my page.",
  },
},
```

## Current Features

### articles

Handles all article-related functionality:

- Listing articles (with pagination, filters)
- Article detail pages
- Article card display

**API:**

- `get-latest-articles.ts` - Home page articles
- `get-article-by-slug.ts` - Single article
- `get-articles-by-profile.ts` - Profile page with filters

**Components:**

- `article-card.tsx` - Card display with image, badges
- `article-content.tsx` - Full article content
- `article-filters.tsx` - Status/material filters
- `articles-pagination.tsx` - Pagination controls

### auth

Handles authentication:

- Sign in/up forms
- User session management
- Protected route data fetching

**API:**

- `get-user.ts` - Get current session
- `get-private-data.ts` - Protected data fetching

**Components:**

- `sign-in-form.tsx` - Login form
- `sign-up-form.tsx` - Registration form
- `user-menu.tsx` - User dropdown (unused currently)

### globals

Handles CMS global content:

- Layout data (nav, footer)
- Static pages (about, suggest)

**API:**

- `get-layout-data.ts` - Social networks + profiles for nav
- `get-about-content.ts` - About page CMS content
- `get-suggest-content.ts` - Suggest page CMS content

**Components:**

- `rich-text-content.tsx` - Lexical rich text renderer

## Migration Notes

### Files Moved

| Old Location                         | New Location                                           |
| ------------------------------------ | ------------------------------------------------------ |
| `components/article-card.tsx`        | `features/articles/components/article-card.tsx`        |
| `components/article-filters.tsx`     | `features/articles/components/article-filters.tsx`     |
| `components/articles-pagination.tsx` | `features/articles/components/articles-pagination.tsx` |
| `components/sign-in-form.tsx`        | `features/auth/components/sign-in-form.tsx`            |
| `components/sign-up-form.tsx`        | `features/auth/components/sign-up-form.tsx`            |
| `components/user-menu.tsx`           | `features/auth/components/user-menu.tsx`               |
| `components/header.tsx`              | `components/layout/header.tsx`                         |
| `components/footer.tsx`              | `components/layout/footer.tsx`                         |
| `components/loader.tsx`              | `components/layout/loader.tsx`                         |
| `lib/article-utils.ts`               | `features/articles/utils/article-utils.ts`             |
| `lib/auth-client.ts`                 | `features/auth/lib/auth-client.ts`                     |
| `functions/get-user.ts`              | `features/auth/api/get-user.ts`                        |

### Files Removed

- `lib/trpc.ts` - Client-side tRPC (unused, all data is SSR)

### Server Functions Extracted

Server functions were extracted from route files to feature API folders:

| Route                     | Extracted To                                       |
| ------------------------- | -------------------------------------------------- |
| `_app.tsx`                | `features/globals/api/get-layout-data.ts`          |
| `_app/index.tsx`          | `features/articles/api/get-latest-articles.ts`     |
| `_app/about.tsx`          | `features/globals/api/get-about-content.ts`        |
| `_app/suggest.tsx`        | `features/globals/api/get-suggest-content.ts`      |
| `_app/articles.$slug.tsx` | `features/articles/api/get-article-by-slug.ts`     |
| `_app/profile.$slug.tsx`  | `features/articles/api/get-articles-by-profile.ts` |
| `dashboard.tsx`           | `features/auth/api/get-private-data.ts`            |

### Error Components Consolidated

All route error components were replaced with the shared `PageError` component, eliminating ~180 lines of duplication.

## Related Documentation

- [apps/web/CLAUDE.md](../apps/web/CLAUDE.md) - Quick reference
- [CACHING.md](./CACHING.md) - Cache invalidation
- [DESIGN_SYSTEM.md](./design/DESIGN_SYSTEM.md) - UI guidelines
- [SERVER_ARCHITECTURE.md](./SERVER_ARCHITECTURE.md) - Backend architecture
