import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({
  // Optional: Enable R2 cache for ISR (Incremental Static Regeneration)
  // Uncomment to enable:
  // import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
  // incrementalCache: r2IncrementalCache,
});
