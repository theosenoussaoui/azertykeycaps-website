import { env } from "@azertykeycaps-app/env/server";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { proxy } from "hono/proxy";
import { timeout } from "hono/timeout";

import { mediaCacheMiddleware } from "../middleware";

const MEDIA_TIMEOUT_MS = 30000;

const media = new Hono()
  .use("/*", timeout(MEDIA_TIMEOUT_MS))
  .use("/*", mediaCacheMiddleware)
  .get("/*", async (c) => {
    const path = c.req.path.replace("/api/media", "");
    const cmsMediaUrl = `${env.CMS_API_URL}/api/media${path}`;

    const response = await proxy(cmsMediaUrl);

    if (!response.ok) {
      console.error(
        `[media proxy] Failed: ${cmsMediaUrl} (status: ${response.status})`,
      );
      throw new HTTPException(404, { message: "Media not found" });
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const cacheControl =
      response.headers.get("cache-control") || "public, max-age=31536000";

    return new Response(response.body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": cacheControl,
        "Cross-Origin-Resource-Policy": "cross-origin",
      },
    });
  });

export default media;
