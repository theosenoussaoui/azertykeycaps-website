import type { ProfilePageFilters } from "@azertykeycaps-app/schemas";
import { createServerFn } from "@tanstack/react-start";

import { serverTRPCClient } from "@/lib/server-trpc";

type ProfilePageInput = { slug: string } & ProfilePageFilters;

/**
 * Server function to fetch articles by profile.
 * Uses module-scoped tRPC client for reduced cold start time.
 */
export const getArticlesByProfile = createServerFn({ method: "GET" })
  .inputValidator((data: ProfilePageInput) => data)
  .handler(async ({ data }) => {
    const articlesResponse = await serverTRPCClient.articles.list.query({
      profile: data.slug,
      page: data.page ?? 1,
      limit: 12,
      status: data.status,
      material: data.material,
      isNew: data.isNew,
      search: data.search,
    });

    return {
      articles: articlesResponse,
      profileSlug: data.slug,
    };
  });
