/**
 * Contentful to Payload Data Migration
 *
 * Migrates content from Contentful CMS export to Payload CMS:
 * - 232 media assets (images)
 * - 10 keycap profiles
 * - 5 social networks
 * - 1 homepage
 * - 1 informations page
 * - 204 articles
 *
 * This migration:
 * 1. Purges existing content data (preserves users)
 * 2. Uploads images from local folder to Payload/R2
 * 3. Creates all content entries with proper relationships
 */

import {
  type MigrateDownArgs,
  type MigrateUpArgs,
  sql,
} from "@payloadcms/db-d1-sqlite";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Import Contentful export directly
import contentfulExport from "../../../../.contentful/contentful-export-qakt0a0bvnxp-master-2026-01-27T11-44-49.json";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = path.resolve(__dirname, "../../../../.contentful/images");

// ============================================
// TYPES
// ============================================

interface ContentfulEntry {
  sys: {
    id: string;
    contentType: { sys: { id: string } };
  };
  fields: Record<string, { fr: unknown }>;
}

interface ContentfulAsset {
  sys: { id: string };
  fields: {
    title?: { fr: string };
    file?: {
      fr: {
        url: string;
        fileName: string;
        contentType: string;
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

interface ContentfulRichTextNode {
  nodeType: string;
  value?: string;
  content?: ContentfulRichTextNode[];
  data?: { uri?: string };
}

// ============================================
// VALUE TRANSFORMATION MAPS
// ============================================

type ArticleStatus =
  | "in_stock"
  | "extras_gb"
  | "extras_in_stock"
  | "gb_running"
  | "gb_ended"
  | "interest_check"
  | "out_of_stock";

type ArticleMaterial =
  | "abs_double_shot"
  | "abs_pad_printed"
  | "abs_simple"
  | "aluminium"
  | "pbt_double_shot"
  | "pbt_dye_sub"
  | "pbt_laser_printed";

type ProfileShape = "sculpted" | "uniform";

const STATUS_MAP: Record<string, ArticleStatus> = {
  "En stock": "in_stock",
  "Extras GB": "extras_gb",
  "Extras In-Stock": "extras_in_stock",
  "GB en cours": "gb_running",
  "GB terminé": "gb_ended",
  "Interest Check": "interest_check",
  "Out Of Stock": "out_of_stock",
};

const MATERIAL_MAP: Record<string, ArticleMaterial> = {
  "ABS Double-Shot": "abs_double_shot",
  "ABS Pad-Printed": "abs_pad_printed",
  "ABS Simple": "abs_simple",
  Aluminium: "aluminium",
  "PBT Double-Shot": "pbt_double_shot",
  "PBT Dye-Sub": "pbt_dye_sub",
  "PBT Laser printed": "pbt_laser_printed",
};

const SHAPE_MAP: Record<string, ProfileShape> = {
  Sculpté: "sculpted",
  Uniforme: "uniform",
};

// ============================================
// HELPERS
// ============================================

/**
 * Filter Contentful entries by content type
 */
function getEntriesByType(type: string): ContentfulEntry[] {
  return (contentfulExport.entries as unknown as ContentfulEntry[]).filter(
    (e) => e.sys.contentType.sys.id === type,
  );
}

/**
 * Extract plain text from a Contentful rich text node
 */
function extractTextFromNode(node: ContentfulRichTextNode): string {
  if (node.nodeType === "text") {
    return node.value || "";
  }
  if (node.nodeType === "hyperlink") {
    const linkText = (node.content || []).map(extractTextFromNode).join("");
    const uri = node.data?.uri || "";
    return `${linkText} (${uri})`;
  }
  if (node.content) {
    return node.content.map(extractTextFromNode).join("");
  }
  return "";
}

/**
 * Convert Contentful rich text to Payload Lexical format
 */
function contentfulRichTextToLexical(richText: {
  content: ContentfulRichTextNode[];
}): object {
  const children: object[] = [];

  for (const node of richText.content || []) {
    // Skip horizontal rules
    if (node.nodeType === "hr") {
      continue;
    }

    const text = extractTextFromNode(node);
    if (text.trim()) {
      children.push({
        type: "paragraph",
        version: 1,
        children: [
          {
            type: "text",
            text: text,
            version: 1,
            format: 0,
            mode: "normal",
            style: "",
            detail: 0,
          },
        ],
        direction: "ltr",
        format: "",
        indent: 0,
        textFormat: 0,
        textStyle: "",
      });
    }
  }

  return {
    root: {
      type: "root",
      version: 1,
      children,
      direction: "ltr",
      format: "",
      indent: 0,
    },
  };
}

// ============================================
// MIGRATION UP
// ============================================

export async function up({
  db,
  payload,
  req,
}: MigrateUpArgs): Promise<void> {
  console.log("\n" + "=".repeat(60));
  console.log("  CONTENTFUL TO PAYLOAD DATA MIGRATION");
  console.log("=".repeat(60) + "\n");

  // ----------------------------------------
  // PHASE 1: PURGE EXISTING DATA
  // ----------------------------------------
  console.log("PHASE 1: Purging existing data...\n");

  // Disable FK checks for clean deletion
  await db.run(sql`PRAGMA foreign_keys = OFF;`);

  // Delete in dependency order (children before parents)
  const tablesToPurge = [
    "search_rels",
    "search",
    "homepage_rels",
    "articles",
    "keycap_profiles",
    "social_networks_networks",
    "media",
  ];

  for (const table of tablesToPurge) {
    try {
      await db.run(sql.raw(`DELETE FROM "${table}";`));
      console.log(`  Purged: ${table}`);
    } catch (error) {
      console.log(`  Skipped (not found): ${table}`);
    }
  }

  // Reset SQLite sequence counters so IDs start from 1
  // This ensures local and production IDs match
  for (const table of tablesToPurge) {
    try {
      await db.run(
        sql.raw(`DELETE FROM sqlite_sequence WHERE name = '${table}';`),
      );
    } catch {
      // sqlite_sequence might not exist if table was never auto-incremented
    }
  }
  console.log("  Reset ID sequences");

  // Re-enable FK checks
  await db.run(sql`PRAGMA foreign_keys = ON;`);

  console.log("\n  Data purged successfully\n");

  // ----------------------------------------
  // PHASE 2: CREATE MEDIA RECORDS (without file upload)
  // ----------------------------------------
  console.log("PHASE 2: Creating media records...\n");
  console.log("  Note: Files will be uploaded separately via HTTP API\n");
  console.log("  Run: bun run .contentful/upload-images.ts after starting dev server\n");

  const assetIdMap = new Map<string, number>();

  // Check if manifest exists
  const manifestPath = path.join(IMAGES_DIR, "manifest.json");
  if (!fs.existsSync(manifestPath)) {
    throw new Error(
      `Image manifest not found at ${manifestPath}. Run the download-images.ts script first.`,
    );
  }

  const manifest: ManifestEntry[] = JSON.parse(
    fs.readFileSync(manifestPath, "utf-8"),
  );

  console.log(`  Found ${manifest.length} images in manifest\n`);

  let createdCount = 0;
  let failedCount = 0;

  // Create media records via SQL with placeholder data
  // Actual files will be uploaded via separate script using HTTP API
  for (const asset of manifest) {
    try {
      const alt = (asset.title || "Image").replace(/'/g, "''");
      const filename = asset.fileName.replace(/'/g, "''");
      const mimeType = asset.mimeType || "image/jpeg";
      const width = asset.width || 500;
      const height = asset.height || 500;

      await db.run(sql.raw(`
        INSERT INTO media (alt, filename, mime_type, width, height, updated_at, created_at)
        VALUES ('${alt}', '${filename}', '${mimeType}', ${width}, ${height}, datetime('now'), datetime('now'));
      `));

      // Get the inserted ID
      const result = await db.get<{ id: number }>(
        sql`SELECT last_insert_rowid() as id;`,
      );

      if (result?.id) {
        assetIdMap.set(asset.contentfulId, result.id);
        createdCount++;

        if (createdCount % 50 === 0) {
          console.log(`  ... ${createdCount}/${manifest.length} created`);
        }
      }
    } catch (error) {
      console.log(
        `  Failed: ${asset.localPath} - ${error instanceof Error ? error.message : error}`,
      );
      failedCount++;
    }
  }

  // Save the asset ID mapping for the upload script
  const mappingPath = path.join(IMAGES_DIR, "id-mapping.json");
  const mapping = Object.fromEntries(assetIdMap);
  fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2));
  console.log(`\n  ID mapping saved to: ${mappingPath}`);

  console.log(`\n  Created: ${createdCount}`);
  console.log(`  Failed: ${failedCount}\n`);

  // ----------------------------------------
  // PHASE 3: INSERT KEYCAP PROFILES
  // ----------------------------------------
  console.log("PHASE 3: Migrating Keycap Profiles...\n");

  const profileIdMap = new Map<string, number>();
  const profiles = getEntriesByType("keycaps-profile");

  for (const profile of profiles) {
    const fields = profile.fields;
    const thumbnailLink = fields.thumbnail?.fr as
      | { sys: { id: string } }
      | undefined;
    const thumbnailAssetId = thumbnailLink?.sys?.id;
    const thumbnailMediaId = thumbnailAssetId
      ? assetIdMap.get(thumbnailAssetId) || null
      : null;

    try {
      const created = await payload.create({
        collection: "keycap-profiles",
        data: {
          title: fields.title.fr as string,
          slug: fields.slug.fr as string,
          abbreviation: fields.abbreviation.fr as string,
          description: (fields.description?.fr as string) || null,
          navbarDescription: fields.navbarDescription.fr as string,
          navbarIconName: (fields.navbarIconName?.fr as string) || null,
          shape: SHAPE_MAP[fields.shape.fr as string],
          thumbnail: thumbnailMediaId,
        },
        req,
      });

      profileIdMap.set(profile.sys.id, created.id as number);
      console.log(`  Created: ${fields.title.fr}`);
    } catch (error) {
      console.log(
        `  Failed: ${fields.title.fr} - ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  console.log(`\n  Migrated ${profileIdMap.size} profiles\n`);

  // ----------------------------------------
  // PHASE 4: UPDATE SOCIAL NETWORKS
  // ----------------------------------------
  console.log("PHASE 4: Migrating Social Networks...\n");

  const socialNetworks = getEntriesByType("socialNetwork");

  try {
    await payload.updateGlobal({
      slug: "social-networks",
      data: {
        networks: socialNetworks.map((sn) => ({
          title: sn.fields.title.fr as string,
          url: sn.fields.url.fr as string,
          iconText: (sn.fields.iconText?.fr as string) || null,
        })),
      },
      req,
    });
    console.log(`  Migrated ${socialNetworks.length} social networks\n`);
  } catch (error) {
    console.log(
      `  Failed to update social networks: ${error instanceof Error ? error.message : error}\n`,
    );
  }

  // ----------------------------------------
  // PHASE 5: UPDATE HOMEPAGE
  // ----------------------------------------
  console.log("PHASE 5: Migrating Homepage...\n");

  const homepageEntries = getEntriesByType("homepage");
  if (homepageEntries.length > 0) {
    const homepage = homepageEntries[0];
    const profileCardsLinks = homepage.fields.profileCards.fr as Array<{
      sys: { id: string };
    }>;

    const featuredProfileIds = profileCardsLinks
      .map((link) => profileIdMap.get(link.sys.id))
      .filter((id): id is number => id !== undefined);

    try {
      await payload.updateGlobal({
        slug: "homepage",
        data: {
          title: homepage.fields.title.fr as string,
          subtitle: homepage.fields.description.fr as string, // Contentful 'description' maps to Payload 'subtitle'
          profileCards: featuredProfileIds,
        },
        req,
      });
      console.log("  Homepage updated\n");
    } catch (error) {
      console.log(
        `  Failed to update homepage: ${error instanceof Error ? error.message : error}\n`,
      );
    }
  } else {
    console.log("  No homepage entry found in Contentful export\n");
  }

  // ----------------------------------------
  // PHASE 6: UPDATE INFORMATIONS PAGE
  // ----------------------------------------
  console.log("PHASE 6: Migrating Informations Page...\n");

  const infoPages = getEntriesByType("information-rich-text");
  if (infoPages.length > 0) {
    const infoPage = infoPages[0];
    const richTextContent = infoPage.fields.informationRichText.fr as {
      content: ContentfulRichTextNode[];
    };
    const lexicalContent = contentfulRichTextToLexical(richTextContent);

    try {
      await payload.updateGlobal({
        slug: "informations-page",
        data: {
          title: "Informations",
          content: lexicalContent,
        },
        req,
      });
      console.log("  Informations page updated\n");
    } catch (error) {
      console.log(
        `  Failed to update informations page: ${error instanceof Error ? error.message : error}\n`,
      );
    }
  } else {
    console.log("  No informations page entry found in Contentful export\n");
  }

  // ----------------------------------------
  // PHASE 7: INSERT ARTICLES
  // ----------------------------------------
  console.log("PHASE 7: Migrating Articles...\n");

  const articles = getEntriesByType("article");
  let migratedArticles = 0;
  let skippedArticles = 0;

  for (const article of articles) {
    const fields = article.fields;
    const slug = fields.slug.fr as string;

    // Get profile relationship
    const profileLink = fields.profile.fr as { sys: { id: string } };
    const profilePayloadId = profileIdMap.get(profileLink.sys.id);

    // Get image relationship
    const imgLink = fields.img.fr as { sys: { id: string } };
    const imgMediaId = assetIdMap.get(imgLink.sys.id);

    if (!profilePayloadId) {
      console.log(`  Skipped: ${slug} (profile not found)`);
      skippedArticles++;
      continue;
    }

    if (!imgMediaId) {
      console.log(`  Skipped: ${slug} (image not found)`);
      skippedArticles++;
      continue;
    }

    try {
      const materialValue = fields.material?.fr as string | undefined;
      const statusValue = fields.status.fr as string;

      await payload.create({
        collection: "articles",
        data: {
          title: fields.title.fr as string,
          slug: slug,
          img: imgMediaId,
          description: (fields.description?.fr as string) || null,
          profile: profilePayloadId,
          material: materialValue ? MATERIAL_MAP[materialValue] || null : null,
          status: STATUS_MAP[statusValue] || "in_stock",
          startDate: (fields.startDate?.fr as string) || null,
          endDate: (fields.endDate?.fr as string) || null,
          url: fields.url.fr as string,
          additionalUrl: (fields.additionalUrl?.fr as string) || null,
          affiliateUrl: (fields.affiliateUrl?.fr as string) || null,
          warningText: (fields.warningText?.fr as string) || null,
          isNew: (fields.isNew?.fr as boolean) ?? false,
        },
        req,
      });

      migratedArticles++;

      if (migratedArticles % 50 === 0) {
        console.log(`  ... ${migratedArticles}/${articles.length} migrated`);
      }
    } catch (error) {
      console.log(
        `  Failed: ${slug} - ${error instanceof Error ? error.message : error}`,
      );
      skippedArticles++;
    }
  }

  console.log(`\n  Migrated: ${migratedArticles}`);
  console.log(`  Skipped: ${skippedArticles}\n`);

  // ----------------------------------------
  // SUMMARY
  // ----------------------------------------
  console.log("=".repeat(60));
  console.log("  MIGRATION COMPLETE");
  console.log("=".repeat(60));
  console.log(`  Media:           ${assetIdMap.size}`);
  console.log(`  Keycap Profiles: ${profileIdMap.size}`);
  console.log(`  Social Networks: ${socialNetworks.length}`);
  console.log(`  Articles:        ${migratedArticles}`);
  console.log("=".repeat(60) + "\n");
}

// ============================================
// MIGRATION DOWN
// ============================================

export async function down({
  db,
}: MigrateDownArgs): Promise<void> {
  console.log("\n" + "=".repeat(60));
  console.log("  ROLLING BACK CONTENTFUL DATA MIGRATION");
  console.log("=".repeat(60) + "\n");

  await db.run(sql`PRAGMA foreign_keys = OFF;`);

  const tablesToPurge = [
    "search_rels",
    "search",
    "homepage_rels",
    "articles",
    "keycap_profiles",
    "social_networks_networks",
    "media",
  ];

  for (const table of tablesToPurge) {
    try {
      await db.run(sql.raw(`DELETE FROM "${table}";`));
      console.log(`  Purged: ${table}`);
    } catch (error) {
      console.log(`  Skipped: ${table}`);
    }
  }

  await db.run(sql`PRAGMA foreign_keys = ON;`);

  console.log("\n  Rollback complete\n");
}
