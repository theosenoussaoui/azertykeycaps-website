/**
 * SEO utility functions for generating meta tags, Open Graph, and JSON-LD structured data.
 * @see docs/SEO_LLMO.md for full documentation
 *
 * IMPORTANT: This module must work on both server and client.
 * - Server: head() function runs during SSR
 * - Client: Module is bundled but head() isn't called client-side
 *
 * We use import.meta.env.VITE_SITE_URL which Vite replaces at build time.
 */

/**
 * Get the site URL.
 * Uses import.meta.env which is replaced at build time by Vite.
 */
function getSiteUrl(): string {
  // import.meta.env.VITE_* variables are statically replaced at build time
  // This works in both SSR and client contexts
  return import.meta.env.VITE_SITE_URL || "https://azertykeycaps.fr";
}

// Site configuration with lazy evaluation
export const siteConfig = {
  name: "Azertykeycaps",
  get url() {
    return getSiteUrl();
  },
  locale: "fr_FR",
  language: "fr",
  get defaultOgImage() {
    return `${getSiteUrl()}/og.webp`;
  },
  themeColor: "#1e1e1e", // Dark mode background
  description: "Annuaire de keysets compatibles AZERTY",
};

/**
 * Generate standard meta tags including Open Graph and Twitter Card.
 * Returns an array compatible with TanStack Router's head function.
 */
export function generateMeta({
  title,
  description,
  path,
  image,
  type = "website",
  noIndex = false,
}: {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
  noIndex?: boolean;
}) {
  const fullTitle = `${title} - ${siteConfig.name}`;
  const url = `${siteConfig.url}${path}`;
  const ogImage = image || siteConfig.defaultOgImage;

  const meta = [
    { title: fullTitle },
    { name: "description", content: description },
    // Open Graph
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: ogImage },
    { property: "og:url", content: url },
    { property: "og:type", content: type },
    { property: "og:site_name", content: siteConfig.name },
    { property: "og:locale", content: siteConfig.locale },
    // Twitter Card
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: ogImage },
  ];

  if (noIndex) {
    meta.push({ name: "robots", content: "noindex, nofollow" });
  }

  return meta;
}

/**
 * Generate canonical link tag.
 * Strips query params by default (pagination should be included manually if needed).
 */
export function generateCanonical(path: string) {
  // Remove query params for canonical URL (pagination handled separately)
  const cleanPath = path.split("?")[0];
  return { rel: "canonical" as const, href: `${siteConfig.url}${cleanPath}` };
}

/**
 * Generate JSON-LD script tag for structured data.
 * Returns undefined if data is empty/invalid to avoid empty script tags.
 */
export function generateJsonLd(data: object) {
  const json = JSON.stringify(data);
  // Don't render empty or minimal JSON-LD
  if (!json || json === "{}" || json === "null") {
    return undefined;
  }
  return {
    type: "application/ld+json",
    children: JSON.stringify(data),
  };
}

/**
 * Generate WebSite JSON-LD schema (for root layout).
 */
export function generateWebSiteSchema(): object {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    inLanguage: siteConfig.language,
    publisher: generateOrganizationSchema(),
  };
}

/**
 * Generate Organization JSON-LD schema.
 */
export function generateOrganizationSchema(): object {
  return {
    "@type": "Organization",
    name: siteConfig.name,
    url: siteConfig.url,
    logo: {
      "@type": "ImageObject",
      url: `${siteConfig.url}/logo.png`,
    },
  };
}

/**
 * Generate Article JSON-LD schema.
 */
export function generateArticleSchema({
  title,
  description,
  image,
  slug,
  createdAt,
  updatedAt,
}: {
  title: string;
  description: string;
  image: string;
  slug: string;
  createdAt: string;
  updatedAt?: string;
}): object {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    image,
    url: `${siteConfig.url}/articles/${slug}`,
    datePublished: createdAt,
    dateModified: updatedAt || createdAt,
    author: generateOrganizationSchema(),
    publisher: generateOrganizationSchema(),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${siteConfig.url}/articles/${slug}`,
    },
  };
}

/**
 * Generate ItemList JSON-LD schema for list pages.
 */
export function generateItemListSchema(
  items: Array<{ slug: string; title: string }>,
): object {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${siteConfig.url}/articles/${item.slug}`,
      name: item.title,
    })),
  };
}

/**
 * Generate CollectionPage JSON-LD schema for profile/category pages.
 */
export function generateCollectionPageSchema({
  name,
  description,
  path,
  items,
}: {
  name: string;
  description: string;
  path: string;
  items: Array<{ slug: string; title: string }>;
}): object {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: `${siteConfig.url}${path}`,
    mainEntity: generateItemListSchema(items),
  };
}

/**
 * Generate WebPage JSON-LD schema for generic pages.
 */
export function generateWebPageSchema({
  name,
  description,
  path,
}: {
  name: string;
  description: string;
  path: string;
}): object {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name,
    description,
    url: `${siteConfig.url}${path}`,
    inLanguage: siteConfig.language,
    isPartOf: {
      "@type": "WebSite",
      url: siteConfig.url,
    },
  };
}

/**
 * Generate AboutPage JSON-LD schema.
 */
export function generateAboutPageSchema({
  name,
  description,
}: {
  name: string;
  description: string;
}): object {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name,
    description,
    url: `${siteConfig.url}/about`,
    inLanguage: siteConfig.language,
    mainEntity: generateOrganizationSchema(),
  };
}

/**
 * Convert article status to Schema.org availability.
 */
export function getSchemaAvailability(status: string): string {
  switch (status) {
    case "in_stock":
    case "extras_in_stock":
      return "https://schema.org/InStock";
    case "out_of_stock":
    case "gb_ended":
      return "https://schema.org/OutOfStock";
    case "gb_running":
    case "interest_check":
    case "extras_gb":
      return "https://schema.org/PreOrder";
    default:
      return "https://schema.org/OutOfStock";
  }
}
