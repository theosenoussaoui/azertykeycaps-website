import alchemy from "alchemy";
import { TanStackStart, Worker, D1Database } from "alchemy/cloudflare";
import { CloudflareStateStore } from "alchemy/state";
import { GitHubComment } from "alchemy/github";
import { config } from "dotenv";

config({ path: "./.env" });
config({ path: "../../apps/web/.env" });
config({ path: "../../apps/server/.env", override: true });

const stage = process.env.STAGE ?? "dev";
const isProd = stage === "prod";
// Local development: not in CI and not deploying to prod
const isLocalDev = !process.env.CI && stage === "dev";

// For PR previews, we'll use the Workers URLs directly
// For prod, we use custom domains from env
const CLOUDFLARE_SUBDOMAIN = "theosen95"; // Your Cloudflare account subdomain

// Custom domains from env (only used in prod)
// Use process.env directly to avoid throwing in dev when not set
const WEB_DOMAIN = process.env.WEB_DOMAIN; // e.g., "staging.azertykeycaps.fr"
const API_DOMAIN = process.env.API_DOMAIN; // e.g., "api.azertykeycaps.fr"

const app = await alchemy("azertykeycaps-app", {
  stage,
  // Use CloudflareStateStore in CI for shared state, local file store in dev
  stateStore: process.env.CI ? (scope) => new CloudflareStateStore(scope) : undefined,
});

// API database (for Better-Auth used by web/server)
const db = await D1Database("api-db", {
  migrationsDir: "../../packages/db/src/migrations",
});

// Compute URLs based on environment
// Local dev: use localhost
// Prod with custom domains: use custom domains
// PR previews / staging: use Workers URLs
const serverUrl = isLocalDev
  ? "http://localhost:1337"
  : isProd && API_DOMAIN
    ? `https://${API_DOMAIN}`
    : `https://azertykeycaps-app-server-${stage}.${CLOUDFLARE_SUBDOMAIN}.workers.dev`;

const webUrl = isLocalDev
  ? "http://localhost:3001"
  : isProd && WEB_DOMAIN
    ? `https://${WEB_DOMAIN}`
    : `https://azertykeycaps-app-web-${stage}.${CLOUDFLARE_SUBDOMAIN}.workers.dev`;

// CMS URL - required in prod, defaults to localhost in dev
const cmsUrl = isProd
  ? alchemy.env("CMS_API_URL")
  : (process.env.CMS_API_URL ?? "http://localhost:3000");

// Secrets - use process.env with defaults for dev, alchemy.env for prod (throws if missing)
const getSecret = (name: string, devDefault: string = "dev-secret-placeholder") => {
  if (isProd) {
    return alchemy.env(name);
  }
  return process.env[name] ?? devDefault;
};

export const server = await Worker("server", {
  cwd: "../../apps/server",
  entrypoint: "src/index.ts",
  compatibility: "node",
  domains: isProd && API_DOMAIN ? [API_DOMAIN] : undefined,
  bindings: {
    DB: db,
    CORS_ORIGIN: webUrl,
    BETTER_AUTH_SECRET: getSecret("BETTER_AUTH_SECRET"),
    BETTER_AUTH_URL: serverUrl,
    CMS_API_URL: cmsUrl,
    SERVER_URL: serverUrl,
    CACHE_INVALIDATION_SECRET: getSecret("CACHE_INVALIDATION_SECRET"),
    CMS_API_KEY: getSecret("CMS_API_KEY", ""),
    CF_ZONE_ID: getSecret("CF_ZONE_ID", ""),
    CF_API_TOKEN: getSecret("CF_API_TOKEN", ""),
  },
});

export const web = await TanStackStart("web", {
  cwd: "../../apps/web",
  domains: isProd && WEB_DOMAIN ? [WEB_DOMAIN] : undefined,
  bindings: {
    VITE_SERVER_URL: serverUrl,
    DB: db,
    CORS_ORIGIN: webUrl,
    BETTER_AUTH_SECRET: getSecret("BETTER_AUTH_SECRET"),
    BETTER_AUTH_URL: serverUrl,
    SERVER_URL: serverUrl,
  },
});

console.log(`Stage  -> ${stage}`);
console.log(`Web    -> ${webUrl}`);
console.log(`Server -> ${serverUrl}`);
console.log(`CMS    -> ${cmsUrl}`);
console.log(
  `CMS_API_KEY -> ${process.env.CMS_API_KEY ? "set (" + process.env.CMS_API_KEY.slice(0, 8) + "...)" : "NOT SET"}`,
);

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
