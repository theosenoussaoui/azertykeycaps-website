import { createServerFn } from "@tanstack/react-start";

import { formatDate } from "@/lib/date-utils";
import { serverTRPCClient } from "@/lib/server-trpc";

/**
 * Server function to fetch latest articles for landing page.
 * Uses module-scoped tRPC client for reduced cold start time.
 */
export const getLatestArticles = createServerFn({ method: "GET" }).handler(
  async () => {
    const articles = await serverTRPCClient.articles.list.query({
      page: 1,
      limit: 4,
    });

    // Format dates on the server to prevent hydration mismatches
    const articlesWithFormattedDates = {
      ...articles,
      docs: articles.docs.map((article) => ({
        ...article,
        startDate: formatDate(article.startDate),
        endDate: formatDate(article.endDate),
      })),
    };

    return { articles: articlesWithFormattedDates };
  },
);
