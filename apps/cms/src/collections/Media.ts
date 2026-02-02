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
    read: () => true,
    update: isAdminOrEditorOrApi,
    delete: isAdminOrApi,
  },
  defaultPopulate: {
    id: true,
    alt: true,
    url: true,
    filename: true,
    width: true,
    height: true,
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
    crop: false,
    focalPoint: false,
    mimeTypes: ["image/*"],
  },
};
