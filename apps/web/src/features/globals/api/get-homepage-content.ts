import { createServerFn } from "@tanstack/react-start";

import { serverTRPCClient } from "@/lib/server-trpc";

/**
 * Server function to fetch homepage content from CMS.
 * Uses module-scoped tRPC client for reduced cold start time.
 *
 * Returns:
 * - title: Page title
 * - subtitle: Page subtitle
 * - metaTitle: SEO meta title (optional, falls back to title)
 * - metaDescription: SEO meta description (optional)
 * - ogImage: SEO Open Graph image (optional)
 * - noIndex: Whether to noindex this page (optional)
 */
export const getHomepageContent = createServerFn({ method: "GET" }).handler(
  async () => {
    return await serverTRPCClient.globals.homepage.query();
  },
);
