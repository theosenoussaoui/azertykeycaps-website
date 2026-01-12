import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

// Server-only env for TanStack Start server functions
// These are NEVER exposed to the client
// Note: Web app only needs SERVER_URL - CMS_API_URL is only used by the API server
export const serverEnv = createEnv({
  server: {
    SERVER_URL: z.string().url(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
