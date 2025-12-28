import { sqliteD1Adapter } from "@payloadcms/db-d1-sqlite";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import path from "path";
import { buildConfig } from "payload";
import { fileURLToPath } from "url";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { r2Storage } from "@payloadcms/storage-r2";

import { Users } from "./collections/Users";
import { Media } from "./collections/Media";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// Define expected Cloudflare bindings type
type CloudflareBindings = {
  DB: any;
  R2: any;
  PAYLOAD_SECRET: string;
};

// Detect build mode - use mock bindings since real bindings only exist at runtime
const isBuild =
  process.argv.includes("build") || process.env.NEXT_PHASE === "phase-production-build";

const cloudflare: { env: CloudflareBindings } = isBuild
  ? {
      // Mock bindings for build - real bindings injected by Cloudflare Workers at runtime
      env: {
        DB: {} as any,
        R2: {} as any,
        PAYLOAD_SECRET: process.env.PAYLOAD_SECRET || "",
      },
    }
  : ((await getCloudflareContext({ async: true })) as any);

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media],
  editor: lexicalEditor(),
  secret: cloudflare.env.PAYLOAD_SECRET || process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: sqliteD1Adapter({ binding: cloudflare.env.DB }),
  plugins: [
    r2Storage({
      bucket: cloudflare.env.R2,
      collections: { media: true },
    }),
  ],
});
