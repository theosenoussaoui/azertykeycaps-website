import type { CollectionConfig } from "payload";

import { isAdminOrApi, isAdminOrEditorOrApi } from "@/access/roles";

import {
  collectionAfterChangeHook,
  collectionAfterDeleteHook,
} from "../hooks/cache-invalidation";

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    create: isAdminOrEditorOrApi,
    // Media files remain public - they're served via proxy and need to be accessible
    // The actual file URLs are hidden behind the server's /api/media/* proxy
    read: () => true,
    update: isAdminOrEditorOrApi,
    delete: isAdminOrApi,
  },
  // When media is populated from relationships, include filename for URL generation
  defaultPopulate: {
    id: true,
    alt: true,
    url: true,
    filename: true, // Required for Payload to construct correct URLs
    width: true,
    height: true,
    // Note: sizes removed - image processing disabled on Cloudflare Workers
  },
  hooks: {
    afterChange: [collectionAfterChangeHook],
    afterDelete: [collectionAfterDeleteHook],
  },
  fields: [
    {
      name: "alt",
      type: "text",
      required: true,
    },
  ],
  upload: {
    // Image resizing disabled - sharp is not available on Cloudflare Workers
    // Original images are served directly from R2
    // Consider using Cloudflare Images for on-the-fly transforms in the future
    crop: false,
    focalPoint: false,
    mimeTypes: ["image/*"],
  },
};
