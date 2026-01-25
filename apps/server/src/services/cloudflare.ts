import type { CacheInvalidationPayload } from "@azertykeycaps-app/schemas";

import { buildUrlsToPurge } from "../lib/cache-keys";

export async function purgeCloudflareCDN(
  zoneId: string,
  apiToken: string,
  webUrl: string,
  payload: CacheInvalidationPayload,
): Promise<{ success: boolean; message: string; purgedUrls?: string[] }> {
  const urlsToPurge = buildUrlsToPurge(webUrl, payload);

  if (urlsToPurge.length === 0) {
    return {
      success: true,
      message: "No CDN URLs to purge for this content type",
    };
  }

  // URLs logged in production could leak internal structure - log count only
  console.log(`[cache] Purging ${urlsToPurge.length} URLs`);

  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ files: urlsToPurge }),
      },
    );

    const responseData = await response.json();
    // Avoid logging full API response - only log success/failure

    if (!response.ok) {
      return {
        success: false,
        message: `Cloudflare API error: ${JSON.stringify(responseData)}`,
      };
    }

    return {
      success: true,
      message: `Purged ${urlsToPurge.length} URLs`,
      purgedUrls: urlsToPurge,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
