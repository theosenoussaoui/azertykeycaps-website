import { sqliteAdapter } from "@payloadcms/db-sqlite";
import { vercelBlobStorage } from "@payloadcms/storage-vercel-blob";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { fr } from "@payloadcms/translations/languages/fr";
import { en } from "@payloadcms/translations/languages/en";
import path from "path";
import { buildConfig } from "payload";
import { fileURLToPath } from "url";
import sharp from "sharp";

// Collections
import { Users } from "./collections/Users";
import { Media } from "./collections/Media";
import { Articles } from "./collections/Articles";
import { KeycapProfiles } from "./collections/KeycapProfiles";
import { DropshippingWebsites } from "./collections/DropshippingWebsites";

// Globals
import { Homepage } from "./globals/Homepage";
import { SocialNetworks } from "./globals/SocialNetworks";
import { DropshippingInfoPage } from "./globals/DropshippingInfoPage";
import { DropshippingSitesPage } from "./globals/DropshippingSitesPage";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

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
  collections: [Users, Media, Articles, KeycapProfiles, DropshippingWebsites],
  globals: [Homepage, SocialNetworks, DropshippingInfoPage, DropshippingSitesPage],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URL || "file:./payload.db",
      authToken: process.env.DATABASE_AUTH_TOKEN,
    },
  }),
  sharp,
  plugins: process.env.BLOB_READ_WRITE_TOKEN
    ? [
        vercelBlobStorage({
          collections: { media: true },
          token: process.env.BLOB_READ_WRITE_TOKEN,
        }),
      ]
    : [],
});
