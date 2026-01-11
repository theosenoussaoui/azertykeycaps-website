import { trpcServer } from "@hono/trpc-server";
import { createContext } from "@azertykeycaps-app/api/context";
import { appRouter } from "@azertykeycaps-app/api/routers/index";
import { auth } from "@azertykeycaps-app/auth";
import { env } from "@azertykeycaps-app/env/server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";

const app = new Hono();

app.use(logger());
// Skip secureHeaders for media proxy (CORP header conflicts)
app.use("*", async (c, next) => {
  if (c.req.path.startsWith("/api/media/")) {
    return next();
  }
  return secureHeaders()(c, next);
});
app.use(
  "/*",
  cors({
    origin: env.CORS_ORIGIN,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    createContext: (_opts, context) => {
      return createContext({ context });
    },
  }),
);

// Image proxy to hide CMS URL from clients
app.get("/api/media/*", async (c) => {
  const path = c.req.path.replace("/api/media", "");
  const cmsMediaUrl = `${env.CMS_API_URL}/api/media${path}`;

  try {
    const response = await fetch(cmsMediaUrl);

    if (!response.ok) {
      console.error(`[media proxy] Failed: ${cmsMediaUrl} (status: ${response.status})`);
      return c.text("Media not found", 404);
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const cacheControl = response.headers.get("cache-control") || "public, max-age=31536000";

    return new Response(response.body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": cacheControl,
        "Cross-Origin-Resource-Policy": "cross-origin",
      },
    });
  } catch {
    return c.text("Failed to fetch media", 500);
  }
});

app.get("/", (c) => {
  return c.text("OK");
});

export default app;
