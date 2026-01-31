import { env } from "@azertykeycaps-app/env/server";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { requestId } from "hono/request-id";

import {
  createCorsMiddleware,
  createSecureHeadersMiddleware,
} from "@/middleware";
import routes from "@/routes";

const app = new Hono();

app.use(logger());
app.use("*", requestId());
app.use("*", createSecureHeadersMiddleware(["/api/media/"]));
app.use("/*", createCorsMiddleware(env.CORS_ORIGIN));

app.route("/", routes);

app.notFound((c) => {
  return c.json(
    {
      error: "Not found",
      path: c.req.path,
      requestId: c.get("requestId"),
    },
    404,
  );
});

app.onError((err, c) => {
  const requestId = c.get("requestId");

  if (err instanceof HTTPException) {
    console.error(
      `[error] ${err.status} ${err.message} (requestId: ${requestId})`,
    );
    return c.json(
      {
        error: err.message,
        status: err.status,
        requestId,
      },
      err.status,
    );
  }

  console.error(`[error] Unhandled error (requestId: ${requestId}):`, err);
  return c.json(
    {
      error: "Internal server error",
      requestId,
    },
    500,
  );
});

export default app;
