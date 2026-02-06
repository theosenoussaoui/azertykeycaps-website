import { appRouter } from "@azertykeycaps-app/api/routers/index";
import { env } from "@azertykeycaps-app/env/server";
import type { HomeWithLayoutDataResponse } from "@azertykeycaps-app/schemas";
import { formatDate } from "@azertykeycaps-app/utils/date";
import { Hono } from "hono";

/**
 * GET /api/pages/home-with-layout
 * Aggregates ALL homepage data (layout + page-specific) in a single request.
 * Combines what was previously two separate calls (/api/pages/layout + /api/pages/home)
 * into one, reducing service binding overhead and running all CMS queries in parallel.
 *
 * Returns: socialNetworks, profiles, articles (latest 4 with formatted dates), homepage content
 */
const homeWithLayout = new Hono().get("/", async (c) => {
  const handlerStart = performance.now();

  const isDev = env.SERVER_URL?.includes("localhost") ?? true;

  const caller = appRouter.createCaller({
    session: null,
    env,
    isDev,
  });

  const [socialNetworks, profiles, articles, homepage] = await Promise.all([
    (async () => {
      const start = performance.now();
      const data = await caller.globals.socialNetworks();
      console.log(
        `[server:/api/pages/home-with-layout] globals.socialNetworks: ${(performance.now() - start).toFixed(1)}ms`,
      );
      return data;
    })(),
    (async () => {
      const start = performance.now();
      const data = await caller.articles.profiles({ limit: 100 });
      console.log(
        `[server:/api/pages/home-with-layout] articles.profiles: ${(performance.now() - start).toFixed(1)}ms`,
      );
      return data;
    })(),
    (async () => {
      const start = performance.now();
      const data = await caller.articles.list({ page: 1, limit: 4 });
      console.log(
        `[server:/api/pages/home-with-layout] articles.list: ${(performance.now() - start).toFixed(1)}ms`,
      );
      return data;
    })(),
    (async () => {
      const start = performance.now();
      const data = await caller.globals.homepage();
      console.log(
        `[server:/api/pages/home-with-layout] globals.homepage: ${(performance.now() - start).toFixed(1)}ms`,
      );
      return data;
    })(),
  ]);

  const articlesWithFormattedDates = {
    ...articles,
    docs: articles.docs.map((article) => ({
      ...article,
      startDate: formatDate(article.startDate),
      endDate: formatDate(article.endDate),
    })),
  };

  const response: HomeWithLayoutDataResponse = {
    socialNetworks,
    profiles,
    articles: articlesWithFormattedDates,
    homepage,
  };

  console.log(
    `[server:/api/pages/home-with-layout] total: ${(performance.now() - handlerStart).toFixed(1)}ms`,
  );

  return c.json(response);
});

export default homeWithLayout;
