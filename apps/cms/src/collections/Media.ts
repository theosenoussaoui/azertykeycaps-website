import type { CollectionConfig } from "payload";

import { collectionAfterChangeHook, collectionAfterDeleteHook } from "../hooks/cache-invalidation";

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    // Media files remain public - they're served via proxy and need to be accessible
    // The actual file URLs are hidden behind the server's /api/media/* proxy
    read: () => true,
  },
  // When media is populated from relationships, include filename for URL generation
  // and sizes for responsive images
  defaultPopulate: {
    id: true,
    alt: true,
    url: true,
    filename: true, // Required for Payload to construct correct URLs
    width: true,
    height: true,
    sizes: true,
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
    imageSizes: [
      {
        name: "thumbnail",
        width: 400,
        height: 225, // 16:9 aspect ratio
        position: "centre",
      },
      {
        name: "card",
        width: 768,
        height: 432, // 16:9 aspect ratio
        position: "centre",
      },
      {
        name: "hero",
        width: 1200,
        height: 675, // 16:9 aspect ratio - optimized for article detail pages
        position: "centre",
      },
    ],
    formatOptions: {
      format: "webp",
      options: {
        quality: 80,
      },
    },
    adminThumbnail: "thumbnail",
    mimeTypes: ["image/*"],
  },
};
