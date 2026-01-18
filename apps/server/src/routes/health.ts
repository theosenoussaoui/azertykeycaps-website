import { Hono } from "hono";

const health = new Hono().get("/", (c) => c.text("OK"));

export default health;
