import { createContext } from "@azertykeycaps-app/api/context";
import { appRouter } from "@azertykeycaps-app/api/routers/index";
import { auth } from "@azertykeycaps-app/auth";
import { trpcServer } from "@hono/trpc-server";
import { Hono } from "hono";

import cache from "./cache";
import health from "./health";
import media from "./media";

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
  .route("/api/cache", cache);

export default routes;
