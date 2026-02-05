# Suggestions Feature

Community-driven keyset suggestion system allowing users to propose new keysets or request changes to existing ones.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Data Flow](#data-flow)
- [Components](#components)
- [API Layer](#api-layer)
- [Form Validation](#form-validation)
- [Edit Mode](#edit-mode)
- [Styling Patterns](#styling-patterns)
- [Future Enhancements](#future-enhancements)

---

## Overview

The suggestions feature provides a form at `/suggest` where users can:

1. **Suggest a new keyset** - Submit details about a keyset not yet in the directory
2. **Request changes to existing keysets** - When accessed via `/suggest?slug=<article-slug>`, the form prefills with existing article data

The form is gated by a CMS toggle (`formEnabled` in the Suggest global) allowing admins to enable/disable submissions.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  apps/cms/                                                   │
│  └─ globals/Suggest.ts                                      │
│     ├─ title, description (page content)                    │
│     ├─ formEnabled (boolean toggle)                         │
│     └─ meta (SEO fields)                                    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  packages/schemas/                                           │
│  └─ suggestions.ts                                          │
│     ├─ suggestionInputSchema (API input)                    │
│     ├─ suggestionFormSchema (form validation)               │
│     └─ suggestionResponseSchema (API response)              │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  packages/api/                                               │
│  └─ routers/suggestions.ts                                  │
│     └─ submit mutation (processes submissions)              │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  apps/web/                                                   │
│  └─ features/suggestions/                                   │
│     ├─ api/                                                 │
│     │   ├─ submit-suggestion.ts (server function)           │
│     │   └─ get-profiles-for-form.ts (fetch profiles)        │
│     └─ components/                                          │
│         └─ suggestion-form.tsx (TanStack Form)              │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│  apps/web/                                                   │
│  └─ routes/_app/suggest.tsx                                 │
│     ├─ validateSearch (zod schema for ?slug param)          │
│     ├─ loaderDeps (extract search params)                   │
│     ├─ loader (fetch CMS content, profiles, article)        │
│     └─ component (render form or "coming soon")             │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### New Suggestion Flow

```
User visits /suggest
       ↓
Route loader fetches:
  - Suggest global (CMS page content)
  - KeycapProfiles list (for select dropdown)
  - i18n translations
       ↓
If formEnabled:
  - Render SuggestionForm with empty defaults
  - User fills form
  - TanStack Form validates with Zod
  - Submit via server function → tRPC mutation
  - Toast feedback (success/error)
Else:
  - Render "Coming soon" empty state
```

### Edit Suggestion Flow

```
User clicks "Suggest a change" on article page
       ↓
Navigates to /suggest?slug=gmk-dracula
       ↓
Route loader fetches:
  - Suggest global
  - KeycapProfiles list
  - Article by slug (for prefilling)
  - i18n translations
       ↓
SuggestionForm renders with:
  - editingArticle prop populated
  - Form fields prefilled with article data
  - Info banner showing "Editing: GMK Dracula"
       ↓
User modifies fields and submits
  - type: "edit" (vs "new")
  - editingSlug: "gmk-dracula"
```

---

## Components

### Route: `suggest.tsx`

```typescript
// Search params validation
const searchSchema = z.object({
  slug: z.string().optional(),
});

// Extract search params for loader
loaderDeps: ({ search }) => ({ slug: search.slug }),

// Fetch data based on params
loader: async ({ deps }) => {
  const [content, profiles, articleToEdit, i18n] = await Promise.all([
    getSuggestContent(),
    getProfilesForForm(),
    deps.slug ? getArticleBySlug({ data: { slug: deps.slug } }) : null,
    t(),
  ]);
  return { content, profiles, articleToEdit, i18n, locale: defaultLocale };
},

// Pass locale to form
<SuggestionForm
  profiles={profiles}
  editingArticle={articleToEdit}
  i18n={i18n}
  locale={locale}
/>
```

### Component: `SuggestionForm`

Props:

- `profiles: KeycapProfileRef[]` - List of profiles for select
- `editingArticle?: Article | null` - Article data for edit mode
- `i18n: I18n` - Translations object
- `locale?: "fr" | "en"` - Locale for date formatting (defaults to "fr")

Features:

- TanStack Form with Zod validation (`validators.onSubmit`)
- Prefills form when `editingArticle` is provided
- **Always resets to empty values on successful submit** (even in edit mode)
- Focuses first invalid field on submit error
- Toast notifications with proper font styling (no icons, colors only)
- 2-column responsive grid layout
- Localized date pickers (month names in correct language)

---

## API Layer

### Schema: `packages/schemas/src/suggestions.ts`

The schema provides both a static schema (for API validation) and a factory function (for translated client-side validation):

```typescript
// Translation interface for form validation errors
export interface SuggestionFormTranslations {
  required: string;
  invalidUrl: string;
  invalidEmail: string;
}

// Factory function - creates schema with translated error messages
export const createSuggestionFormSchema = (t: SuggestionFormTranslations) =>
  z.object({
    title: z.string().min(1, t.required),
    url: z.url(t.invalidUrl),
    profileId: z.string().min(1, t.required),
    email: z.email(t.invalidEmail),
    description: z.string().optional(),
    material: articleMaterialSchema.optional(),
    status: articleStatusSchema.optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    additionalUrl: z.url(t.invalidUrl).optional().or(z.literal("")),
    warningText: z.string().optional(),
  });

// Static schema - used for API input validation (no translated messages)
export const suggestionInputSchema = z.object({
  type: z.enum(["new", "edit"]),
  editingSlug: z.string().optional(),
  title: z.string().min(1),
  url: z.url(),
  // ... other fields
});
```

### Router: `packages/api/src/routers/suggestions.ts`

```typescript
export const suggestionsRouter = router({
  submit: publicProcedure
    .input(suggestionInputSchema)
    .output(suggestionResponseSchema)
    .mutation(async ({ input }) => {
      // Log submission (email integration TODO)
      console.log("Suggestion received:", input);
      return { success: true };
    }),
});
```

### Server Function: `apps/web/src/features/suggestions/api/submit-suggestion.ts`

```typescript
export const submitSuggestion = createServerFn({ method: "POST" })
  .validator(suggestionInputSchema)
  .handler(async ({ data }) => {
    return await serverTRPCClient.suggestions.submit.mutate(data);
  });
```

---

## Form Validation

| Field         | Validation                  | Required | Error Message Key |
| ------------- | --------------------------- | -------- | ----------------- |
| title         | `z.string().min(1)`         | Yes      | `required`        |
| url           | `z.url()`                   | Yes      | `invalidUrl`      |
| profileId     | `z.string().min(1)`         | Yes      | `required`        |
| email         | `z.email()`                 | Yes      | `invalidEmail`    |
| description   | `z.string()`                | No       | -                 |
| material      | `articleMaterialSchema`     | No       | -                 |
| status        | `articleStatusSchema`       | No       | -                 |
| startDate     | `z.string()` (ISO date)     | No       | -                 |
| endDate       | `z.string()` (ISO date)     | No       | -                 |
| additionalUrl | `z.url().or(z.literal(""))` | No       | `invalidUrl`      |
| warningText   | `z.string()`                | No       | -                 |

### Translated Validation Errors

The form uses `createSuggestionFormSchema()` factory with i18n translations:

```typescript
// In suggestion-form.tsx
validators: {
  onSubmit: createSuggestionFormSchema(i18n.pages.suggest.form.validation),
}

// i18n translations (fr.ts / en.ts)
validation: {
  required: "Ce champ est requis",      // "This field is required"
  invalidUrl: "URL invalide",           // "Invalid URL"
  invalidEmail: "Email invalide",       // "Invalid email"
}
```

---

## Edit Mode

### Entry Point

Article pages include a "Suggest a change" button:

```typescript
// apps/web/src/features/articles/components/article-content.tsx
<Button
  variant="ghost"
  render={<Link to="/suggest" search={{ slug: article.slug }} />}
>
  <PencilIcon />
  {i18n.articles.suggestChange}
</Button>
```

### Prefilling Logic

```typescript
const defaultValues: SuggestionFormData = editingArticle
  ? {
      title: editingArticle.title,
      url: editingArticle.url,
      profileId: editingArticle.profile?.id ?? "",
      email: "", // Always empty - user must provide
      description: editingArticle.description ?? "",
      material: editingArticle.material ?? undefined,
      status: editingArticle.status,
      startDate: editingArticle.startDate ?? "",
      endDate: editingArticle.endDate ?? "",
      additionalUrl: editingArticle.additionalUrl ?? "",
      warningText: editingArticle.warningText ?? "",
    }
  : {
      /* empty defaults */
    };
```

### Form Reset Behavior

On successful submission, the form **always resets to empty values** (not the prefilled defaults):

```typescript
// Empty values constant
const emptyFormValues: SuggestionFormData = {
  title: "",
  url: "",
  profileId: "",
  email: "",
  // ... all fields empty
};

// On success, reset to empty (not defaultValues)
if (result.success) {
  toast.success(...);
  form.reset(emptyFormValues);
}
```

This ensures users can submit multiple suggestions without stale data, even in edit mode.

---

## Styling Patterns

### Page Layout

The form uses the same grid-based layout as article detail pages:

```tsx
// suggest.tsx
<PageHeader className="min-h-0 py-8 @sm:py-10 @md:py-12">
  {/* Reduced spacing vs default PageHeader */}
</PageHeader>

<CardGrid>
  <GridCard className="col-span-2 md:col-span-3">
    <SuggestionForm />
  </GridCard>
</CardGrid>
```

- Uses `CardGrid` with 8-column desktop grid
- Form spans 3 columns (`md:col-span-3`)
- Reduced `PageHeader` spacing (no `min-h-[30vh]`)

### Form Layout

- **Grid:** 2 columns on desktop (`@md:grid-cols-2`), 1 column on mobile
- **Card:** Transparent background, no border, no title (relies on `GridCard` hover)
- **Padding:** Consistent `p-4`
- **Gap:** `gap-4`

### Labels

```tsx
<Label className="text-xs font-mono font-semibold uppercase">{label}</Label>
```

### Submit Button

```tsx
<Button
  type="submit"
  size="lg"
  className="w-full font-mono font-semibold tracking-tight uppercase @md:col-span-2"
>
  {label}
</Button>
```

### Form Field Spacing

All form inputs use `my-3` for consistent vertical spacing:

```tsx
<Input className="my-3" />
<SelectTrigger className="my-3" />
<DatePicker className="my-3" locale={locale} />
<Textarea className="my-3" />
```

This ensures spacing remains consistent even when validation errors appear below fields.

### Toast Notifications

Toasts use colors only (no icons) with font styling:

```tsx
toast.success(title, {
  description: message,
  classNames: {
    title: "font-mono",
    description: "font-sans",
  },
});
```

Icons are disabled globally in `components/ui/sonner.tsx`:

```tsx
icons={{
  success: null,
  info: null,
  warning: null,
  error: null,
  loading: <Loader2Icon className="size-4 animate-spin" />,
}}
```

### Select Value Display

Select components display human-readable labels instead of IDs/slugs:

```typescript
const getProfileLabel = (id: string) =>
  profiles.find((p) => p.id === id)?.title ?? "";

<SelectValue placeholder={placeholder}>
  {selectedLabel}
</SelectValue>
```

### DatePicker Localization

DatePicker supports locale for proper month/day formatting:

```tsx
// DatePicker accepts locale prop
<DatePicker locale={locale} /> // "fr" | "en"

// Internally maps to date-fns locales
const localeMap = { fr, en: enUS } as const;

// Used for both display format and Calendar month names
format(value, "PPP", { locale: dateLocale })
<Calendar locale={dateLocale} />
```

The locale is passed from the route loader through the form component.

---

## Future Enhancements

### Email Notifications

The tRPC mutation currently logs submissions. Future implementation should:

1. Send confirmation email to submitter
2. Send notification to admin(s)
3. Consider rate limiting to prevent spam

### Submission Dashboard

Admin interface in CMS to:

- Review pending suggestions
- Approve/reject with feedback
- Bulk actions for common operations

### Spam Prevention

- Honeypot fields
- Rate limiting per IP/email
- CAPTCHA integration (if needed)

---

## Related Files

| File                                         | Purpose                        |
| -------------------------------------------- | ------------------------------ |
| `apps/cms/src/globals/Suggest.ts`            | CMS global configuration       |
| `packages/schemas/src/suggestions.ts`        | Zod schemas, types, factory    |
| `packages/api/src/routers/suggestions.ts`    | tRPC router                    |
| `apps/web/src/routes/_app/suggest.tsx`       | Route configuration            |
| `apps/web/src/features/suggestions/`         | Feature components and API     |
| `apps/web/src/components/ui/date-picker.tsx` | DatePicker with locale support |
| `apps/web/src/components/ui/calendar.tsx`    | Calendar component             |
| `apps/web/src/components/ui/sonner.tsx`      | Toast configuration (no icons) |
| `apps/web/src/i18n/fr.ts`                    | French translations            |
| `apps/web/src/i18n/en.ts`                    | English translations           |
