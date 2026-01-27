/**
 * Contentful Image Download Script
 *
 * Downloads all assets from Contentful CDN and creates a manifest
 * for the migration to use.
 *
 * Usage: bun run download-images.ts
 */

import fs from "fs";
import path from "path";

const EXPORT_FILE =
  "./contentful-export-qakt0a0bvnxp-master-2026-01-27T11-44-49.json";
const OUTPUT_DIR = "./images";

interface ContentfulAsset {
  sys: { id: string };
  fields: {
    title?: { fr: string };
    description?: { fr: string };
    file?: {
      fr: {
        url: string;
        fileName: string;
        contentType: string;
        details: {
          size: number;
          image?: { width: number; height: number };
        };
      };
    };
  };
}

interface ManifestEntry {
  contentfulId: string;
  title: string;
  fileName: string;
  mimeType: string;
  width: number | null;
  height: number | null;
  localPath: string;
}

async function downloadImages() {
  console.log("📖 Reading Contentful export...");

  // Read export
  const exportData = JSON.parse(fs.readFileSync(EXPORT_FILE, "utf-8"));
  const assets: ContentfulAsset[] = exportData.assets;

  console.log(`   Found ${assets.length} assets`);

  // Create output directory
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log(`\n📥 Downloading images to ${OUTPUT_DIR}/...\n`);

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;
  const manifest: ManifestEntry[] = [];

  for (const asset of assets) {
    const assetId = asset.sys.id;
    const file = asset.fields.file?.fr;

    if (!file?.url) {
      console.log(`⚠️  Skipping ${assetId}: no file URL`);
      skipped++;
      continue;
    }

    const url = file.url.startsWith("//") ? `https:${file.url}` : file.url;
    const ext = path.extname(file.fileName) || ".jpg";
    const localPath = `${assetId}${ext}`;
    const outputPath = path.join(OUTPUT_DIR, localPath);

    // Add to manifest regardless of download status
    manifest.push({
      contentfulId: assetId,
      title:
        asset.fields.title?.fr ||
        asset.fields.description?.fr ||
        file.fileName ||
        "Untitled",
      fileName: file.fileName,
      mimeType: file.contentType,
      width: file.details?.image?.width || null,
      height: file.details?.image?.height || null,
      localPath,
    });

    // Skip if already downloaded
    if (fs.existsSync(outputPath)) {
      downloaded++;
      continue;
    }

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      fs.writeFileSync(outputPath, buffer);

      downloaded++;
      if (downloaded % 20 === 0) {
        console.log(`   ... ${downloaded}/${assets.length} downloaded`);
      }
    } catch (error) {
      console.log(
        `❌ Failed ${assetId} (${file.fileName}): ${error instanceof Error ? error.message : error}`,
      );
      failed++;
    }
  }

  // Write manifest
  const manifestPath = path.join(OUTPUT_DIR, "manifest.json");
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  console.log(`\n${"=".repeat(50)}`);
  console.log(`✅ Downloaded: ${downloaded}`);
  console.log(`⚠️  Skipped:    ${skipped}`);
  console.log(`❌ Failed:     ${failed}`);
  console.log(`📄 Manifest:   ${manifestPath}`);
  console.log(`${"=".repeat(50)}\n`);

  if (failed > 0) {
    console.log(
      "Some images failed to download. You can re-run this script to retry.",
    );
  }
}

downloadImages().catch(console.error);
