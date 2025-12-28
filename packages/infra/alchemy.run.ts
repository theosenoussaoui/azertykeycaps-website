import alchemy from "alchemy";
import { TanStackStart, Worker, D1Database, R2Bucket, Nextjs } from "alchemy/cloudflare";
import { config } from "dotenv";

config({ path: "./.env" });
config({ path: "../../apps/web/.env" });
config({ path: "../../apps/server/.env" });
config({ path: "../../apps/cms/.env" });

const app = await alchemy("azertykeycaps-app");

// Front-end database (Better-Auth for web/server)
const db = await D1Database("front-db", {
  migrationsDir: "../../packages/db/src/migrations",
});

// CMS database (separate for easier management)
const cmsDb = await D1Database("cms-db", {
  migrationsDir: "../../apps/cms/src/migrations",
});

// R2 bucket for CMS media storage
const mediaBucket = await R2Bucket("media-storage", {
  name: "azertykeycaps-media",
});

export const cms = await Nextjs("cms", {
  cwd: "../../apps/cms",
  adopt: true,
  bindings: {
    DB: cmsDb,
    R2: mediaBucket,
    PAYLOAD_SECRET: alchemy.env.PAYLOAD_SECRET!,
  },
  compatibility: "node",
});

export const server = await Worker("server", {
  cwd: "../../apps/server",
  entrypoint: "src/index.ts",
  compatibility: "node",
  bindings: {
    DB: db,
    CORS_ORIGIN: alchemy.env.CORS_ORIGIN!,
    BETTER_AUTH_SECRET: alchemy.env.BETTER_AUTH_SECRET!,
    BETTER_AUTH_URL: alchemy.env.BETTER_AUTH_URL!,
  },
});

export const web = await TanStackStart("web", {
  cwd: "../../apps/web",
  bindings: {
    VITE_SERVER_URL: alchemy.env.VITE_SERVER_URL!,
    DB: db,
    CORS_ORIGIN: alchemy.env.CORS_ORIGIN!,
    BETTER_AUTH_SECRET: alchemy.env.BETTER_AUTH_SECRET!,
    BETTER_AUTH_URL: alchemy.env.BETTER_AUTH_URL!,
  },
});

console.log(`Web    -> ${web.url}`);
console.log(`Server -> ${server.url}`);
console.log(`CMS    -> ${cms.url}`);

await app.finalize();
