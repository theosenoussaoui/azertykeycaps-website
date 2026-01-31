import { appRouter } from "@azertykeycaps-app/api/routers/index";
import { env } from "@azertykeycaps-app/env/server";
import type { HomePageDataResponse } from "@azertykeycaps-app/schemas";
import { formatDate } from "@azertykeycaps-app/utils/date";
import { Hono } from "hono";

/**
 * GET /api/pages/home
 * Aggregates all homepage-specific data in parallel for performance.
 * Returns: articles (latest 4 with formatted dates), homepage content
 *
 * This endpoint replaces multiple tRPC calls with a single request,
 * fetching all CMS data in parallel.
 */
const home = new Hono().get("/", async (c) => {
  const isDev = env.SERVER_URL?.includes("localhost") ?? true;

  const caller = appRouter.createCaller({
    session: null,
    env,
    isDev,
  });

  const [articles, homepage] = await Promise.all([
    caller.articles.list({ page: 1, limit: 4 }),
    caller.globals.homepage(),
  ]);

  // Format dates server-side to prevent hydration mismatch
  const articlesWithFormattedDates = {
    ...articles,
    docs: articles.docs.map((article) => ({
      ...article,
      startDate: formatDate(article.startDate),
      endDate: formatDate(article.endDate),
    })),
  };

  const response: HomePageDataResponse = {
    articles: articlesWithFormattedDates,
    homepage,
  };

  return c.json(response);
});

export default home;
