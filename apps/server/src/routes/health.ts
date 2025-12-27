import { Hono } from "hono";
import type { Bindings } from "@azertykeycaps-app/rpc";

const health = new Hono<{ Bindings: Bindings }>();

health.get("/", (c) => {
  return c.json({ status: "ok" });
});

export { health };
