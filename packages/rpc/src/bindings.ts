import type { D1Database } from "@cloudflare/workers-types";

/**
 * Cloudflare Worker bindings
 * Matches bindings in packages/infra/alchemy.run.ts
 */
export type Bindings = {
  DB: D1Database;
  CORS_ORIGIN: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
};
