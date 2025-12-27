import { auth } from "@azertykeycaps-app/auth";
import { env } from "@azertykeycaps-app/env/server";
import type { Bindings } from "@azertykeycaps-app/rpc";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { routes } from "./routes";

const app = new Hono<{ Bindings: Bindings }>();

app.use(logger());
app.use(
  "/*",
  cors({
    origin: env.CORS_ORIGIN,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

app.route("/api", routes);

app.get("/", (c) => {
  return c.text("OK");
});

export default app;
export type { routes as AppType };
