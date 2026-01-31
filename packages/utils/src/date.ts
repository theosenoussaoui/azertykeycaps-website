/**
 * Format date string to French locale
 * @param dateString - ISO date string from CMS (or null/undefined)
 * @returns Formatted date (e.g., "15 janvier 2026") or null if no date
 */
export function formatDate(
  dateString: string | null | undefined,
): string | null {
  if (!dateString) return null;
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}
