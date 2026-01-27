import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

import type { CloudflareContext } from "@opennextjs/cloudflare";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { sqliteD1Adapter } from "@payloadcms/db-d1-sqlite";
import { searchPlugin } from "@payloadcms/plugin-search";
import { seoPlugin } from "@payloadcms/plugin-seo";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { r2Storage } from "@payloadcms/storage-r2";
import { en } from "@payloadcms/translations/languages/en";
import { fr } from "@payloadcms/translations/languages/fr";
import { buildConfig } from "payload";
import type { GetPlatformProxyOptions } from "wrangler";

import { Articles } from "./collections/Articles";
import { KeycapProfiles } from "./collections/KeycapProfiles";
import { Media } from "./collections/Media";
// Collections
import { Users } from "./collections/Users";
// Globals
import { Homepage } from "./globals/Homepage";
import { InformationsPage } from "./globals/InformationsPage";
import { NotFoundPage } from "./globals/NotFoundPage";
import { SocialNetworks } from "./globals/SocialNetworks";
import { SuggestionPage } from "./globals/SuggestionPage";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

// Helper to safely check if a path resolves to payload CLI
const realpath = (value: string) => {
  try {
    return fs.existsSync(value) ? fs.realpathSync(value) : undefined;
  } catch {
    return undefined;
  }
};

// Detect if running from Payload CLI (migrations, generate:types, etc.)
const isCLI = process.argv.some((value) => {
  const resolved = realpath(value);
  return resolved?.endsWith(path.join("payload", "bin.js"));
});
const isProduction = process.env.NODE_ENV === "production";

// Get Cloudflare context (bindings: D1, R2, secrets)
// - In CLI mode or dev: use Wrangler's getPlatformProxy for local bindings
// - In production: use OpenNext's getCloudflareContext for Worker bindings
const cloudflare: CloudflareContext =
  isCLI || !isProduction
    ? await getCloudflareContextFromWrangler()
    : await getCloudflareContext({ async: true });

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  i18n: {
    supportedLanguages: { fr, en },
    fallbackLanguage: "fr",
  },
  collections: [Users, Media, Articles, KeycapProfiles],
  globals: [
    Homepage,
    SocialNetworks,
    InformationsPage,
    SuggestionPage,
    NotFoundPage,
  ],
  editor: lexicalEditor(),
  secret:
    process.env.PAYLOAD_SECRET || (cloudflare.env as any).PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: sqliteD1Adapter({
    binding: (cloudflare.env as any).D1,
    // Disable push mode - use migrations only
    // This prevents conflicts when dev mode tries to sync schema
    push: false,
  }),
  // Note: sharp is not available on Cloudflare Workers
  // Image processing disabled - originals served directly
  plugins: [
    r2Storage({
      bucket: (cloudflare.env as any).R2,
      collections: { media: true },
    }),
    searchPlugin({
      collections: ["articles", "keycap-profiles"],
      defaultPriorities: {
        articles: 10,
        "keycap-profiles": 20, // Profiles appear first in results
      },
      // Store slug directly in search records for navigation
      beforeSync: ({ originalDoc, searchDoc }) => ({
        ...searchDoc,
        slug: originalDoc.slug,
      }),
      // Add slug field to search collection
      searchOverrides: {
        fields: ({ defaultFields }) => [
          ...defaultFields,
          {
            name: "slug",
            type: "text",
            index: true,
          },
        ],
      },
    }),
    seoPlugin({
      collections: ["articles", "keycap-profiles"],
      globals: [
        "homepage",
        "informations-page",
        "suggestion-page",
        "not-found-page",
      ],
      uploadsCollection: "media",
      tabbedUI: true,
      generateTitle: ({ doc }) => (doc as { title?: string })?.title ?? "",
      generateDescription: ({ doc }) =>
        (doc as { description?: string })?.description ??
        (doc as { subtitle?: string })?.subtitle ??
        "",
      generateURL: ({ doc, collectionSlug, globalSlug }) => {
        const baseUrl =
          (cloudflare.env as { WEB_URL?: string })?.WEB_URL ??
          "https://azertykeycaps.fr";
        const slug = (doc as { slug?: string })?.slug;

        if (collectionSlug === "articles" && slug) {
          return `${baseUrl}/articles/${slug}`;
        }
        if (collectionSlug === "keycap-profiles" && slug) {
          return `${baseUrl}/profile/${slug}`;
        }
        if (globalSlug === "homepage") {
          return baseUrl;
        }
        if (globalSlug === "informations-page") {
          return `${baseUrl}/about`;
        }
        if (globalSlug === "suggestion-page") {
          return `${baseUrl}/suggest`;
        }
        if (globalSlug === "not-found-page") {
          return `${baseUrl}/404`;
        }
        return baseUrl;
      },
    }),
  ],
});

/**
 * Get Cloudflare context from Wrangler for local development and CLI operations
 * Adapted from OpenNext's internal implementation
 */
function getCloudflareContextFromWrangler(): Promise<CloudflareContext> {
  // Dynamic import to avoid bundling wrangler in production
  // The string manipulation prevents webpack from resolving this at build time
  return import(
    /* webpackIgnore: true */ `${"__wrangler".replaceAll("_", "")}`
  ).then(({ getPlatformProxy }) =>
    getPlatformProxy({
      environment: process.env.CLOUDFLARE_ENV,
      // Use remote bindings in production mode (for migrations against deployed D1)
      remoteBindings: isProduction,
    } satisfies GetPlatformProxyOptions),
  );
}
