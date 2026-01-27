/**
 * Rebuild id-mapping.json from Production D1
 *
 * This script queries production D1 to get actual media IDs
 * and rebuilds the id-mapping.json to match.
 *
 * Usage:
 *   bun run .contentful/rebuild-id-mapping.ts
 *
 * Prerequisites:
 *   - Wrangler authenticated with Cloudflare
 *   - Migration already ran in production
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const IMAGES_DIR = path.join(__dirname, "images");
const MANIFEST_PATH = path.join(IMAGES_DIR, "manifest.json");
const ID_MAPPING_PATH = path.join(IMAGES_DIR, "id-mapping.json");

interface ManifestEntry {
  contentfulId: string;
  title: string;
  fileName: string;
  mimeType: string;
  width: number | null;
  height: number | null;
  localPath: string;
}

interface D1MediaRecord {
  id: number;
  filename: string;
}

async function rebuildMapping() {
  console.log("\n Rebuilding id-mapping.json from production D1...\n");

  // Check manifest exists
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error("Manifest not found:", MANIFEST_PATH);
    process.exit(1);
  }

  const manifest: ManifestEntry[] = JSON.parse(
    fs.readFileSync(MANIFEST_PATH, "utf-8")
  );
  console.log(`   Found ${manifest.length} entries in manifest`);

  // Query production D1
  console.log("   Querying production D1...");
  const result = execSync(
    'cd apps/cms && bunx wrangler d1 execute D1 --env=prod --remote --json --command="SELECT id, filename FROM media;"',
    { encoding: "utf-8" }
  );

  // Parse wrangler output (skip the wrangler banner lines)
  const jsonStart = result.indexOf("[");
  const jsonStr = result.slice(jsonStart);
  const parsed = JSON.parse(jsonStr);
  const records: D1MediaRecord[] = parsed[0].results;

  console.log(`   Found ${records.length} media records in production D1`);

  // Create filename -> id map from production
  const filenameToId = new Map<string, number>();
  for (const record of records) {
    filenameToId.set(record.filename, record.id);
  }

  // Build contentfulId -> productionId mapping
  const newMapping: Record<string, number> = {};
  let matched = 0;
  let missing = 0;

  for (const entry of manifest) {
    const productionId = filenameToId.get(entry.fileName);
    if (productionId) {
      newMapping[entry.contentfulId] = productionId;
      matched++;
    } else {
      console.log(`   Missing in production: ${entry.fileName}`);
      missing++;
    }
  }

  // Write new mapping
  fs.writeFileSync(ID_MAPPING_PATH, JSON.stringify(newMapping, null, 2));

  console.log(`\n${"=".repeat(50)}`);
  console.log(`   Matched:  ${matched}`);
  console.log(`   Missing:  ${missing}`);
  console.log(`   Written:  ${ID_MAPPING_PATH}`);
  console.log(`${"=".repeat(50)}\n`);
}

rebuildMapping().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
