import { en } from "./en";
import { fr } from "./fr";

export const translations = { fr, en } as const;

export type Locale = keyof typeof translations;

// Default to French
export const defaultLocale: Locale = "fr";

// Get translations for a locale
export function t(locale: Locale = defaultLocale) {
  return translations[locale];
}

// Re-export for convenience
export { fr, en };
