# Z-Index Scale

> **Fixed scale for layering UI elements. Never use arbitrary z-index values.**

## Scale

| Token  | Value | Use Case                                  |
| ------ | ----- | ----------------------------------------- |
| `z-0`  | 0     | Base content                              |
| `z-10` | 10    | Sticky elements, sidebar                  |
| `z-20` | 20    | Sidebar rail, floating elements           |
| `z-40` | 40    | Sticky header                             |
| `z-50` | 50    | Modals, dialogs, sheets, toasts, popovers |

---

## Rules

1. **Never use arbitrary z-index values** (`z-[999]`, `z-[100]`)
2. **Modals and overlays always use z-50**
3. **Header uses z-40** to stay below modals but above content
4. **Sidebar and sticky elements use z-10-20**

---

## Component Reference

| Component        | Z-Index | Notes                     |
| ---------------- | ------- | ------------------------- |
| `Dialog`         | z-50    | Backdrop and popup        |
| `Sheet`          | z-50    | Backdrop and popup        |
| `AlertDialog`    | z-50    | Backdrop and popup        |
| `Toast`          | z-50    | Viewport container        |
| `Popover`        | z-50    | Popup content             |
| `DropdownMenu`   | z-50    | Menu content              |
| `Select`         | z-50    | Popup content             |
| `NavigationMenu` | z-50    | Portal content            |
| `Command`        | z-50    | Dialog backdrop and popup |
| `Header`         | z-40    | Sticky header             |
| `Sidebar`        | z-10    | Fixed sidebar             |
| `SidebarRail`    | z-20    | Resize handle             |

---

## Example

```tsx
// Correct - using scale tokens
<header className="sticky top-0 z-40">

// Incorrect - arbitrary value
<header className="sticky top-0 z-[100]">
```

---

## Stacking Context

When elements create new stacking contexts, their children's z-index values are relative to that context. Key properties that create stacking contexts:

- `position: fixed` or `position: sticky`
- `transform` (any value other than none)
- `opacity` < 1
- `isolation: isolate`

Use `isolate` when you need to contain z-index within a component:

```tsx
<div className="isolate">
  {/* z-index values here won't affect outside elements */}
</div>
```
