import type { MiddlewareHandler } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";

export function createCorsMiddleware(origin: string): MiddlewareHandler {
  return cors({
    origin,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  });
}

export function createSecureHeadersMiddleware(
  skipPaths: string[],
): MiddlewareHandler {
  return async (c, next) => {
    const shouldSkip = skipPaths.some((path) => c.req.path.startsWith(path));
    if (shouldSkip) {
      return next();
    }
    return secureHeaders()(c, next);
  };
}
