# Component Reference

> **Detailed reference for component variants, states, and usage patterns.**

---

## Button

### Size Variants

| Size      | Height          | Padding | Text                    | Icon Size             |
| --------- | --------------- | ------- | ----------------------- | --------------------- |
| `xs`      | h-7 (sm: h-6)   | px-2    | text-sm (sm: text-xs)   | size-4 (sm: size-3.5) |
| `sm`      | h-8 (sm: h-7)   | px-2.5  | text-base (sm: text-sm) | size-4.5 (sm: size-4) |
| `default` | h-9 (sm: h-8)   | px-3    | text-base (sm: text-sm) | size-4.5 (sm: size-4) |
| `lg`      | h-10 (sm: h-9)  | px-3.5  | text-base (sm: text-sm) | size-4.5 (sm: size-4) |
| `xl`      | h-11 (sm: h-10) | px-4    | text-lg (sm: text-base) | size-5 (sm: size-4.5) |

### Icon Button Sizes

| Size      | Dimensions            |
| --------- | --------------------- |
| `icon-xs` | size-7 (sm: size-6)   |
| `icon-sm` | size-8 (sm: size-7)   |
| `icon`    | size-9 (sm: size-8)   |
| `icon-lg` | size-10 (sm: size-9)  |
| `icon-xl` | size-11 (sm: size-10) |

### Variants

| Variant               | Background     | Border             | Text                        |
| --------------------- | -------------- | ------------------ | --------------------------- |
| `default`             | bg-primary     | border-primary     | text-primary-foreground     |
| `secondary`           | bg-secondary   | border-transparent | text-secondary-foreground   |
| `outline`             | bg-background  | border-input       | text-foreground             |
| `ghost`               | transparent    | border-transparent | text-foreground             |
| `destructive`         | bg-destructive | border-destructive | text-white                  |
| `destructive-outline` | bg-transparent | border-input       | text-destructive-foreground |
| `link`                | transparent    | border-transparent | text-foreground (underline) |

### Usage

```tsx
// Standard button
<Button variant="default" size="default">Click me</Button>

// Icon button (requires aria-label)
<Button variant="ghost" size="icon" aria-label="Close">
  <XIcon />
</Button>

// Button as link
<Button render={<Link to="/about" />}>About</Button>

// Button with external link
<Button render={<a href="https://example.com" target="_blank" rel="noopener noreferrer" />}>
  External
</Button>
```

---

## Badge

### Size Variants

| Size      | Height            | Min Width | Padding | Text                         |
| --------- | ----------------- | --------- | ------- | ---------------------------- |
| `sm`      | h-5 (sm: h-4)     | min-w-5   | px-1    | text-xs (sm: text-[.625rem]) |
| `default` | h-5.5 (sm: h-4.5) | min-w-5.5 | px-1    | text-sm (sm: text-xs)        |
| `lg`      | h-6.5 (sm: h-5.5) | min-w-6.5 | px-1.5  | text-base (sm: text-sm)      |

### Semantic Variants

| Variant       | Background       | Text                        | Use Case       |
| ------------- | ---------------- | --------------------------- | -------------- |
| `default`     | bg-primary       | text-primary-foreground     | Primary action |
| `secondary`   | bg-secondary     | text-secondary-foreground   | Neutral        |
| `outline`     | bg-background    | text-foreground             | Subtle         |
| `destructive` | bg-destructive   | text-white                  | Error/danger   |
| `error`       | bg-destructive/8 | text-destructive-foreground | Error state    |
| `success`     | bg-success/8     | text-success-foreground     | Success state  |
| `warning`     | bg-warning/8     | text-warning-foreground     | Warning state  |
| `info`        | bg-info/8        | text-info-foreground        | Informational  |

---

## Alert

### Variants

| Variant   | Border                | Background       | Icon Color            |
| --------- | --------------------- | ---------------- | --------------------- |
| `default` | border                | bg-transparent   | text-muted-foreground |
| `error`   | border-destructive/32 | bg-destructive/4 | text-destructive      |
| `success` | border-success/32     | bg-success/4     | text-success          |
| `warning` | border-warning/32     | bg-warning/4     | text-warning          |
| `info`    | border-info/32        | bg-info/4        | text-info             |

### Structure

```tsx
<Alert variant="error">
  <AlertCircleIcon className="size-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Something went wrong.</AlertDescription>
  <AlertAction>
    <Button size="sm">Retry</Button>
  </AlertAction>
</Alert>
```

---

## Card

### Components

| Component         | Element          | Purpose                                       |
| ----------------- | ---------------- | --------------------------------------------- |
| `Card`            | `<div>`          | Container                                     |
| `CardHeader`      | `<div>`          | Title area with grid layout                   |
| `CardTitle`       | `<h3>` (default) | Card heading - use `as` prop for other levels |
| `CardDescription` | `<div>`          | Subtitle/description                          |
| `CardAction`      | `<div>`          | Action button area (positioned top-right)     |
| `CardContent`     | `<div>`          | Main content area                             |
| `CardFooter`      | `<div>`          | Footer with actions                           |

### CardTitle Heading Levels

```tsx
<CardTitle>Default h3</CardTitle>
<CardTitle as="h2">Section heading</CardTitle>
<CardTitle as="h4">Nested card</CardTitle>
<CardTitle as="div">Non-semantic (for interactive cards)</CardTitle>
```

**Note:** `CardPanel` is exported as both `CardPanel` and `CardContent` for compatibility.

---

## Empty State

### Components

| Component          | Element          | Purpose                                  |
| ------------------ | ---------------- | ---------------------------------------- |
| `Empty`            | `<div>`          | Container with centered content          |
| `EmptyHeader`      | `<div>`          | Groups icon, title, description          |
| `EmptyMedia`       | `<div>`          | Icon or image container                  |
| `EmptyTitle`       | `<h2>` (default) | Heading - use `as` prop for other levels |
| `EmptyDescription` | `<p>`            | Explanatory text                         |
| `EmptyContent`     | `<div>`          | Action buttons                           |

### EmptyMedia Variants

| Variant   | Style                                         |
| --------- | --------------------------------------------- |
| `default` | Transparent background                        |
| `icon`    | Bordered box with shadow, stacked icon effect |

### Usage

```tsx
<Empty>
  <EmptyHeader>
    <EmptyMedia variant="icon">
      <SearchXIcon />
    </EmptyMedia>
    <EmptyTitle>No results found</EmptyTitle>
    <EmptyDescription>Try adjusting your search or filters.</EmptyDescription>
  </EmptyHeader>
  <EmptyContent>
    <Button onClick={handleClearFilters}>Clear filters</Button>
  </EmptyContent>
</Empty>
```

---

## Component State Matrix

| Component           | Hover       | Focus                    | Active         | Disabled     | Loading            |
| ------------------- | ----------- | ------------------------ | -------------- | ------------ | ------------------ |
| Button              | `bg-*/90`   | `ring-2 ring-ring`       | `inset-shadow` | `opacity-64` | spinner + disabled |
| Badge (interactive) | `bg-*/90`   | `ring-2 ring-ring`       | -              | `opacity-64` | -                  |
| Input               | -           | `border-ring ring-[3px]` | -              | `opacity-64` | -                  |
| Card (interactive)  | `shadow-lg` | -                        | -              | -            | skeleton           |
| Select              | -           | `border-ring ring-[3px]` | -              | `opacity-64` | -                  |

---

## Touch Target Requirements

All interactive elements must have minimum touch target of 44x44px on touch devices.

The design system handles this via `pointer-coarse:after:` pseudo-element:

```css
pointer-coarse:after:absolute
pointer-coarse:after:size-full
pointer-coarse:after:min-h-11
pointer-coarse:after:min-w-11
```

This is built into `Button`, `Badge` (when interactive), and other interactive components.

---

## Render Prop Pattern

Use the `render` prop for composition with TanStack Router `<Link>`:

```tsx
// Correct - uses render prop
<Button render={<Link to="/about" />}>About</Button>

// Correct - NavigationMenuLink
<NavigationMenuLink
  href="/"
  render={<Link to="/" />}
>
  Home
</NavigationMenuLink>

// Incorrect - wrapping creates nested interactive elements
<Link to="/about">
  <Button>About</Button>
</Link>
```

---

## Icon-Only Buttons

**Always add `aria-label` to icon-only buttons:**

```tsx
// Correct
<Button variant="ghost" size="icon" aria-label="Close">
  <XIcon />
</Button>

// Correct - SheetTrigger
<SheetTrigger
  render={<Button variant="ghost" size="icon" />}
  aria-label="Open menu"
>
  <MenuIcon />
</SheetTrigger>

// Incorrect - missing aria-label
<Button variant="ghost" size="icon">
  <XIcon />
</Button>
```

---

## Loading Button Pattern

When a button triggers an async action:

```tsx
<Button disabled={isPending}>
  {isPending && <Spinner className="size-4 animate-spin" />}
  {label} {/* Keep original label visible */}
</Button>
```

**Rules:**

- Show spinner alongside original label (never replace label with spinner)
- Keep button enabled until request actually starts
- Disable button only while request is in flight
- Re-enable on success or failure

---

## Input Validation Pattern

### Inline Error Display

```tsx
<Field>
  <Label>Email</Label>
  <Input
    type="email"
    aria-invalid={!!errors.email}
    aria-describedby={errors.email ? "email-error" : undefined}
  />
  {errors.email && (
    <p id="email-error" className="text-sm text-destructive">
      {errors.email.message}
    </p>
  )}
</Field>
```

### Focus First Error on Submit

```tsx
const onSubmit = async (data) => {
  const result = await validate(data);
  if (result.errors) {
    // Focus the first field with an error
    const firstErrorField = Object.keys(result.errors)[0];
    document.querySelector(`[name="${firstErrorField}"]`)?.focus();
  }
};
```

---

## Skeleton Pattern

Skeletons must mirror the final content structure to prevent layout shift:

```tsx
// Good - matches final layout
function ArticleCardSkeleton() {
  return (
    <Card className="h-full">
      <Skeleton className="aspect-video w-full" /> {/* Image */}
      <CardHeader>
        <Skeleton className="h-5 w-3/4" /> {/* Title */}
      </CardHeader>
      <CardContent>
        <Skeleton className="h-3 w-1/2" /> {/* Profile */}
      </CardContent>
      <CardFooter>
        <Skeleton className="h-5 w-20" /> {/* Badge */}
      </CardFooter>
    </Card>
  );
}

// Bad - different structure than final content
function BadSkeleton() {
  return <Skeleton className="h-80 w-full" />; // Doesn't match card structure
}
```

---

## Tooltip & Popover Delay

```tsx
// First tooltip in a group should have a delay
<Tooltip delayDuration={300}>
  <TooltipTrigger>...</TooltipTrigger>
  <TooltipContent>Help text</TooltipContent>
</Tooltip>

// Subsequent tooltips in the same group should be instant
// This is handled automatically by most tooltip libraries with "group" behavior
```

**Rules:**

- Delay first tooltip appearance (~300ms)
- Make subsequent peer tooltips instant
- Prefer inline help text over tooltips when possible

---

## Image Card Pattern

For cards with images that should be flush with the card edge:

```tsx
<Card className="h-full overflow-hidden">
  {/* Image flush with top - no padding */}
  <figure className="relative">
    <img
      src={image.url}
      alt={image.alt}
      className="aspect-video w-full object-cover"
    />
  </figure>

  {/* Content with padding */}
  <CardHeader>
    <CardTitle>{title}</CardTitle>
  </CardHeader>
  <CardContent>{content}</CardContent>
</Card>
```

**Key points:**

- Card has `overflow-hidden` to clip image corners
- `<figure>` has no padding, allowing image to touch card edges
- Content sections (`CardHeader`, `CardContent`) have their own padding (`px-6`)

---

## CardGrid Pattern (Vercel-Style)

Card borders become the grid lines themselves. No overlay needed.

### Components

| Component  | Element              | Purpose                               |
| ---------- | -------------------- | ------------------------------------- |
| `CardGrid` | `<div>`, `<ul>`, etc | Grid container with border-r border-b |
| `GridCard` | `<div>`, `<li>`, etc | Grid cell with border-l border-t      |

### How It Works

```
CardGrid: border-r border-b (closes the grid on right and bottom)
GridCard: border-l border-t (forms the grid with left and top borders)

┌─────────┬─────────┬─────────┐
│ border-l│ border-l│ border-l│  <- border-t on each GridCard
├─────────┼─────────┼─────────┤
│ GridCard│ GridCard│ GridCard│
│    1    │    2    │    3    │
└─────────┴─────────┴─────────┘
                    ↑
          CardGrid has border-r border-b
```

### Usage

```tsx
import { CardGrid, GridCard } from "@/components/ui/card-grid";
import { ArticleCard } from "@/features/articles/components/article-card";

<CardGrid as="ul" columns={6} className="@container">
  {articles.map((article) => (
    <GridCard
      key={article.id}
      as="li"
      className="col-span-6 @sm:col-span-3 @lg:col-span-2"
    >
      <ArticleCard article={article} variant="grid" />
    </GridCard>
  ))}
</CardGrid>;
```

### Grid Columns

| Columns | Classes        |
| ------- | -------------- |
| 1       | `grid-cols-1`  |
| 2       | `grid-cols-2`  |
| 3       | `grid-cols-3`  |
| 4       | `grid-cols-4`  |
| 6       | `grid-cols-6`  |
| 12      | `grid-cols-12` |

### Responsive with Container Queries

The grid uses `@container` for responsive column spans:

| Breakpoint | Width | Typical Usage |
| ---------- | ----- | ------------- |
| `@xs:`     | 384px | 2 columns     |
| `@sm:`     | 512px | 3 columns     |
| `@lg:`     | 768px | 4-6 columns   |

```tsx
<GridCard className="col-span-6 @sm:col-span-3 @lg:col-span-2">
  {/* Full width on mobile, half on @sm, third on @lg */}
</GridCard>
```

### ArticleCard Grid Variant

When using `ArticleCard` inside a `GridCard`, use `variant="grid"` to remove the card's own borders:

```tsx
// ArticleCard variant="grid" removes:
// - border (handled by GridCard)
// - shadow (no shadow in grid layout)

<ArticleCard article={article} variant="grid" />
```

### Benefits

1. **No alignment issues** - Card edges ARE the grid lines
2. **Simpler CSS** - No z-index, no fixed positioning overlay
3. **Responsive** - Works naturally with container queries
4. **Performance** - No extra DOM elements for grid overlay
