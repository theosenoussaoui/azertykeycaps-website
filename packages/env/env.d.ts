import type { ServerEnv } from "./src/types";

declare global {
  type Env = ServerEnv;
}

declare module "cloudflare:workers" {
  namespace Cloudflare {
    export interface Env extends ServerEnv {}
  }
}
