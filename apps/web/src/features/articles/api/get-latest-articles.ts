import { createServerFn } from "@tanstack/react-start";

import { serverTRPCClient } from "@/lib/server-trpc";

/**
 * Server function to fetch latest articles for landing page.
 * Uses module-scoped tRPC client for reduced cold start time.
 */
export const getLatestArticles = createServerFn({ method: "GET" }).handler(async () => {
  const articles = await serverTRPCClient.articles.list.query({
    page: 1,
    limit: 3,
  });

  return { articles };
});
