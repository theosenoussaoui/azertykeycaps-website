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
    const response = await fetch(
      `${serverEnv.SERVER_URL}/api/pages/article/${data.slug}`,
    );

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch article data: ${response.status}`);
    }

    return response.json();
  });
