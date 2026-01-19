import { env } from "@azertykeycaps-app/env/server";
import { cacheInvalidationPayloadSchema } from "@azertykeycaps-app/schemas";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { bodyLimit } from "hono/body-limit";

import { buildCacheKeys } from "../lib/cache-keys";
import { CACHE_NAMES, invalidateCache } from "../middleware";
import { purgeCloudflareCDN } from "../services/cloudflare";

const MAX_BODY_SIZE = 50 * 1024;

const cache = new Hono()
  .use("/invalidate", bodyLimit({ maxSize: MAX_BODY_SIZE }))
  .use("/invalidate", bearerAuth({ token: env.CACHE_INVALIDATION_SECRET }))
  .post(
    "/invalidate",
    zValidator("json", cacheInvalidationPayloadSchema),
    async (c) => {
      const payload = c.req.valid("json");
      const { type, slug, id } = payload;

      console.log(
        `[cache] Invalidation request: type=${type}, slug=${slug}, id=${id || "N/A"}`,
      );

      const cacheKeys = buildCacheKeys(env.SERVER_URL, type, slug);

      const cmsResult = await invalidateCache(CACHE_NAMES.CMS_API, cacheKeys);
      console.log(`[cache] CMS cache: ${cmsResult.message}`);

      let mediaResult = { success: true, message: "Skipped (not media)" };
      if (slug === "media" && id) {
        const mediaKeys = [`${env.SERVER_URL}/api/media/${id}`];
        mediaResult = await invalidateCache(CACHE_NAMES.MEDIA, mediaKeys);
        console.log(`[cache] Media cache: ${mediaResult.message}`);
      }

      let cdnResult: {
        success: boolean;
        message: string;
        purgedUrls?: string[];
      } = {
        success: true,
        message: "Skipped (CF credentials not configured)",
      };

      if (env.CF_ZONE_ID && env.CF_API_TOKEN) {
        cdnResult = await purgeCloudflareCDN(
          env.CF_ZONE_ID,
          env.CF_API_TOKEN,
          env.CORS_ORIGIN,
          payload,
        );
        console.log(`[cache] CDN cache: ${cdnResult.message}`);
      }

      return c.json({
        success: true,
        payload,
        results: {
          cms: cmsResult,
          media: mediaResult,
          cdn: cdnResult,
        },
      });
    },
  );

export default cache;
