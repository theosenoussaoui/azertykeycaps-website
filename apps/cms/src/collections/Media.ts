import type { CollectionConfig } from "payload";
import { collectionAfterChangeHook, collectionAfterDeleteHook } from "../hooks/cache-invalidation";

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    // Media files remain public - they're served via proxy and need to be accessible
    // The actual file URLs are hidden behind the server's /api/media/* proxy
    read: () => true,
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
