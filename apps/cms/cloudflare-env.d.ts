// Auto-generated Cloudflare binding types for Payload CMS
// @see https://alchemy.run/concepts/bindings/#type-safe-bindings

interface CloudflareEnv {
  // Database binding (Cloudflare D1)
  D1: D1Database;

  // Storage binding (Cloudflare R2)
  R2: R2Bucket;

  // Payload CMS secret for encryption
  PAYLOAD_SECRET: string;

  // Cache invalidation endpoint on the server worker
  CACHE_INVALIDATION_URL: string;

  // Shared secret for cache invalidation requests
  CACHE_INVALIDATION_SECRET: string;

  // Frontend URL for CORS and redirects
  WEB_URL: string;
}

declare global {
  type Env = CloudflareEnv;
}

declare module "cloudflare:workers" {
  namespace Cloudflare {
    export interface Env extends CloudflareEnv {}
  }
}

export {};
