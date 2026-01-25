/**
 * Purge Cloudflare CDN cache by cache tags.
 *
 * Cache tags are set on responses via the `Cache-Tag` HTTP header.
 * When we purge by tag, Cloudflare invalidates all cached responses
 * that have that tag, without needing to know the exact URLs.
 *
 * @see https://developers.cloudflare.com/cache/how-to/purge-cache/purge-by-tags/
 */
export async function purgeCloudflareCDNByTags(
  zoneId: string,
  apiToken: string,
  tags: string[],
): Promise<{ success: boolean; message: string; purgedTags?: string[] }> {
  if (tags.length === 0) {
    return {
      success: true,
      message: "No cache tags to purge",
    };
  }

  console.log(`[cache] Purging ${tags.length} cache tags`);

  try {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tags }),
      },
    );

    const responseData = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: `Cloudflare API error: ${JSON.stringify(responseData)}`,
      };
    }

    return {
      success: true,
      message: `Purged ${tags.length} cache tags`,
      purgedTags: tags,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
