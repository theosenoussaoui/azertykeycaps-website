import { appRouter } from "@azertykeycaps-app/api/routers/index";
import { env } from "@azertykeycaps-app/env/server";
import type { LayoutDataResponse } from "@azertykeycaps-app/schemas";
import { Hono } from "hono";

/**
 * GET /api/pages/layout
 * Aggregates all root layout data in parallel for performance.
 * Returns: socialNetworks, profiles, notFoundPage
 *
 * This endpoint replaces multiple tRPC calls with a single request,
 * fetching all CMS data in parallel.
 */
const layout = new Hono().get("/", async (c) => {
  const handlerStart = performance.now();

  const isDev = env.SERVER_URL?.includes("localhost") ?? true;

  const caller = appRouter.createCaller({
    session: null,
    env,
    isDev,
  });

  const [socialNetworks, profiles, notFoundPage] = await Promise.all([
    (async () => {
      const start = performance.now();
      const data = await caller.globals.socialNetworks();
      console.log(
        `[server:/api/pages/layout] globals.socialNetworks: ${(performance.now() - start).toFixed(1)}ms`,
      );
      return data;
    })(),
    (async () => {
      const start = performance.now();
      const data = await caller.articles.profiles({ limit: 100 });
      console.log(
        `[server:/api/pages/layout] articles.profiles: ${(performance.now() - start).toFixed(1)}ms`,
      );
      return data;
    })(),
    (async () => {
      const start = performance.now();
      const data = await caller.globals.notFoundPage();
      console.log(
        `[server:/api/pages/layout] globals.notFoundPage: ${(performance.now() - start).toFixed(1)}ms`,
      );
      return data;
    })(),
  ]);

  const response: LayoutDataResponse = {
    socialNetworks,
    profiles,
    notFoundPage,
  };

  console.log(
    `[server:/api/pages/layout] total: ${(performance.now() - handlerStart).toFixed(1)}ms`,
  );

  return c.json(response);
});

export default layout;
