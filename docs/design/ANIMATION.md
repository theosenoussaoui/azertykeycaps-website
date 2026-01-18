# Animation Guidelines

> **Animations must be intentional, performant, and accessible.**

## Rules

1. **Never add animation unless explicitly requested**
2. **Animate only compositor-friendly properties**: `transform`, `opacity`
3. **Never exceed 200ms** for interaction feedback
4. **Respect `prefers-reduced-motion`** (handled globally in index.css)
5. **Never use `transition: all`** - list properties explicitly

---

## Allowed Properties

### Compositor Properties (Preferred)

These properties can be animated without triggering layout or paint:

| Property    | Use Case                 |
| ----------- | ------------------------ |
| `transform` | Scale, rotate, translate |
| `opacity`   | Fade in/out              |

### Layout Properties (Avoid When Possible)

These trigger layout recalculations. Use sparingly:

| Property            | When Acceptable              |
| ------------------- | ---------------------------- |
| `width`, `height`   | Progress bars, accordions    |
| `padding`, `margin` | Expanding/collapsing content |

---

## Duration Guidelines

| Type            | Duration | Use Case                        |
| --------------- | -------- | ------------------------------- |
| Hover/Focus     | 150ms    | Button hover, link hover        |
| Feedback        | 200ms    | Click feedback, toggle state    |
| Enter/Exit      | 200ms    | Modal open/close, dropdown      |
| Expand/Collapse | 200ms    | Accordion, collapsible          |
| Progress        | 500ms    | Progress bar, loading indicator |

---

## Easing Functions

| Easing        | When to Use                    |
| ------------- | ------------------------------ |
| `ease-out`    | Entrances (elements appearing) |
| `ease-in`     | Exits (elements disappearing)  |
| `ease-in-out` | State changes, transforms      |
| `linear`      | Progress indicators, loading   |

---

## Transition Patterns

### Correct

```tsx
// Backdrop - only opacity changes
"transition-opacity duration-200";

// Modal popup - scale, opacity, translate
"transition-[scale,opacity,translate] duration-200";

// Progress bar - width changes
"transition-[width] duration-500";

// Button hover - background and shadow
"transition-shadow"; // shadow changes are cheap
```

### Incorrect

```tsx
// Never use transition-all
"transition-all duration-200"; // BAD

// Never animate layout properties unnecessarily
"transition-[height,width,padding]"; // BAD (if avoidable)
```

---

## Entrance Animations (tw-animate-css)

Use `tw-animate-css` classes for entrance animations:

```tsx
// Fade in
"animate-in fade-in-0";

// Slide in
"animate-in slide-in-from-top-2";
"animate-in slide-in-from-bottom-2";
"animate-in slide-in-from-left-2";
"animate-in slide-in-from-right-2";

// Zoom in
"animate-in zoom-in-95";

// Combined
"animate-in fade-in-0 zoom-in-95 slide-in-from-top-2";
```

Exit animations:

```tsx
"animate-out fade-out-0";
"animate-out zoom-out-95";
```

---

## Reduced Motion

The design system globally respects `prefers-reduced-motion` in `index.css`:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

For critical animations that should still work (like progress indicators), use:

```tsx
"motion-safe:transition-[width]";
```

---

## JavaScript Animations

When CSS transitions aren't sufficient, use `motion/react` (formerly Framer Motion):

```tsx
import { motion } from "motion/react";

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.2 }}
>
  Content
</motion.div>;
```

### When to Use motion/react

- Complex choreographed animations
- Gesture-based interactions (drag, pan)
- Spring physics
- Layout animations (shared element transitions)
- Staggered children animations

### When NOT to Use motion/react

- Simple hover/focus states (use CSS)
- Opacity/transform transitions (use CSS)
- Entrance animations (use tw-animate-css)

---

## Anti-Patterns

| Pattern                            | Problem                        | Solution                      |
| ---------------------------------- | ------------------------------ | ----------------------------- |
| `transition: all`                  | Animates unintended properties | List specific properties      |
| Animating `width`/`height`         | Causes layout thrash           | Use `transform: scale()`      |
| Animating `top`/`left`             | Causes layout thrash           | Use `transform: translate()`  |
| Animation > 300ms                  | Feels sluggish                 | Keep under 200ms for feedback |
| `will-change` on static elements   | Wastes GPU memory              | Only during active animation  |
| Large `backdrop-filter` animations | Performance killer             | Avoid or use sparingly        |
