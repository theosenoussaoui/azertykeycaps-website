import type { CollectionConfig } from "payload";
import { collectionAfterChangeHook, collectionAfterDeleteHook } from "../hooks/cache-invalidation";

export const Media: CollectionConfig = {
  slug: "media",
  access: {
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
