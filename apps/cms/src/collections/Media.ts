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
  upload: true,
};
