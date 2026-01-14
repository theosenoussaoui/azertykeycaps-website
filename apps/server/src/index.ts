// v1.0.1
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
  mediaCacheMiddleware,
  invalidateCache,
  buildCacheKeys,
  purgeCloudflareCDN,
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

app.post("/api/cache/invalidate", async (c) => {
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
      articleSlug?: string;
    }>();

    const { type, slug, id, articleSlug } = body;

    console.log(`[cache] Invalidation request: type=${type}, slug=${slug}, id=${id || "N/A"}`);

    const cacheKeys = buildCacheKeys(env.SERVER_URL, type, slug);

    const cmsResult = await invalidateCache(CACHE_NAMES.CMS_API, cacheKeys);
    console.log(`[cache] CMS cache: ${cmsResult.message}`);

    let mediaResult = { success: true, message: "Skipped (not media)" };
    if (slug === "media" && id) {
      const mediaKeys = [`${env.SERVER_URL}/api/media/${id}`];
      mediaResult = await invalidateCache(CACHE_NAMES.MEDIA, mediaKeys);
      console.log(`[cache] Media cache: ${mediaResult.message}`);
    }

    let cdnResult: { success: boolean; message: string; purgedUrls?: string[] } = {
      success: true,
      message: "Skipped (CF credentials not configured)",
    };

    if (env.CF_ZONE_ID && env.CF_API_TOKEN) {
      cdnResult = await purgeCloudflareCDN(
        env.CF_ZONE_ID,
        env.CF_API_TOKEN,
        env.CORS_ORIGIN,
        type,
        slug,
        articleSlug,
      );
      console.log(`[cache] CDN cache: ${cdnResult.message}`);
    }

    return c.json({
      success: true,
      type,
      slug,
      id,
      results: {
        cms: cmsResult,
        media: mediaResult,
        cdn: cdnResult,
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

// Debug endpoint to test CMS connection
app.get("/debug/cms", async (c) => {
  const cmsUrl = env.CMS_API_URL;
  const apiKey = env.CMS_API_KEY;

  console.log("[DEBUG] CMS_API_URL:", cmsUrl);
  console.log("[DEBUG] CMS_API_KEY:", apiKey ? `${apiKey.slice(0, 8)}...` : "NOT SET");

  const testUrl = `${cmsUrl}/api/articles?limit=1`;
  console.log("[DEBUG] Testing URL:", testUrl);

  try {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (apiKey) {
      headers["Authorization"] = `users API-Key ${apiKey}`;
    }

    console.log("[DEBUG] Request headers:", JSON.stringify(headers));

    const response = await fetch(testUrl, { headers });

    console.log("[DEBUG] Response status:", response.status);
    const body = await response.text();
    console.log("[DEBUG] Response body:", body.slice(0, 500));

    return c.json({
      success: response.ok,
      status: response.status,
      cmsUrl,
      apiKeySet: !!apiKey,
      testUrl,
      responsePreview: body.slice(0, 200),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[DEBUG] Fetch failed:", message);
    console.error("[DEBUG] Full error:", error);

    return c.json({
      success: false,
      error: message,
      cmsUrl,
      apiKeySet: !!apiKey,
      testUrl,
      errorType: error instanceof Error ? error.constructor.name : typeof error,
    });
  }
});

export default app;
