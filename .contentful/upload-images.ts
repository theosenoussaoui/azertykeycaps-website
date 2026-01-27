/**
 * Upload Images to Payload CMS via HTTP API
 *
 * This script uploads images to the running CMS server.
 * It updates existing media records created by the migration.
 *
 * Prerequisites:
 * 1. Run the migration first: cd apps/cms && bun run payload migrate
 * 2. Start the CMS dev server: cd apps/cms && bun run dev
 * 3. Create a .env file with CMS_API_KEY (from Payload admin user settings)
 * 4. Then run this script: bun run upload-images.ts
 *
 * Environment variables (can be set in .contentful/.env):
 *   CMS_BASE_URL - CMS server URL (default: http://localhost:3002)
 *   CMS_API_KEY  - Payload API key from admin user
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env file from current directory
const envPath = path.join(__dirname, ".env");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#")) {
      const [key, ...valueParts] = trimmed.split("=");
      const value = valueParts.join("=");
      if (key && value) {
        process.env[key] = value;
      }
    }
  }
}

const IMAGES_DIR = "./images";
const MANIFEST_PATH = path.join(IMAGES_DIR, "manifest.json");
const ID_MAPPING_PATH = path.join(IMAGES_DIR, "id-mapping.json");

const CMS_BASE_URL = process.env.CMS_BASE_URL || "http://localhost:3002";
const CMS_API_KEY = process.env.CMS_API_KEY;

interface ManifestEntry {
  contentfulId: string;
  title: string;
  fileName: string;
  mimeType: string;
  width: number | null;
  height: number | null;
  localPath: string;
}

/**
 * Detect actual MIME type from file content using magic bytes
 * This fixes issues where Contentful stored wrong MIME types
 */
function detectMimeType(buffer: Buffer): string {
  // Check magic bytes
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "image/png";
  }
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
    return "image/gif";
  }
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return "image/webp";
  }
  // AVIF: starts with ftyp box containing 'avif' or 'avis'
  if (
    buffer[4] === 0x66 &&
    buffer[5] === 0x74 &&
    buffer[6] === 0x79 &&
    buffer[7] === 0x70
  ) {
    const brand = buffer.slice(8, 12).toString("ascii");
    if (brand === "avif" || brand === "avis" || brand === "mif1") {
      return "image/avif";
    }
  }
  if (buffer[0] === 0x3c && buffer[1] === 0x73 && buffer[2] === 0x76) {
    return "image/svg+xml";
  }
  if (buffer[0] === 0x3c && buffer[1] === 0x3f && buffer[2] === 0x78) {
    return "image/svg+xml";
  }

  // Default fallback
  return "application/octet-stream";
}

/**
 * Get correct file extension for MIME type
 */
function getExtensionForMime(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    "image/jpeg": ".jpeg",
    "image/png": ".png",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "image/avif": ".avif",
    "image/svg+xml": ".svg",
  };
  return mimeToExt[mimeType] || "";
}

/**
 * Get authorization headers
 */
function getAuthHeaders(): Record<string, string> {
  if (!CMS_API_KEY) {
    console.error("❌ CMS_API_KEY not set!");
    console.error("   Create .contentful/.env with:");
    console.error("   CMS_API_KEY=your-api-key-from-payload-admin");
    console.error("");
    console.error("   To get an API key:");
    console.error("   1. Go to http://localhost:3002/admin");
    console.error("   2. Navigate to your user settings");
    console.error("   3. Enable API Key and copy it");
    process.exit(1);
  }

  return { Authorization: `users API-Key ${CMS_API_KEY}` };
}

async function uploadImages() {
  console.log(`\n📤 Uploading images to ${CMS_BASE_URL}\n`);

  // Check if manifest exists
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.error(`❌ Manifest not found: ${MANIFEST_PATH}`);
    console.error("   Run download-images.ts first");
    process.exit(1);
  }

  // Check if ID mapping exists
  if (!fs.existsSync(ID_MAPPING_PATH)) {
    console.error(`❌ ID mapping not found: ${ID_MAPPING_PATH}`);
    console.error(
      "   Run the migration first: cd apps/cms && bun run payload migrate",
    );
    process.exit(1);
  }

  const manifest: ManifestEntry[] = JSON.parse(
    fs.readFileSync(MANIFEST_PATH, "utf-8"),
  );

  const idMapping: Record<string, number> = JSON.parse(
    fs.readFileSync(ID_MAPPING_PATH, "utf-8"),
  );

  console.log(`   Found ${manifest.length} images in manifest`);
  console.log(`   Found ${Object.keys(idMapping).length} IDs in mapping\n`);

  let uploaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const asset of manifest) {
    const payloadId = idMapping[asset.contentfulId];
    if (!payloadId) {
      console.log(`⚠️  No ID mapping for: ${asset.contentfulId}`);
      skipped++;
      continue;
    }

    const imagePath = path.join(IMAGES_DIR, asset.localPath);
    if (!fs.existsSync(imagePath)) {
      console.log(`⚠️  Missing file: ${asset.localPath}`);
      skipped++;
      continue;
    }

    try {
      // Read file
      const fileBuffer = fs.readFileSync(imagePath);

      // Detect actual MIME type from file content (don't trust manifest)
      const actualMimeType = detectMimeType(fileBuffer);
      const correctExtension = getExtensionForMime(actualMimeType);

      // Fix filename extension if it doesn't match actual content
      let fileName = asset.fileName;
      if (correctExtension) {
        const currentExt = path.extname(fileName).toLowerCase();
        const expectedExts =
          actualMimeType === "image/jpeg"
            ? [".jpg", ".jpeg", ".jpe"]
            : [correctExtension];

        if (!expectedExts.includes(currentExt)) {
          const baseName = fileName.replace(/\.[^.]+$/, "");
          fileName = baseName + correctExtension;
          console.log(
            `   Renamed: ${asset.fileName} -> ${fileName} (actual: ${actualMimeType})`,
          );
        }
      }

      // Create form data with correct MIME type and fixed filename
      const formData = new FormData();
      const blob = new Blob([fileBuffer], { type: actualMimeType });
      formData.append("file", blob, fileName);
      formData.append("alt", asset.title || "Image");
      formData.append(
        "_payload",
        JSON.stringify({ alt: asset.title || "Image" }),
      );

      // Upload via PATCH to update existing record
      const response = await fetch(`${CMS_BASE_URL}/api/media/${payloadId}`, {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      uploaded++;
      if (uploaded % 20 === 0) {
        console.log(`   ... ${uploaded}/${manifest.length} uploaded`);
      }
    } catch (error) {
      console.log(
        `❌ Failed ${asset.fileName}: ${error instanceof Error ? error.message : error}`,
      );
      failed++;
    }
  }

  console.log(`\n${"=".repeat(50)}`);
  console.log(`✅ Uploaded: ${uploaded}`);
  console.log(`⚠️  Skipped:  ${skipped}`);
  console.log(`❌ Failed:   ${failed}`);
  console.log(`${"=".repeat(50)}\n`);

  if (failed > 0) {
    console.log("Some uploads failed. You can re-run this script to retry.\n");
  }
}

uploadImages().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
