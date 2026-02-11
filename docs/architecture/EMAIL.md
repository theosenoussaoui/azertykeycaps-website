# Email Templates

Email templates built with [React Email](https://react.email) and Tailwind CSS, exported as React components for rendering and sending via the API server.

## Package

`@azertykeycaps-app/email` (`packages/email/`)

## File Structure

```
packages/email/
├── emails/                          # Email templates (React Email dev server reads this)
│   ├── _components/                 # Shared components (prefixed _ = hidden from sidebar)
│   │   ├── layout.tsx               # Base layout: Html, Head, Body, Tailwind, Header, Footer
│   │   ├── header.tsx               # Brand header ("AZERTYKEYCAPS" + Hr separator)
│   │   └── footer.tsx               # Footer with site link
│   └── suggestion-notification.tsx  # Suggestion received notification
├── src/
│   └── index.ts                     # Re-exports template components for consumers
├── package.json
└── tsconfig.json
```

## Local Development

Start the React Email preview server:

```sh
bun dev:email
# or
turbo run dev --filter=@azertykeycaps-app/email
```

Visit [localhost:3100](http://localhost:3100) to preview emails. The dev server watches for changes and reloads automatically.

### Troubleshooting: Bun segfault

If `bun dev:email` crashes with a segfault (`SIGSEGV`), this is a known Bun bug with `node:vm` and `react-email`'s preview server ([oven-sh/bun#26540](https://github.com/oven-sh/bun/issues/26540)). Run the preview server directly with Node as a workaround:

```sh
node --experimental-vm-modules packages/email/node_modules/react-email/dist/index.js dev -p 3100 --dir packages/email/emails
```

## Available Templates

### `SuggestionNotificationEmail`

Sent to admin when a user submits a keyset suggestion.

**Props:** `Omit<SuggestionInput, "editingSlug">` (from `@azertykeycaps-app/schemas`)

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `type` | `"new" \| "edit"` | Yes | Suggestion type |
| `title` | `string` | Yes | Keyset title |
| `url` | `string` | Yes | Keyset URL |
| `profileId` | `string` | Yes | Keycap profile ID |
| `email` | `string` | Yes | Submitter email |
| `description` | `string` | No | Keyset description |
| `material` | `ArticleMaterial` | No | Material type |
| `status` | `ArticleStatus` | No | Availability status |
| `startDate` | `string` | No | GB/sale start date |
| `endDate` | `string` | No | GB/sale end date |
| `additionalUrl` | `string` | No | Extra reference URL |
| `warningText` | `string` | No | Warning note |

## Adding New Email Templates

### 1. Create the template

Create a new `.tsx` file in `emails/`:

```tsx
// emails/my-new-email.tsx
import { Heading, Section, Text } from "@react-email/components";
import * as React from "react";

import type { MyType } from "@azertykeycaps-app/schemas";

import { Layout } from "./_components/layout";

interface MyNewEmailProps {
  // Type props from schemas
}

export default function MyNewEmail(props: MyNewEmailProps) {
  return (
    <Layout preview="Preview text shown in inbox">
      <Section>
        <Heading as="h1" className="m-0 mb-2 text-xl font-bold text-foreground">
          Title
        </Heading>
        <Text className="m-0 text-sm text-muted-foreground">
          Content here
        </Text>
      </Section>
    </Layout>
  );
}

// Preview data for the dev server
MyNewEmail.PreviewProps = {
  // ...sample data
} satisfies MyNewEmailProps;
```

### 2. Export from index

Add the export to `src/index.ts`:

```ts
export { default as MyNewEmail } from "../emails/my-new-email";
```

### 3. Preview locally

Run `bun dev:email` and visit [localhost:3100](http://localhost:3100) to see your template.

## Shared Components

Shared components live in `emails/_components/` (prefixed with `_` so React Email's dev server hides them from the sidebar).

### `Layout`

Base wrapper for all emails. Provides:
- `<Html>`, `<Head>`, `<Body>` structure
- `<Preview>` text (shown in inbox before opening)
- `<Tailwind>` wrapper with brand colors and `pixelBasedPreset`
- Brand header and footer

```tsx
<Layout preview="Preview text for inbox">
  {children}
</Layout>
```

### `Header`

Renders "AZERTYKEYCAPS" in uppercase bold monospace with an `<Hr>` separator. Matches the site's brutalist brand identity.

### `Footer`

Renders an `<Hr>` separator and a link to azertykeycaps.fr.

## Tailwind Configuration

Emails use `@react-email/components`' `<Tailwind>` wrapper with custom config:

- **`pixelBasedPreset`**: Converts `rem` units to `px` (required because `rem` is not supported by many email clients)
- **Brand colors**: Approximated from the design system's oklch values to hex (email clients don't support oklch)
- **No `rounded-*`**: Sharp corners per the design system (0 border-radius)

### Available color classes

| Class | Hex | Design system equivalent |
|-------|-----|-------------------------|
| `text-foreground` / `bg-foreground` | `#0d0d0f` | `oklch(0.145 0.005 250)` |
| `text-background` / `bg-background` | `#fefefe` | `oklch(0.995 0.003 250)` |
| `text-muted-foreground` | `#6b6b73` | `oklch(0.45 0.012 250)` |
| `bg-muted` | `#f0f0f2` | `oklch(0.965 0.005 250)` |
| `border-border` | `#e0e0e5` | `oklch(0.91 0.008 250)` |
| `text-primary` / `bg-primary` | `#1a1a1e` | `oklch(0.205 0.005 250)` |

### Limitations

- **No dark mode**: Email client support for `prefers-color-scheme` is inconsistent
- **No oklch**: Must use hex color values
- **No `space-*`**: Tailwind's space utility uses complex selectors not supported in emails
- **No `prose`**: `@tailwindcss/typography` not supported
- **No hover states**: Poor email client support for `:hover`
- **No contexts inside `<Tailwind>`**: Move providers above the `<Tailwind>` wrapper

## Consuming Templates (API/Server Side)

This package **only exports template components**. Rendering to HTML and sending emails is handled by the API server.

### Install render utility in the server

The server package needs `@react-email/render` to convert templates to HTML:

```sh
# In packages/api or apps/server
bun add @react-email/render -E
```

### Render and send with Resend

```tsx
import { SuggestionNotificationEmail } from "@azertykeycaps-app/email";
import { render } from "@react-email/render";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Render template to HTML
const html = await render(
  <SuggestionNotificationEmail
    type="new"
    title="GMK Olivia"
    url="https://example.com/gmk-olivia"
    profileId="1"
    email="user@example.com"
  />
);

// Send via Resend
await resend.emails.send({
  from: "notifications@azertykeycaps.fr",
  to: "admin@azertykeycaps.fr",
  subject: "New keyset suggestion: GMK Olivia",
  html,
});
```

Alternatively, Resend can render React Email components directly:

```tsx
await resend.emails.send({
  from: "notifications@azertykeycaps.fr",
  to: "admin@azertykeycaps.fr",
  subject: "New keyset suggestion: GMK Olivia",
  react: (
    <SuggestionNotificationEmail
      type="new"
      title="GMK Olivia"
      url="https://example.com/gmk-olivia"
      profileId="1"
      email="user@example.com"
    />
  ),
});
```

### Environment variables

When integrating Resend into the API server, add `RESEND_API_KEY` to:
- `.env` files
- `docs/architecture/ENVIRONMENT_VARIABLES.md`
- `turbo.json` task `env` arrays (for tasks that send emails)

## Schema Integration

Email template props are typed using types from `@azertykeycaps-app/schemas`. This ensures compile-time safety between the data structures used across the app and the email templates.

- No runtime validation in templates - validation happens at the call site (API router)
- Import types with `import type { ... }` for tree-shaking

## Dependencies

| Package | Purpose |
|---------|---------|
| `@react-email/components` | Email-safe React components (Button, Text, Hr, Tailwind, etc.) |
| `@azertykeycaps-app/schemas` | Shared types for template props |
| `react` / `react-dom` | React runtime |
| `react-email` (dev) | CLI for local preview server |
| `typescript` (dev) | Type checking |
