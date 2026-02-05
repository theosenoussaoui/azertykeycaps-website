# Azertykeycaps Design System

> **Clean, modern aesthetic with sharp corners and cool-tinted grays.**

## Quick Reference

| Aspect              | Value                                     |
| ------------------- | ----------------------------------------- |
| **Font (Sans)**     | Geist Sans (body text)                    |
| **Font (Mono)**     | Geist Mono (headings, badges, nav links)  |
| **Font (Heading)**  | Geist Mono (`font-heading`)               |
| **Border Radius**   | 0 (sharp corners everywhere)              |
| **Color Hue**       | 250 (cool blue-tinted grays)              |
| **Color Space**     | oklch                                     |
| **UI Library**      | Base UI (`@base-ui/react`)                |
| **Styling Pattern** | coss.com/ui                               |
| **CSS Framework**   | Tailwind CSS v4                           |
| **Container Width** | max-w-7xl (1280px)                        |
| **Grid System**     | Responsive: 2 cols mobile, 8 cols desktop |

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
  "Geist Variable", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
  "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
--font-mono:
  "Geist Mono Variable", ui-monospace, SFMono-Regular, "SF Mono", Menlo,
  Consolas, "Liberation Mono", monospace;
--font-heading:
  "Geist Mono Variable", ui-monospace, SFMono-Regular, "SF Mono", Menlo,
  Consolas, "Liberation Mono", monospace;
```

### Loading Font (via Fontsource in `index.css`)

```css
/* Self-hosted Geist fonts - no external requests */
@import "@fontsource-variable/geist";
@import "@fontsource-variable/geist-mono";
```

### Typography Rules

- **Headings**: `font-heading font-bold tracking-tight` (uses Geist Mono)
- **Body text**: `font-sans` (uses Geist Sans)
- **Badges**: `font-mono` (uses Geist Mono)
- **Nav links**: `font-mono font-semibold uppercase tracking-tight` (uses Geist Mono)
- **Action links/buttons**: `font-mono font-semibold uppercase tracking-tight`
- **h1**: `text-wrap: balance` (prevents orphans)
- **h2, h3**: `text-wrap: pretty`
- **Body**: `font-variant-numeric: tabular-nums` (aligned numbers)

### Font Usage Guidelines

| Element        | Font Class                                         | Font Family |
| -------------- | -------------------------------------------------- | ----------- |
| Page titles    | `font-heading`                                     | Geist Mono  |
| Section titles | `font-heading`                                     | Geist Mono  |
| Card titles    | `font-heading`                                     | Geist Mono  |
| Body text      | `font-sans`                                        | Geist Sans  |
| Badges         | `font-mono`                                        | Geist Mono  |
| Navigation     | `font-mono font-semibold uppercase tracking-tight` | Geist Mono  |
| Action buttons | `font-mono font-semibold uppercase tracking-tight` | Geist Mono  |
| Code           | `font-mono`                                        | Geist Mono  |
| Footer links   | `font-mono font-semibold uppercase tracking-tight` | Geist Mono  |

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

<PageContainer />                // max-w-7xl (1280px) - DEFAULT
<PageContainer size="full" />    // No max-width
<PageContainer size="7xl" />     // max-w-7xl (1280px) - same as default
<PageContainer size="6xl" />     // max-w-6xl (1152px)
<PageContainer size="lg" />      // max-w-5xl (1024px)
<PageContainer size="md" />      // max-w-3xl (768px)
<PageContainer size="sm" />      // max-w-xl (576px)
<PageContainer size="narrow" />  // max-w-md (448px)
```

**Important:** All pages should use the default `max-w-7xl` container for visual consistency. The header and footer also use this width to ensure alignment with the 8-column grid lines.

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

### Example: Article Page with Breadcrumbs

```tsx
<PageContainer>
  {/* Breadcrumb Navigation */}
  <nav className="py-4">
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink render={<Link to="/" />}>Home</BreadcrumbLink>
        </BreadcrumbItem>
        {article.profile && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                render={
                  <Link
                    to="/profile/$slug"
                    params={{ slug: article.profile.slug }}
                  />
                }
              >
                {article.profile.title}
              </BreadcrumbLink>
            </BreadcrumbItem>
          </>
        )}
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage className="max-w-48 truncate">
            {article.title}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
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

  {/* Related Content */}
  {relatedArticles.length > 0 && (
    <PageSection>
      <PageSectionHeader>
        <PageSectionTitle>Similar keysets</PageSectionTitle>
      </PageSectionHeader>
      <PageSectionContent>
        <SectionDivider />
        <CardGrid as="ul">
          {relatedArticles.map((article) => (
            <GridCard
              key={article.id}
              as="li"
              className="col-span-2 md:col-span-2"
            >
              <ArticleCard article={article} variant="grid" />
            </GridCard>
          ))}
        </CardGrid>
        <SectionDivider />
      </PageSectionContent>
    </PageSection>
  )}
</PageContainer>
```

### Example: Category/Profile Page Header with Badge

```tsx
<PageHeader className="py-4">
  <div className="flex flex-wrap items-center gap-3">
    <PageTitle>{profile.title}</PageTitle>
    {profile.shape && (
      <Badge variant="outline" className="text-xs">
        {i18n.pages.profile.shapes[profile.shape]}
      </Badge>
    )}
  </div>
  {totalDocs > 0 && (
    <PageDescription>
      {totalDocs} article{totalDocs > 1 ? "s" : ""}
    </PageDescription>
  )}
</PageHeader>
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
- [ ] No inline `style` prop (use `cn()` with Tailwind classes)

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
- [ ] Empty states use `Empty` component **with clear action button**
- [ ] Detail pages have breadcrumb navigation (not just back button)
- [ ] Detail pages consider related content section
- [ ] Category pages show relevant badges (e.g., profile shape)
- [ ] Filter components have `aria-label` attributes
- [ ] CardGrid sections wrapped with `SectionDivider` for consistency

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

### 7. Using inline `style` prop

**The `style` prop is strictly forbidden.** Always use Tailwind classes with `cn()` for dynamic properties.

```tsx
// Bad - inline style
<div style={{ marginTop: spacing }}>
<div style={{ borderRightWidth: "1px" }}>
<div style={{ "--x": x, "--y": y }}>

// Good - use cn() with conditional classes
<div className={cn("mt-4", isLarge && "mt-8")}>
<div className={cn("border-l", isLast && "border-r")}>

// Good - use Tailwind arbitrary values if needed
<div className="mt-[var(--spacing)]">
```

**Why:** Tailwind classes are optimized, tree-shaken, and maintain design system consistency. Inline styles bypass the design system and can't be purged.

**Exception:** Only use `style` when a CSS property has no Tailwind equivalent AND cannot be expressed with arbitrary values (extremely rare).

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

### Articles (`articles.*`)

```ts
articles: {
  // ... existing keys
  related: "Similar keysets",  // For related content sections
}
```

### Pages (`pages.*`)

```ts
pages: {
  suggest: {
    // ... existing keys
    comingSoon: "Coming soon",
    comingSoonDescription: "The suggestion form will be available soon...",
    browseExisting: "Browse keysets",
  },
  profile: {
    // ... existing keys
    shapes: {
      sculpted: "Sculpted",
      uniform: "Uniform",
    },
  },
}
```

---

## Forms & Inputs

### Input Behavior

- **Hydration-safe**: Inputs must not lose focus or value during hydration
- **Never block paste**: All inputs and textareas must allow paste
- **Accept free text**: Validate after input, don't block typing
- **Trim values**: Handle trailing spaces from text expansion

### Submit Behavior

- **Enter submits**: Enter key submits focused input
- **Textarea exception**: Use Cmd/Ctrl+Enter to submit in textareas
- **Loading state**: Keep original label + show spinner, then disable
- **Enable until request**: Submit button stays enabled until request starts

### Validation

- **Inline errors**: Display errors next to the field that caused them
- **Focus first error**: On submit with errors, focus the first invalid field
- **Allow incomplete submit**: Let users submit to surface all validation errors

### Autocomplete & Input Types

```tsx
// Always set meaningful autocomplete and name attributes
<input
  type="email"
  name="email"
  autoComplete="email"
  inputMode="email"
  spellCheck={false}  // Disable for emails, codes, usernames
/>

// Use correct inputMode for mobile keyboards
<input type="text" inputMode="numeric" />  // Numbers only
<input type="text" inputMode="tel" />      // Phone number
<input type="text" inputMode="url" />      // URL input
```

### Password & 2FA

- Compatible with password managers
- Allow pasting codes (never block paste)
- Support browser autofill

### Unsaved Changes

- Warn users before navigation when form has unsaved changes
- Use `beforeunload` event or router guards

### Form & Action Button Styling

**MANDATORY:** All primary action buttons (form submit, CTA buttons, card action buttons) must use the brutalist button style:

```tsx
<Button size="lg" className="font-mono font-semibold tracking-tight uppercase">
  Submit
</Button>
```

**Required classes:**

- `font-mono` - Geist Mono font
- `font-semibold` - Bold weight
- `tracking-tight` - Tight letter spacing
- `uppercase` - All caps text

**Reference:** See `article-card.tsx` for canonical implementation of action buttons.

---

## URL State Management

### State Reflection

The URL must reflect application state for:

- Filters and search queries
- Pagination (current page)
- Tab selection
- Expanded/collapsed panels
- Sort order

```tsx
// Example: Filters in URL search params
// URL: /profile/cherry?status=in_stock&page=2
const search = Route.useSearch(); // { status: "in_stock", page: 2 }
```

### Back/Forward Navigation

- Back/Forward buttons must restore previous state
- Scroll position should be restored
- TanStack Router handles this automatically with `staleTime` and `gcTime`

### Link Behavior

- **Use `<Link>` or `<a>`** for navigation (supports Cmd/Ctrl+click, middle-click)
- **Never use `<div onClick>`** for navigation

---

## Content Handling

### Text Truncation

```tsx
// Single line truncation
<p className="truncate">Long text that will be cut off...</p>

// Multi-line truncation
<p className="line-clamp-2">Long text that spans multiple lines...</p>

// Allow wrapping for long words
<p className="break-words">Superlongwordthatneedstowrap</p>

// Flex children need min-w-0 to allow truncation
<div className="flex">
  <span className="min-w-0 truncate">Truncatable flex child</span>
</div>
```

### Empty States

- Always design empty states (no data, no results)
- Provide a clear next action (e.g., "Add your first item")
- Use the `Empty` component with icon, title, description, and action

### User-Generated Content

- Handle short, average, and very long content
- Test with edge cases (empty strings, single characters, paragraphs)
- Use `max-w-prose` or explicit max-widths for readability

### Numbers & Dates

```tsx
// Always use tabular-nums for number columns
<td className="tabular-nums">1,234.56</td>;

// Use Intl for locale-aware formatting
const formatter = new Intl.NumberFormat("fr-FR");
const dateFormatter = new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" });

// Use <time> element for dates
<time dateTime={article.startDate}>{formatDate(article.startDate)}</time>;
```

### Non-Breaking Spaces

Use `&nbsp;` to prevent awkward line breaks:

```tsx
// Units
<span>10&nbsp;MB</span>
<span>5&nbsp;kg</span>

// Keyboard shortcuts
<span>Cmd&nbsp;K</span>

// Brand names
<span>Azertykeycaps&nbsp;FR</span>
```

---

## Dark Mode

### Required Setup

```tsx
// In __root.tsx or HTML template
<html className={isDark ? 'dark' : ''}>
```

The `.dark` class triggers CSS custom property overrides defined in `index.css`.

### Color Scheme Declaration

```css
.dark {
  color-scheme: dark;
}
```

This tells the browser to use dark mode for native controls (scrollbars, form elements).

### Theme Color Meta Tag

```tsx
// Match theme-color to page background
<meta name="theme-color" content={isDark ? "#1a1a1a" : "#ffffff"} />
```

### Native Select Fix (Windows)

Native `<select>` elements on Windows need explicit colors:

```css
select {
  background-color: var(--background);
  color: var(--foreground);
}
```

---

## Hydration Safety

### Controlled Inputs

```tsx
// Wrong - will lose value on hydration
<input value={value} />

// Correct - controlled with onChange
<input value={value} onChange={(e) => setValue(e.target.value)} />

// Correct - uncontrolled with defaultValue
<input defaultValue={initialValue} />
```

### Date/Time Rendering

Guard against hydration mismatch for dates (server vs client timezone):

```tsx
// Use suppressHydrationWarning for dynamic dates
<time suppressHydrationWarning>{new Date().toLocaleDateString()}</time>;

// Or render only on client
const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);
if (!mounted) return <Skeleton />;
return <time>{formatDate(date)}</time>;
```

---

## Performance

### Re-render Tracking

- Use React DevTools Profiler to track re-renders
- Use React Scan for visual re-render indicators
- Minimize controlled inputs; prefer uncontrolled when possible

### Virtualization

Lists with >50 items should be virtualized:

```tsx
import { useVirtualizer } from "@tanstack/react-virtual";

// Virtual list for large datasets
const virtualizer = useVirtualizer({
  count: items.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 80,
});
```

### Image Optimization

```tsx
// Preload above-fold images
<img loading="eager" fetchPriority="high" />

// Lazy-load below-fold images
<img loading="lazy" decoding="async" />

// Always set dimensions to prevent CLS
<img width={768} height={432} />
```

### Preconnect & Preload

```html
<!-- Preconnect to CDN domains -->
<link rel="preconnect" href="https://images.azertykeycaps.fr" />

<!-- Preload critical fonts -->
<link
  rel="preload"
  href="/fonts/space-mono.woff2"
  as="font"
  type="font/woff2"
  crossorigin
/>
```

### Mutation Performance

- Target <500ms for POST/PATCH/DELETE operations
- Show optimistic UI for instant feedback
- Reconcile with server response

---

## Grid Lines

### Visual Grid System

The site uses a responsive visual grid overlay for design consistency:

```tsx
// GridLines component renders full-height vertical lines
<GridLines />

// Responsive columns:
// - Mobile: 2 columns (3 vertical lines)
// - Desktop (md+): 8 columns (9 vertical lines)
// Lines align with max-w-7xl container (1280px)
// Uses var(--color-border) at opacity-30 for subtle effect
```

### Grid Alignment

- All content containers use `max-w-7xl` (1280px)
- Header and footer match this width
- Grid lines span full viewport height
- Lines are decorative (`aria-hidden="true"`, `pointer-events-none`)
- Mobile-ready: same padding as content containers (`px-4 sm:px-6 lg:px-8`)

**Important:** GridLines uses **media queries** (`md:`), not container queries (`@md:`), because it's a fixed-position element that needs to respond to viewport width.

### Content Grid Patterns (CardGrid)

The `CardGrid` component uses a responsive 2/8 column system:

| Breakpoint    | Grid Columns | Typical Card Span                                    |
| ------------- | ------------ | ---------------------------------------------------- |
| Mobile        | 2 columns    | `col-span-2` (full width)                            |
| Desktop (md+) | 8 columns    | `col-span-2` (1/4 width) or `col-span-4` (1/2 width) |

```tsx
// CardGrid with responsive columns (no columns prop needed)
<CardGrid as="ul">
  {/* Article cards: span 2 of 8 columns on desktop (1/4 width) */}
  <GridCard as="li" className="col-span-2 md:col-span-2">
    <ArticleCard article={article} variant="grid" />
  </GridCard>

  {/* Featured cards: span 4 of 8 columns on desktop (1/2 width) */}
  <GridCard as="li" className="col-span-2 md:col-span-4">
    <FeaturedCard item={item} />
  </GridCard>
</CardGrid>
```

### SectionDivider

Full-width horizontal lines that extend beyond the container:

```tsx
import { SectionDivider } from "@/components/ui/section-divider";

// Wrap content sections with dividers
<SectionDivider />
<CardGrid>...</CardGrid>
<SectionDivider />
```

The divider spans 100vw using the `left-1/2 -ml-[50vw]` technique and uses `opacity-30` to match grid line subtlety.

---

## Additional Documentation

| Document                               | Description                                    |
| -------------------------------------- | ---------------------------------------------- |
| [Z-Index Scale](./Z_INDEX.md)          | Fixed z-index tokens and layering rules        |
| [Animation Guidelines](./ANIMATION.md) | Transition and animation best practices        |
| [Component Reference](./COMPONENTS.md) | Detailed component variants, states, and sizes |
| [AGENTS.md](../../apps/web/AGENTS.md)  | Web Interface Guidelines for AI agents         |

---

## Version History

| Version | Date       | Changes                                                                                                                                                                            |
| ------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1.7     | 2026-02-03 | Added form action button styling rule (font-mono font-semibold tracking-tight uppercase), toast font styling rule (mono title, sans description)                                   |
| 1.6     | 2026-01-25 | PayloadCMS-style grid: integrated borders on CardGrid/GridCard, bg-accent hover, grayscale image hover. Removed DitherShader for performance.                                      |
| 1.5     | 2026-01-25 | Added breadcrumb navigation pattern, related content sections, filter accessibility (aria-labels), empty state action requirement, profile shape badges, Badge render prop pattern |
| 1.4     | 2026-01-19 | Changed grid system from 6 to 8 columns on desktop                                                                                                                                 |
| 1.3     | 2026-01-19 | Updated container to max-w-7xl (1280px), responsive 2/6 column grid system, SectionDivider component, Geist Mono for headings/badges/nav                                           |
| 1.2     | 2026-01-18 | Added forms, URL state, content handling, dark mode, hydration, performance, grid lines sections. Unified container to max-w-6xl                                                   |
| 1.1     | 2026-01-18 | Added semantic HTML props (CardTitle as, EmptyTitle as), oklch semantic colors, accessibility improvements, animation guidelines                                                   |
| 1.0     | 2026-01-16 | Initial design system documentation                                                                                                                                                |
