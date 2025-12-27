import { Hono } from "hono";
import type { Bindings } from "@azertykeycaps-app/rpc";
import { health } from "./health";

export const routes = new Hono<{ Bindings: Bindings }>().route("/health", health);
