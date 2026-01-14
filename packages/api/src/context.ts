import type { Context as HonoContext } from "hono";

import { auth } from "@azertykeycaps-app/auth";
import { env } from "@azertykeycaps-app/env/server";

export type CreateContextOptions = {
  context: HonoContext<{ Bindings: Env }>;
};

export async function createContext({ context }: CreateContextOptions) {
  const session = await auth.api.getSession({
    headers: context.req.raw.headers,
  });

  const isDev = env.SERVER_URL?.includes("localhost") ?? true;

  return {
    session,
    env,
    isDev,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
