# Azertykeycaps Design System

> **Brutalist, monospace aesthetic with sharp corners and cool-tinted grays.**

## Quick Reference

| Aspect              | Value                        |
| ------------------- | ---------------------------- |
| **Font**            | Space Mono (monospace)       |
| **Border Radius**   | 0 (sharp corners everywhere) |
| **Color Hue**       | 250 (cool blue-tinted grays) |
| **Color Space**     | oklch                        |
| **UI Library**      | Base UI (`@base-ui/react`)   |
| **Styling Pattern** | coss.com/ui                  |
| **CSS Framework**   | Tailwind CSS v4              |

---

## LLM Documentation Links

### Core Libraries

- **Base UI**: https://base-ui.com/llms.txt
- **Base UI Full**: https://base-ui.com/llms-full.txt
- **coss.com/ui**: https://coss.com/ui/llms.txt
- **Tailwind CSS v4**: https://tailwindcss.com/docs (no llms.txt yet)

### Framework Documentation

- **Hono (Backend)**: https://hono.dev/llms-full.txt
- **Hono Small**: https://hono.dev/llms-small.txt
- **TanStack Router**: https://tanstack.com/router/latest/docs/framework/react/overview
- **TanStack Start**: https://tanstack.com/start/latest/docs/framework/react/overview
- **Payload CMS**: https://payloadcms.com/llms-full.txt

### Design References

- **Web Interface Guidelines**: https://interfaces.rauno.me (inspiration for brutalist aesthetic)

---

## Typography

### Font Family

```css
--font-sans:
  "Space Mono", ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas,
  "Liberation Mono", monospace;
--font-mono:
  "Space Mono", ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas,
  "Liberation Mono", monospace;
```

### Loading Font (in `__root.tsx`)

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link
  rel="preconnect"
  href="https://fonts.gstatic.com"
  crossorigin="anonymous"
/>
<link
  href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap"
  rel="stylesheet"
/>
```

### Typography Rules

- **Headings**: `font-bold tracking-tight`
- **h1**: `text-wrap: balance` (prevents orphans)
- **h2, h3**: `text-wrap: pretty`
- **Body**: `font-variant-numeric: tabular-nums` (aligned numbers)

### Heading Sizes (with Container Queries)

```tsx
// Page title (h1)
<h1 className="font-heading text-3xl @sm:text-4xl @md:text-5xl" />

// Section title (h2)
<h2 className="font-heading text-2xl @sm:text-3xl" />

// Subsection (h3)
<h3 className="font-semibold text-lg" />
```

---

## Colors

### Color System

All colors use **oklch** color space with hue **250** (cool blue tint).

### Light Mode

```css
--background: oklch(0.995 0.003 250); /* Near white */
--foreground: oklch(0.145 0.005 250); /* Near black */
--muted: oklch(0.965 0.005 250); /* Light gray */
--muted-foreground: oklch(0.45 0.012 250); /* Medium gray */
--border: oklch(0.91 0.008 250); /* Border gray */
--primary: oklch(0.205 0.005 250); /* Dark (inverted) */
--accent: oklch(0.955 0.008 250); /* Hover state */
```

### Dark Mode

```css
--background: oklch(0.12 0.006 250); /* Near black */
--foreground: oklch(0.985 0.003 250); /* Near white */
--muted: oklch(0.22 0.008 250); /* Dark gray */
--muted-foreground: oklch(0.65 0.012 250); /* Medium gray */
--border: oklch(0.28 0.01 250); /* Border gray */
--primary: oklch(0.87 0.005 250); /* Light (inverted) */
--accent: oklch(0.28 0.01 250); /* Hover state */
```

### Semantic Colors

```css
/* Destructive/Error */
--destructive: oklch(0.58 0.22 27); /* Red */
--destructive-foreground: var(--color-red-700);

/* Info */
--info: var(--color-blue-500);
--info-foreground: var(--color-blue-700);

/* Success */
--success: var(--color-emerald-500);
--success-foreground: var(--color-emerald-700);

/* Warning */
--warning: var(--color-amber-500);
--warning-foreground: var(--color-amber-700);
```

### Usage

```tsx
// Text colors
<p className="text-foreground" />          // Primary text
<p className="text-muted-foreground" />    // Secondary text

// Background colors
<div className="bg-background" />          // Page background
<div className="bg-card" />                // Card background
<div className="bg-muted" />               // Muted sections
<div className="bg-accent" />              // Hover/active states

// Semantic
<div className="text-destructive" />       // Error text
<div className="bg-destructive/4" />       // Error background (light)
```

---

## Border Radius

### Rule: NO BORDER RADIUS

All `--radius-*` variables are set to `0`. This creates the brutalist sharp-corner aesthetic.

```css
--radius: 0;
--radius-sm: 0;
--radius-md: 0;
--radius-lg: 0;
--radius-xl: 0;
--radius-2xl: 0;
--radius-3xl: 0;
--radius-4xl: 0;
```

### Forbidden Classes

Never use these Tailwind classes:

- `rounded`, `rounded-sm`, `rounded-md`, `rounded-lg`, `rounded-xl`, `rounded-2xl`, `rounded-3xl`, `rounded-full`

### Allowed Classes

- `rounded-none` (explicit, for documentation)
- `rounded-[inherit]` (for nested elements that need to inherit parent's radius)

---

## Spacing & Layout

### Container Queries

Use `@container` queries for component-level responsiveness.

```tsx
// Parent must have @container class
<div className="@container">
  <div className="grid @sm:grid-cols-2 @lg:grid-cols-3">
    {/* Responsive based on container width, not viewport */}
  </div>
</div>
```

### Container Query Breakpoints

| Query | Width |
| ----- | ----- |
| `@xs` | 320px |
| `@sm` | 384px |
| `@md` | 448px |
| `@lg` | 512px |
| `@xl` | 576px |

### Page Container Sizes

```tsx
import { PageContainer } from "@/components/ui/page-container";

<PageContainer size="full" />    // No max-width
<PageContainer size="lg" />      // max-w-7xl (1280px)
<PageContainer size="default" /> // max-w-5xl (1024px) - DEFAULT
<PageContainer size="md" />      // max-w-3xl (768px)
<PageContainer size="sm" />      // max-w-xl (576px)
<PageContainer size="narrow" />  // max-w-md (448px)
```

### Section Spacing

```tsx
import { PageSection } from "@/components/ui/page-container";

<PageSection spacing="none" />   // No padding
<PageSection spacing="sm" />     // py-4 @sm:py-6
<PageSection spacing="default" /> // py-6 @sm:py-8 @md:py-12 - DEFAULT
<PageSection spacing="lg" />     // py-8 @sm:py-12 @md:py-16
<PageSection spacing="xl" />     // py-12 @sm:py-16 @md:py-24
```

---

## Semantic HTML

### Page Structure

```tsx
<PageContainer>
  {" "}
  {/* <main> element */}
  <PageHeader>
    {" "}
    {/* <header> for page title area */}
    <PageTitle /> {/* <h1> */}
    <PageDescription /> {/* <p> */}
  </PageHeader>
  <PageSection>
    {" "}
    {/* <section> */}
    <PageSectionHeader>
      {" "}
      {/* <header> */}
      <PageSectionTitle /> {/* <h2> */}
    </PageSectionHeader>
    <PageSectionContent>
      {" "}
      {/* <div> */}
      {/* Content */}
    </PageSectionContent>
  </PageSection>
</PageContainer>
```

### Required Semantic Elements

| Content Type        | HTML Element         | Example                     |
| ------------------- | -------------------- | --------------------------- |
| Main content        | `<main>`             | `PageContainer`             |
| Page header         | `<header>`           | `PageHeader`                |
| Content sections    | `<section>`          | `PageSection`               |
| Navigation          | `<nav>`              | Back links, breadcrumbs     |
| Article content     | `<article>`          | Blog posts, keycap articles |
| Images with caption | `<figure>`           | Article hero images         |
| Lists               | `<ul role="list">`   | Article grids               |
| Definitions         | `<dl><dt><dd>`       | Metadata (dates, specs)     |
| Time                | `<time dateTime="">` | Dates                       |

### Example: Article Page

```tsx
<PageContainer size="md">
  <nav className="py-4">
    <Button variant="ghost" render={<Link to="/" />}>
      <ArrowLeftIcon />
      Back
    </Button>
  </nav>

  <article>
    <figure className="mb-8">
      <img src={article.img.url} alt={article.img.alt} />
    </figure>

    <header className="mb-8">
      <h1 className="font-heading text-3xl">{article.title}</h1>
    </header>

    <dl className="grid gap-2 text-sm @xs:grid-cols-2">
      <div>
        <dt className="text-muted-foreground">Start Date</dt>
        <dd>
          <time dateTime={article.startDate}>
            {formatDate(article.startDate)}
          </time>
        </dd>
      </div>
    </dl>
  </article>
</PageContainer>
```

### Example: List Page

```tsx
<PageSection>
  <PageSectionHeader>
    <PageSectionTitle>Latest Articles</PageSectionTitle>
  </PageSectionHeader>
  <PageSectionContent>
    <ul className="grid gap-6 @sm:grid-cols-2 @lg:grid-cols-3" role="list">
      {articles.map((article) => (
        <li key={article.id}>
          <ArticleCard article={article} />
        </li>
      ))}
    </ul>
  </PageSectionContent>
</PageSection>
```

---

## UI Components

### Import Pattern

Always import from `@/components/ui/`:

```tsx
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
```

### Core Components

#### Button

```tsx
<Button variant="default">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="xs" />       // h-7 (h-6 on sm)
<Button size="sm" />       // h-8 (h-7 on sm)
<Button size="default" />  // h-9 (h-8 on sm)
<Button size="lg" />       // h-10 (h-9 on sm)
<Button size="xl" />       // h-11 (h-10 on sm)

// Icon sizes
<Button size="icon-xs" />  // size-7 (size-6 on sm)
<Button size="icon-sm" />  // size-8 (size-7 on sm)
<Button size="icon" />     // size-9 (size-8 on sm)
<Button size="icon-lg" />  // size-10 (size-9 on sm)
<Button size="icon-xl" />  // size-11 (size-10 on sm)

// With Link (render prop pattern)
<Button render={<Link to="/about" />}>About</Button>
<Button render={<a href="https://example.com" target="_blank" />}>External</Button>
```

#### Card

```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle> {/* Renders as <h3> by default */}
    <CardTitle as="h2">Section Card</CardTitle> {/* Override heading level */}
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>{/* Content */}</CardContent> {/* Alias for CardPanel */}
  <CardFooter>{/* Actions */}</CardFooter>
</Card>
```

**Note:** `CardContent` and `CardPanel` are the same component - use either name.

#### Badge

```tsx
<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="destructive">Destructive</Badge>

// Semantic variants
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="error">Error</Badge>
<Badge variant="info">Info</Badge>
```

#### Alert

```tsx
<Alert variant="default">
  <AlertDescription>Default message</AlertDescription>
</Alert>

<Alert variant="error">
  <AlertCircleIcon className="size-4" />
  <AlertDescription>Error message</AlertDescription>
</Alert>

<Alert variant="warning">
  <AlertTriangleIcon className="size-4" />
  <AlertDescription>Warning message</AlertDescription>
</Alert>

<Alert variant="success">
  <CheckCircleIcon className="size-4" />
  <AlertDescription>Success message</AlertDescription>
</Alert>

<Alert variant="info">
  <InfoIcon className="size-4" />
  <AlertDescription>Info message</AlertDescription>
</Alert>
```

#### Empty State

```tsx
<Empty>
  <EmptyHeader>
    <EmptyMedia variant="icon">
      <SearchXIcon />
    </EmptyMedia>
    <EmptyTitle>No results found</EmptyTitle>
    <EmptyDescription>Try adjusting your filters.</EmptyDescription>
  </EmptyHeader>
  <EmptyContent>
    <Button onClick={handleClear}>Clear filters</Button>
  </EmptyContent>
</Empty>
```

#### Select

```tsx
<Select value={value} onValueChange={setValue}>
  <SelectTrigger className="w-40">
    <SelectValue placeholder="Select..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">All</SelectItem>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

#### Navigation Menu (Desktop)

```tsx
<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem>
      <NavigationMenuLink href="/" render={<Link to="/" />}>
        Home
      </NavigationMenuLink>
    </NavigationMenuItem>

    <NavigationMenuItem>
      <NavigationMenuTrigger>Profiles</NavigationMenuTrigger>
      <NavigationMenuContent>{/* Dropdown content */}</NavigationMenuContent>
    </NavigationMenuItem>
  </NavigationMenuList>

  <NavigationMenuPortal>
    <NavigationMenuPositioner>
      <NavigationMenuPopup>
        <NavigationMenuViewport />
      </NavigationMenuPopup>
    </NavigationMenuPositioner>
  </NavigationMenuPortal>
</NavigationMenu>
```

#### Sheet (Mobile Navigation)

```tsx
<Sheet>
  <SheetTrigger
    render={<Button variant="ghost" size="icon" />}
    aria-label="Open menu"
  >
    <MenuIcon />
  </SheetTrigger>
  <SheetContent side="left">
    <SheetHeader>
      <SheetTitle>Menu</SheetTitle>
    </SheetHeader>
    <nav>
      <SheetClose render={<Link to="/" />}>Home</SheetClose>
    </nav>
  </SheetContent>
</Sheet>
```

---

## Patterns & Rules

### 1. Render Prop Pattern

Use `render` prop for composition with TanStack Router `<Link>`:

```tsx
// Correct
<Button render={<Link to="/about" />}>About</Button>
<NavigationMenuLink render={<Link to="/" />} href="/">Home</NavigationMenuLink>

// Incorrect - wrapping creates nested interactive elements
<Link to="/about"><Button>About</Button></Link>
```

### 2. Image Optimization

```tsx
<img
  src={image.url}
  alt={image.alt}
  className="aspect-video w-full object-cover"
  loading="lazy"          // For below-fold images
  decoding="async"        // Non-blocking decode
/>

// For hero images (above fold)
<img
  src={image.url}
  alt={image.alt}
  loading="eager"
/>
```

### 3. Responsive Grids

Always use container queries, not viewport queries:

```tsx
// Correct - uses container width
<ul className="grid gap-6 @sm:grid-cols-2 @lg:grid-cols-3">

// Incorrect - uses viewport width
<ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
```

### 4. Focus States

All interactive elements must have visible focus states:

```css
:focus-visible {
  @apply outline-2 outline-offset-2 outline-ring;
}
```

### 5. Touch Optimization

Interactive elements have minimum touch target sizes:

```css
button, a, [role="button"] {
  touch-action: manipulation;
}

/* In component: */
pointer-coarse:after:min-h-11 pointer-coarse:after:min-w-11
```

### 6. Reduced Motion

Always respect user preferences:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## File Structure

```
apps/web/src/
├── components/
│   ├── ui/                     # UI primitives (Base UI wrappers)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── alert.tsx
│   │   ├── empty.tsx
│   │   ├── select.tsx
│   │   ├── navigation-menu.tsx
│   │   ├── sheet.tsx
│   │   ├── page-container.tsx
│   │   └── ...
│   ├── header.tsx              # Site header
│   ├── footer.tsx              # Site footer
│   ├── article-card.tsx        # Article card component
│   └── article-filters.tsx     # Filter controls
├── routes/
│   └── _app/                   # App layout routes
│       ├── index.tsx           # Homepage
│       ├── profile.$slug.tsx   # Profile page
│       ├── articles.$slug.tsx  # Article detail
│       ├── about.tsx           # About page
│       └── suggest.tsx         # Suggestion page
├── i18n/
│   ├── en.ts                   # English translations
│   └── fr.ts                   # French translations
├── lib/
│   ├── utils.ts                # cn() helper
│   └── article-utils.ts        # Article helpers
└── index.css                   # Design tokens & base styles
```

---

## Checklist for New Components

- [ ] Uses sharp corners (no `rounded-*` classes)
- [ ] Uses `oklch` colors from design tokens
- [ ] Uses `Space Mono` font (inherits from body)
- [ ] Supports dark mode via CSS variables
- [ ] Has visible focus states
- [ ] Touch targets are minimum 44x44px
- [ ] Respects reduced motion preferences
- [ ] Uses container queries, not viewport queries
- [ ] Uses semantic HTML elements
- [ ] Has proper `data-slot` attribute
- [ ] Uses `render` prop for composition with Link

---

## Checklist for New Pages

- [ ] Uses `PageContainer` with appropriate `size`
- [ ] Has `PageHeader` with `PageTitle`
- [ ] Content organized in `PageSection` components
- [ ] Uses semantic HTML (`article`, `nav`, `figure`, etc.)
- [ ] Lists use `<ul role="list">` with `<li>` children
- [ ] Dates use `<time dateTime="">` element
- [ ] Metadata uses `<dl><dt><dd>` pattern
- [ ] Images have `alt` text and lazy loading
- [ ] Error states use `Alert` component
- [ ] Empty states use `Empty` component
- [ ] Back navigation uses `Button` with `render` prop

---

## Common Mistakes to Avoid

### 1. Using viewport breakpoints instead of container queries

```tsx
// Bad
<div className="sm:grid-cols-2">

// Good
<div className="@sm:grid-cols-2">
```

### 2. Adding border radius

```tsx
// Bad
<div className="rounded-lg">

// Good
<div> {/* No rounded class needed */}
```

### 3. Wrapping Button with Link

```tsx
// Bad
<Link to="/"><Button>Click</Button></Link>

// Good
<Button render={<Link to="/" />}>Click</Button>
```

### 4. Using wrong Alert variant

```tsx
// Bad - 'destructive' doesn't exist
<Alert variant="destructive">

// Good
<Alert variant="error">
```

### 5. Hardcoding colors

```tsx
// Bad
<div className="bg-gray-100 text-gray-900">

// Good
<div className="bg-muted text-foreground">
```

### 6. Missing semantic HTML

```tsx
// Bad
<div className="grid">
  {items.map(item => <div key={item.id}>{item.name}</div>)}
</div>

// Good
<ul className="grid" role="list">
  {items.map(item => <li key={item.id}>{item.name}</li>)}
</ul>
```

---

## i18n Keys

### Navigation (`nav.*`)

```ts
nav: {
  home: "Home",
  about: "About",
  suggest: "Suggest",
  profiles: "Profiles",
  profileShapes: {
    sculpted: "Sculpted",
    uniform: "Uniform",
  },
}
```

### Common (`common.*`)

```ts
common: {
  new: "New",
  loading: "Loading...",
  error: "Error",
  noResults: "No results",
  previous: "Previous",
  next: "Next",
  back: "Back",
  backHome: "Back to home",
  clearFilters: "Clear filters",
}
```

### Status (`status.*`)

```ts
status: {
  in_stock: "In stock",
  extras_gb: "Extras GB",
  extras_in_stock: "Extras in stock",
  gb_running: "GB running",
  gb_ended: "GB ended",
  interest_check: "Interest Check",
  out_of_stock: "Out of stock",
}
```

### Materials (`materials.*`)

```ts
materials: {
  abs_double_shot: "ABS Double-shot",
  abs_pad_printed: "ABS Pad-printed",
  abs_simple: "ABS Simple",
  aluminium: "Aluminium",
  pbt_double_shot: "PBT Double-shot",
  pbt_dye_sub: "PBT Dye-sub",
  pbt_laser_printed: "PBT Laser-printed",
}
```

---

## Additional Documentation

| Document                                      | Description                                    |
| --------------------------------------------- | ---------------------------------------------- |
| [Z-Index Scale](./design/Z_INDEX.md)          | Fixed z-index tokens and layering rules        |
| [Animation Guidelines](./design/ANIMATION.md) | Transition and animation best practices        |
| [Component Reference](./design/COMPONENTS.md) | Detailed component variants, states, and sizes |

---

## Version History

| Version | Date       | Changes                                                                                                                          |
| ------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 1.1     | 2026-01-18 | Added semantic HTML props (CardTitle as, EmptyTitle as), oklch semantic colors, accessibility improvements, animation guidelines |
| 1.0     | 2026-01-16 | Initial design system documentation                                                                                              |
