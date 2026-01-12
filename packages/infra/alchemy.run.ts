import alchemy from "alchemy";
import { TanStackStart, Worker, D1Database } from "alchemy/cloudflare";
import { CloudflareStateStore } from "alchemy/state";
import { GitHubComment } from "alchemy/github";
import { config } from "dotenv";

config({ path: "./.env" });
config({ path: "../../apps/web/.env" });
config({ path: "../../apps/server/.env" });

const stage = process.env.STAGE ?? "dev";
const isProd = stage === "prod";

// For PR previews, we'll use the Workers URLs directly
// For prod, we use custom domains from env
const CLOUDFLARE_SUBDOMAIN = "theosen95"; // Your Cloudflare account subdomain

const app = await alchemy("azertykeycaps-app", {
  stage,
  // Use CloudflareStateStore in CI for shared state, local file store in dev
  stateStore: process.env.CI ? (scope) => new CloudflareStateStore(scope) : undefined,
});

// API database (for Better-Auth used by web/server)
const db = await D1Database("api-db", {
  migrationsDir: "../../packages/db/src/migrations",
});

// Compute URLs based on stage
// For prod: use custom domains from env
// For PR previews: use Workers URLs
const serverUrl = isProd
  ? alchemy.env.SERVER_URL!
  : `https://azertykeycaps-app-server-${stage}.${CLOUDFLARE_SUBDOMAIN}.workers.dev`;

const webUrl = isProd
  ? alchemy.env.CORS_ORIGIN!
  : `https://azertykeycaps-app-web-${stage}.${CLOUDFLARE_SUBDOMAIN}.workers.dev`;

// CMS is always on Vercel (same URL for all stages)
const cmsUrl = alchemy.env.CMS_API_URL!;

export const server = await Worker("server", {
  cwd: "../../apps/server",
  entrypoint: "src/index.ts",
  compatibility: "node",
  bindings: {
    DB: db,
    CORS_ORIGIN: webUrl,
    BETTER_AUTH_SECRET: alchemy.env.BETTER_AUTH_SECRET!,
    BETTER_AUTH_URL: serverUrl,
    CMS_API_URL: cmsUrl,
    SERVER_URL: serverUrl,
    // Cache invalidation secret (shared with CMS)
    CACHE_INVALIDATION_SECRET: alchemy.env.CACHE_INVALIDATION_SECRET!,
  },
});

export const web = await TanStackStart("web", {
  cwd: "../../apps/web",
  bindings: {
    VITE_SERVER_URL: serverUrl,
    DB: db,
    CORS_ORIGIN: webUrl,
    BETTER_AUTH_SECRET: alchemy.env.BETTER_AUTH_SECRET!,
    BETTER_AUTH_URL: serverUrl,
    SERVER_URL: serverUrl,
  },
});

console.log(`Stage  -> ${stage}`);
console.log(`Web    -> ${web.url}`);
console.log(`Server -> ${server.url}`);

// GitHub PR comment for preview deployments
if (process.env.PULL_REQUEST) {
  await GitHubComment("preview-comment", {
    owner: process.env.GITHUB_REPOSITORY_OWNER || "your-github-username",
    repository: "azertykeycaps-website",
    issueNumber: Number(process.env.PULL_REQUEST),
    body: `## Preview Deployed

| App | URL |
|-----|-----|
| Web | ${web.url} |
| Server | ${server.url} |

Built from commit \`${process.env.GITHUB_SHA?.slice(0, 7) || "local"}\`

---
<sub>This comment updates automatically with each push.</sub>`,
  });
}

await app.finalize();
