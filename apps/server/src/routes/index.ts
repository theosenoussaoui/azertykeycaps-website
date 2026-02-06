import { createContext } from "@azertykeycaps-app/api/context";
import { appRouter } from "@azertykeycaps-app/api/routers/index";
import { auth } from "@azertykeycaps-app/auth";
import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";

import {
  articlePageCacheMiddleware,
  pageDataCacheMiddleware,
  profilePageCacheMiddleware,
} from "@/middleware";
import cache from "@/routes/cache";
import health from "@/routes/health";
import media from "@/routes/media";
import article from "@/routes/pages/article";
import home from "@/routes/pages/home";
import homeWithLayout from "@/routes/pages/home-with-layout";
import layout from "@/routes/pages/layout";
import profile from "@/routes/pages/profile";

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
  .use("/api/pages/layout", pageDataCacheMiddleware)
  .route("/api/pages/layout", layout)
  .use("/api/pages/home", pageDataCacheMiddleware)
  .route("/api/pages/home", home)
  .use("/api/pages/home-with-layout", pageDataCacheMiddleware)
  .route("/api/pages/home-with-layout", homeWithLayout)
  .use("/api/pages/article/*", articlePageCacheMiddleware)
  .route("/api/pages/article", article)
  .use("/api/pages/profile/*", profilePageCacheMiddleware)
  .route("/api/pages/profile", profile);

export default routes;
