import type { server, web } from "@azertykeycaps-app/infra/alchemy.run";
export type ServerEnv = typeof server.Env;
export type WebEnv = typeof web.Env;
