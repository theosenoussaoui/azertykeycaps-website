import { appRouter } from "@azertykeycaps-app/api/routers/index";
import { env } from "@azertykeycaps-app/env/server";
import type { ArticlePageDataResponse } from "@azertykeycaps-app/schemas";
import { formatDate } from "@azertykeycaps-app/utils/date";
import { Hono } from "hono";

/**
 * GET /api/pages/article/:slug
 * Aggregates article detail page data in parallel for performance.
 * Returns: article (full), relatedArticles (same profile, max 4)
 *
 * This endpoint replaces multiple tRPC calls with a single request,
 * fetching article and related articles in parallel.
 */
const article = new Hono().get("/:slug", async (c) => {
  const slug = c.req.param("slug");
  const isDev = env.SERVER_URL?.includes("localhost") ?? true;

  const caller = appRouter.createCaller({
    session: null,
    env,
    isDev,
  });

  const articleData = await caller.articles.bySlug({ slug });

  if (!articleData) {
    return c.json({ error: "Article not found" }, 404);
  }

  let relatedArticles: ArticlePageDataResponse["relatedArticles"] = [];

  if (articleData.profile) {
    const related = await caller.articles.list({
      profile: articleData.profile.slug,
      limit: 5,
    });

    relatedArticles = related.docs
      .filter((a) => a.slug !== slug)
      .slice(0, 4)
      .map((a) => ({
        ...a,
        startDate: formatDate(a.startDate),
        endDate: formatDate(a.endDate),
      }));
  }

  const response: ArticlePageDataResponse = {
    article: articleData,
    relatedArticles,
  };

  return c.json(response);
});

export default article;
