import { createServerFn } from "@tanstack/react-start";

import { serverTRPCClient } from "@/lib/server-trpc";

/**
 * Server function to fetch article by slug.
 * Uses module-scoped tRPC client for reduced cold start time.
 */
export const getArticleBySlug = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    return await serverTRPCClient.articles.bySlug.query({ slug: data.slug });
  });
