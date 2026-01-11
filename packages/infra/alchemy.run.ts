import alchemy from "alchemy";
import { TanStackStart, Worker, D1Database } from "alchemy/cloudflare";
import { CloudflareStateStore } from "alchemy/state";
import { GitHubComment } from "alchemy/github";
import { config } from "dotenv";

config({ path: "./.env" });
config({ path: "../../apps/web/.env" });
config({ path: "../../apps/server/.env" });

const stage = process.env.STAGE ?? "dev";

const app = await alchemy("azertykeycaps-app", {
  stage,
  // Use CloudflareStateStore in CI for shared state, local file store in dev
  stateStore: process.env.CI ? (scope) => new CloudflareStateStore(scope) : undefined,
});

// API database (for Better-Auth used by web/server)
const db = await D1Database("api-db", {
  migrationsDir: "../../packages/db/src/migrations",
});

// CMS is now deployed separately to Vercel - removed from Alchemy

export const server = await Worker("server", {
  cwd: "../../apps/server",
  entrypoint: "src/index.ts",
  compatibility: "node",
  bindings: {
    DB: db,
    CORS_ORIGIN: alchemy.env.CORS_ORIGIN!,
    BETTER_AUTH_SECRET: alchemy.env.BETTER_AUTH_SECRET!,
    BETTER_AUTH_URL: alchemy.env.BETTER_AUTH_URL!,
    CMS_API_URL: alchemy.env.CMS_API_URL!,
    SERVER_URL: alchemy.env.SERVER_URL!,
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
    SERVER_URL: alchemy.env.SERVER_URL!,
  },
});

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
