/**
 * Format date string to French locale
 * @param dateString - ISO date string from CMS
 * @returns Formatted date (e.g., "15 janvier 2026")
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}
