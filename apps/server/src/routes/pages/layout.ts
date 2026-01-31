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
  const isDev = env.SERVER_URL?.includes("localhost") ?? true;

  const caller = appRouter.createCaller({
    session: null,
    env,
    isDev,
  });

  const [socialNetworks, profiles, notFoundPage] = await Promise.all([
    caller.globals.socialNetworks(),
    caller.articles.profiles({ limit: 100 }),
    caller.globals.notFoundPage(),
  ]);

  const response: LayoutDataResponse = {
    socialNetworks,
    profiles,
    notFoundPage,
  };

  return c.json(response);
});

export default layout;
