import { trpcServer } from "@hono/trpc-server";
import { createContext } from "@azertykeycaps-app/api/context";
import { appRouter } from "@azertykeycaps-app/api/routers/index";
import { auth } from "@azertykeycaps-app/auth";
import { env } from "@azertykeycaps-app/env/server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import {
  cmsCacheMiddleware,
  mediaCacheMiddleware,
  invalidateCache,
  buildCacheKeys,
  CACHE_NAMES,
} from "./middleware/cache";

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

// Apply cache middleware to tRPC endpoints (CMS data)
app.use("/trpc/*", cmsCacheMiddleware);

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    createContext: (_opts, context) => {
      return createContext({ context });
    },
  }),
);

// Apply cache middleware to media proxy
app.use("/api/media/*", mediaCacheMiddleware);

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

/**
 * Cache invalidation endpoint
 * Called by CMS webhook when content changes
 *
 * POST /api/cache/invalidate
 * Headers: Authorization: Bearer <CACHE_INVALIDATION_SECRET>
 * Body: { type: "collection" | "global", slug: string, id?: string }
 */
app.post("/api/cache/invalidate", async (c) => {
  // Verify authorization
  const authHeader = c.req.header("Authorization");
  const expectedToken = `Bearer ${env.CACHE_INVALIDATION_SECRET}`;

  if (!authHeader || authHeader !== expectedToken) {
    console.error("[cache] Unauthorized invalidation attempt");
    return c.json({ error: "Unauthorized" }, 401);
  }

  try {
    const body = await c.req.json<{
      type: "collection" | "global";
      slug: string;
      id?: string;
    }>();

    const { type, slug, id } = body;

    console.log(`[cache] Invalidation request: type=${type}, slug=${slug}, id=${id || "N/A"}`);

    // Build cache keys to invalidate based on what changed
    const cacheKeys = buildCacheKeys(env.SERVER_URL, type, slug);

    // Invalidate CMS API cache
    const cmsResult = await invalidateCache(CACHE_NAMES.CMS_API, cacheKeys);
    console.log(`[cache] CMS cache: ${cmsResult.message}`);

    // If media was updated, also invalidate media cache
    let mediaResult = { success: true, message: "Skipped (not media)" };
    if (slug === "media" && id) {
      const mediaKeys = [`${env.SERVER_URL}/api/media/${id}`];
      mediaResult = await invalidateCache(CACHE_NAMES.MEDIA, mediaKeys);
      console.log(`[cache] Media cache: ${mediaResult.message}`);
    }

    return c.json({
      success: true,
      type,
      slug,
      id,
      results: {
        cms: cmsResult,
        media: mediaResult,
      },
    });
  } catch (error) {
    console.error("[cache] Invalidation failed:", error);
    return c.json(
      {
        error: "Invalidation failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
});

app.get("/", (c) => {
  return c.text("OK");
});

export default app;
