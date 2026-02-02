import type { ArticlePageDataResponse } from "@azertykeycaps-app/schemas";
import { createServerFn } from "@tanstack/react-start";

import { serverEnv } from "@/lib/server-env";

/**
 * Server function to fetch article page data from aggregated endpoint.
 * Returns: article (full), relatedArticles (same profile, max 4)
 *
 * Throws on error to show error UI.
 * Returns null for article if not found (404).
 */
export const getArticlePageData = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }): Promise<ArticlePageDataResponse | null> => {
    const url = `${serverEnv.SERVER_URL}/api/pages/article/${data.slug}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch article data: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error("Article data request timed out");
      }
      throw error;
    }
  });
