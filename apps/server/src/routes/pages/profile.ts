import { appRouter } from "@azertykeycaps-app/api/routers/index";
import { env } from "@azertykeycaps-app/env/server";
import {
  profilePageQueryParamsSchema,
  type ProfilePageDataResponse,
} from "@azertykeycaps-app/schemas";
import { formatDate } from "@azertykeycaps-app/utils/date";
import { Hono } from "hono";

/**
 * GET /api/pages/profile/:slug
 * Aggregates profile page data in parallel for performance.
 * Returns: profile (full), articles (paginated/filtered), profileSlug
 *
 * Query params validated via profilePageQueryParamsSchema:
 * - page: number (default 1)
 * - status: ArticleStatus (optional)
 * - material: ArticleMaterial (optional)
 * - isNew: "true" | "false" (optional, coerced to boolean)
 * - search: string (optional)
 *
 * Caching strategy:
 * - Base requests (no filters, page 1) are cached
 * - Filtered/paginated requests bypass cache
 */
const profile = new Hono().get("/:slug", async (c) => {
  const slug = c.req.param("slug");

  // Parse and validate query params with safeParse
  const queryResult = profilePageQueryParamsSchema.safeParse(c.req.query());

  if (!queryResult.success) {
    return c.json(
      {
        error: "Invalid query parameters",
        details: queryResult.error.flatten(),
      },
      400,
    );
  }

  const filters = queryResult.data;
  const isDev = env.SERVER_URL?.includes("localhost") ?? true;

  const caller = appRouter.createCaller({
    session: null,
    env,
    isDev,
  });

  // Fetch profile and articles in parallel
  const [profileData, articlesResponse] = await Promise.all([
    caller.articles.profileBySlug({ slug }),
    caller.articles.list({
      profile: slug,
      page: filters.page,
      limit: 12,
      status: filters.status,
      material: filters.material,
      isNew: filters.isNew,
      search: filters.search,
    }),
  ]);

  // Return 404 if profile doesn't exist
  if (!profileData) {
    return c.json({ error: "Profile not found" }, 404);
  }

  // Format dates server-side to prevent hydration mismatch
  const articlesWithFormattedDates = {
    ...articlesResponse,
    docs: articlesResponse.docs.map((article) => ({
      ...article,
      startDate: formatDate(article.startDate),
      endDate: formatDate(article.endDate),
    })),
  };

  const response: ProfilePageDataResponse = {
    profile: profileData,
    articles: articlesWithFormattedDates,
    profileSlug: slug,
  };

  return c.json(response);
});

export default profile;
