import { env } from "@azertykeycaps-app/env/server";
import { cacheInvalidationPayloadSchema } from "@azertykeycaps-app/schemas";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { bearerAuth } from "hono/bearer-auth";
import { bodyLimit } from "hono/body-limit";

import {
  buildCacheKeys,
  buildCacheTagsToPurge,
  buildPageDataCacheKeys,
} from "@/lib/cache-keys";
import { CACHE_NAMES, invalidateCache } from "@/middleware";
import { purgeCloudflareCDNByTags } from "@/services/cloudflare";

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

      // Log invalidation without exposing sensitive data
      console.log(`[cache] Invalidation: ${type}/${slug}`);

      // Invalidate Workers Cache API (tRPC endpoints)
      const cacheKeys = buildCacheKeys(env.SERVER_URL, type, slug);
      const cmsResult = await invalidateCache(CACHE_NAMES.CMS_API, cacheKeys);

      // Invalidate Page Data cache (aggregated endpoints)
      const pageDataKeys = buildPageDataCacheKeys(env.SERVER_URL, type, slug);
      const pageDataResult = await invalidateCache(
        CACHE_NAMES.PAGE_DATA,
        pageDataKeys,
      );

      // Invalidate media cache if applicable
      let mediaResult = { success: true, message: "Skipped (not media)" };
      if (slug === "media" && id) {
        const mediaKeys = [`${env.SERVER_URL}/api/media/${id}`];
        mediaResult = await invalidateCache(CACHE_NAMES.MEDIA, mediaKeys);
      }

      // Invalidate Cloudflare CDN cache by tags
      let cdnResult: {
        success: boolean;
        message: string;
        purgedTags?: string[];
      } = {
        success: true,
        message: "Skipped (CF credentials not configured)",
      };

      if (env.CF_ZONE_ID && env.CF_API_TOKEN) {
        const tags = buildCacheTagsToPurge(payload);
        cdnResult = await purgeCloudflareCDNByTags(
          env.CF_ZONE_ID,
          env.CF_API_TOKEN,
          tags,
        );
      }

      return c.json({
        success: true,
        payload,
        results: {
          cms: cmsResult,
          pageData: pageDataResult,
          media: mediaResult,
          cdn: cdnResult,
        },
      });
    },
  );

export default cache;
