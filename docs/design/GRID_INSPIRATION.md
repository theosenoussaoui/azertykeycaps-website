# Grid System Inspiration

> Notes from Rauno Freiberg's article on Vercel's 2023 homepage redesign.
> Source: https://rauno.me/craft/vercel

---

## Design Philosophy

The Vercel homepage design was guided by:

1. **Performance** - Fast initial paint, no client-side dependencies for core visuals
2. **Constraint in visual flair** - If an animation didn't perform well, felt pompous, or out of rhythm, it wasn't built
3. **Bridging pages aesthetically** - Consistent grid position across pages

### Key Insight

> "What elements of an interface are largely universally experienced? The page speed, legible typography, information honesty, layout stability and scannability, accessible focus states, auditory feedback, and sensible DOM ordering."

---

## Grid System Architecture

### Purpose

The grid serves multiple purposes:

1. **Visual consistency** - Same grid position across all pages as user navigates
2. **Performance indicator** - Highlights how quickly content swaps, emphasizing server rendering speed
3. **Layout shift prevention** - Lessens the appearance of pseudo "layout shift" between views
4. **Content guide** - Acts as content guides for the rest of the page
5. **Readable line-length** - At 1080px wide, each column of 360px has readable line-length for 14-16px text

### Implementation with `display: contents`

The key CSS trick for drawing grid lines without filling every cell:

```css
.grid {
  display: grid;
  grid-template-columns: repeat(var(--columns), 1fr);
  grid-template-rows: repeat(var(--rows), 1fr);
  border: 2px solid #666;
  border-right: none;
  border-bottom: none;
  position: relative;
}

.grid-guides {
  display: contents; /* Children appear as direct children of parent */
}

.grid-guide {
  inset: 0px;
  position: absolute;
  grid-column-start: var(--x);
  grid-column-end: span 1;
  grid-row-start: var(--y);
  grid-row-end: span 1;
  border: 2px solid #666;
  border-left: none;
  border-top: none;
}
```

### React Grid Component Pattern

```tsx
interface GridProps {
  rows: number;
  columns: number;
  children: ReactElement<GridCellProps>[];
}

function Grid({ rows, columns, children }: GridProps) {
  return (
    <div className="grid" style={{ "--rows": rows, "--columns": columns }}>
      <div className="grid-guides">
        {Array.from({ length: rows * columns }, (_, index) => {
          const x = (index % columns) + 1;
          const y = Math.floor(index / columns) + 1;
          return <div className="grid-guide" style={{ "--x": x, "--y": y }} />;
        })}
      </div>
      {children}
    </div>
  );
}
```

### Grid Cell Component

```tsx
interface CellProps {
  row: number | "auto";
  column: number | "auto";
  children: ReactNode;
}

function Cell({ row, column, children }: CellProps) {
  return (
    <div className="grid-cell" style={{ gridRow: row, gridColumn: column }}>
      {children}
    </div>
  );
}
```

### Cross Marks (Print Center Marks)

Crosshairs inspired by traditional print center marks can be placed at grid intersections:

```tsx
<Grid rows={4} columns={4}>
  <Grid.Cross column={1} row={1} />
  <Grid.Cross column={-1} row={-1} />
</Grid>
```

---

## Visual Rhythm

### Animation Distribution

Map of motion novelty across the page:

- **High novelty (orange)** - Graph tooltip animating long distance, icons pixelating on hover
- **Low novelty (blue)** - Floating cursors, scaling icons on hover

**Rule:** High novelty animations never appear consecutively between sections, but may be paired with lower novelty animations.

---

## Hero Composition (Layer Stacking)

The hero is composed of multiple stacked layers (no client-side canvas for initial paint):

1. Heading (top)
2. SVG triangle
3. CSS grid lines
4. SVG rays
5. CSS rainbow gradient
6. GLSL shader (bottom, progressively enhanced)

### Benefits

- Fast initial paint (no `<canvas>` blocking render)
- Progressive enhancement (shader fades in after load)
- Code splitting (shader loaded async)
- Hardware detection (skip shader on low-powered devices)

---

## Responsive Design with Container Queries

```css
.root {
  container-type: inline-size;
}

@container (max-width: 560px) {
  .scope {
    display: none;
  }
}
```

### Benefits

- Truly independently dynamic widgets
- Not relying on window width
- Predictable display in any container

---

## CSS Offset Path for Animations

Animate elements along a path using `offset-path`:

```css
.ring {
  width: 200px;
  height: 200px;
  border: 1px solid #666;
  border-radius: 50%;
}

.ring .ball {
  width: 24px;
  height: 24px;
  background: dodgerblue;
  border-radius: 50%;
  offset-path: content-box; /* Uses parent as trajectory, respects radius */
  offset-distance: 0%;
  position: absolute;
  animation: animate 5s linear infinite;
}

@keyframes animate {
  to {
    offset-distance: 100%;
  }
}
```

---

## Reduced Motion

### Pause Looping Animations

```css
@media (prefers-reduced-motion: reduce) {
  .cursor,
  .caret {
    animation-play-state: paused; /* Graceful pause, not abrupt interruption */
  }

  .caret {
    opacity: 1 !important; /* Ensure caret doesn't pause while invisible */
  }
}
```

---

## Accessibility Patterns

### Visuals as Images

```tsx
<div
  role="img"
  aria-label="Two abstract window frames stacked. Bottom shows Git push output, top shows preview deployment."
>
  <div aria-hidden>{/* Visual content */}</div>
</div>
```

### ARIA Live Regions for Feedback

```tsx
{
  isCopied && (
    <div role="log" aria-live="polite" className="visually-hidden">
      Copied code to clipboard
    </div>
  );
}
```

### Line Numbers (Hide from Screen Readers)

```css
.line:before {
  content: counter(line) / ""; /* Second value is alt text - empty = hidden */
}
```

---

## Key Takeaways for Azertykeycaps

1. **Grid as brand identity** - The grid lines become a signature visual element
2. **Performance first** - Core visuals should work without JS
3. **Subtle grid lines** - Use low opacity so grid doesn't compete with content
4. **Content alignment** - Cards should align to grid columns
5. **Container queries** - Use `@container` for responsive components
6. **Progressive enhancement** - Add effects (shaders, animations) after initial paint
7. **Reduced motion** - Pause, don't remove animations
8. **Accessibility** - Label visuals, hide decorative elements

---

## Implementation: Responsive Grid System

We implemented a responsive grid system with two key components:

### 1. GridLines (Visual Overlay)

Full-viewport vertical lines that respond to screen width:

```tsx
// apps/web/src/components/ui/grid-lines.tsx

<GridLines />

// Responsive columns:
// - Mobile: 2 columns (3 vertical lines)
// - Desktop (md+): 8 columns (9 vertical lines)
```

**Important:** GridLines uses **media queries** (`md:`), not container queries, because it's a fixed-position element that must respond to viewport width.

### 2. CardGrid + GridCard Pattern

Card borders become the grid lines themselves:

```tsx
// apps/web/src/components/ui/card-grid.tsx

// Container: right and bottom borders close the grid
<CardGrid as="ul">
  {/* Each card: left and top borders form the grid */}
  <GridCard as="li" className="col-span-2 md:col-span-2">
    <ArticleCard article={article} variant="grid" />
  </GridCard>
</CardGrid>
```

### How It Works

```
Mobile (2 columns):
┌─────────────┬─────────────┐
│   Card 1    │   Card 2    │
├─────────────┼─────────────┤
│   Card 3    │   Card 4    │
└─────────────┴─────────────┘

Desktop (8 columns):
┌─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┐
│  1  │  2  │  3  │  4  │  5  │  6  │  7  │  8  │
└─────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┘
```

### 3. SectionDivider

Full-width horizontal lines that extend beyond the container:

```tsx
// apps/web/src/components/ui/section-divider.tsx

<SectionDivider />
<CardGrid>...</CardGrid>
<SectionDivider />

// Uses left-1/2 -ml-[50vw] w-screen technique
// opacity-30 to match GridLines subtlety
```

### Media Queries vs Container Queries

| Component      | Query Type         | Why                                 |
| -------------- | ------------------ | ----------------------------------- |
| GridLines      | Media (`md:`)      | Fixed-position, must match viewport |
| CardGrid       | Media (`md:`)      | Must stay in sync with GridLines    |
| SectionDivider | None               | Full-width, no responsive behavior  |
| Card content   | Container (`@md:`) | Component-level responsiveness      |

### Benefits Over Overlay Grid

1. **No alignment issues** - Card edges ARE the grid lines
2. **Simpler CSS** - No z-index, no fixed positioning for cards
3. **Responsive** - 2/8 column system matches GridLines
4. **Performance** - No extra DOM elements for grid overlay
5. **Consistency** - All grid elements use the same breakpoint (`md:`)

### Usage

```tsx
import { CardGrid, GridCard } from "@/components/ui/card-grid";
import { SectionDivider } from "@/components/ui/section-divider";

<SectionDivider />
<CardGrid as="ul">
  {articles.map((article) => (
    <GridCard
      key={article.id}
      as="li"
      className="col-span-2 md:col-span-2"  // Full width mobile, 1/4 desktop
    >
      <ArticleCard article={article} variant="grid" />
    </GridCard>
  ))}
</CardGrid>
<SectionDivider />

---

## Related Documentation

- [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) - Full design system reference
- [ANIMATION.md](./ANIMATION.md) - Animation guidelines
- [Web Interface Guidelines](https://interfaces.rauno.me) - Rauno's design principles
```
