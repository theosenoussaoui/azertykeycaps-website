import { createContext } from "@azertykeycaps-app/api/context";
import { appRouter } from "@azertykeycaps-app/api/routers/index";
import { auth } from "@azertykeycaps-app/auth";
import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";

import { pageDataCacheMiddleware } from "@/middleware";
import cache from "@/routes/cache";
import health from "@/routes/health";
import media from "@/routes/media";
import home from "@/routes/pages/home";
import layout from "@/routes/pages/layout";

const routes = new Hono()
  .route("/", health)
  .on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw))
  .use(
    "/trpc/*",
    trpcServer({
      router: appRouter,
      createContext: (_opts, context) => {
        return createContext({ context });
      },
    }),
  )
  .route("/api/media", media)
  .route("/api/cache", cache)
  // Page data routes with caching
  .use("/api/pages/*", pageDataCacheMiddleware)
  .route("/api/pages/layout", layout)
  .route("/api/pages/home", home);

export default routes;
