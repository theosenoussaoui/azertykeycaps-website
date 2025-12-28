import type { D1Database, R2Bucket } from "@cloudflare/workers-types";

/**
 * Cloudflare Worker bindings
 * Matches bindings in packages/infra/alchemy.run.ts
 */
export type Bindings = {
  DB: D1Database;
  R2?: R2Bucket;
  CORS_ORIGIN: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  PAYLOAD_SECRET?: string;
  CMS_URL?: string;
};
