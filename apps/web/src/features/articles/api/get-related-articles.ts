import { createServerFn } from "@tanstack/react-start";

import { serverTRPCClient } from "@/lib/server-trpc";

interface RelatedArticlesInput {
  profileSlug: string;
  excludeSlug: string;
  limit?: number;
}

/**
 * Server function to fetch related articles (same profile, excluding current).
 * Uses module-scoped tRPC client for reduced cold start time.
 */
export const getRelatedArticles = createServerFn({ method: "GET" })
  .inputValidator((data: RelatedArticlesInput) => data)
  .handler(async ({ data }) => {
    const response = await serverTRPCClient.articles.list.query({
      profile: data.profileSlug,
      limit: (data.limit ?? 4) + 1, // Fetch one extra to account for excluding current
    });

    // Filter out the current article
    const relatedDocs = response.docs.filter(
      (article) => article.slug !== data.excludeSlug,
    );

    // Limit to requested count
    return {
      docs: relatedDocs.slice(0, data.limit ?? 4),
    };
  });
