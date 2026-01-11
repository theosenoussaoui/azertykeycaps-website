import type { CollectionConfig } from "payload";

import { WEBSITE_CATEGORIES } from "@azertykeycaps-app/schemas";

export const DropshippingWebsites: CollectionConfig = {
  slug: "dropshipping-websites",
  labels: {
    singular: { fr: "Site dropshipping", en: "Dropshipping Website" },
    plural: { fr: "Sites dropshipping", en: "Dropshipping Websites" },
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "categories", "updatedAt"],
    listSearchableFields: ["title", "slug"],
    group: { fr: "Dropshipping", en: "Dropshipping" },
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      label: { fr: "Titre", en: "Title" },
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      label: { fr: "Slug", en: "Slug" },
    },
    {
      name: "banner",
      type: "upload",
      relationTo: "media",
      label: { fr: "Bannière", en: "Banner" },
    },
    {
      name: "description",
      type: "textarea",
      label: { fr: "Description", en: "Description" },
    },
    {
      name: "examples",
      type: "textarea",
      label: { fr: "Exemples", en: "Examples" },
      admin: {
        description: {
          fr: "Exemples de produits disponibles sur ce site",
          en: "Examples of products available on this site",
        },
      },
    },
    {
      name: "categories",
      type: "select",
      hasMany: true,
      label: { fr: "Catégories", en: "Categories" },
      options: [
        {
          label: { fr: "Accessoires", en: "Accessories" },
          value: WEBSITE_CATEGORIES.ACCESSORIES,
        },
        {
          label: { fr: "Artisans", en: "Artisans" },
          value: WEBSITE_CATEGORIES.ARTISANS,
        },
        {
          label: { fr: "Claviers", en: "Keyboards" },
          value: WEBSITE_CATEGORIES.KEYBOARDS,
        },
        {
          label: { fr: "Câbles", en: "Cables" },
          value: WEBSITE_CATEGORIES.CABLES,
        },
        {
          label: { fr: "Keycaps", en: "Keycaps" },
          value: WEBSITE_CATEGORIES.KEYCAPS,
        },
        {
          label: { fr: "PCB", en: "PCB" },
          value: WEBSITE_CATEGORIES.PCB,
        },
        {
          label: { fr: "Plates", en: "Plates" },
          value: WEBSITE_CATEGORIES.PLATES,
        },
        {
          label: { fr: "Switches", en: "Switches" },
          value: WEBSITE_CATEGORIES.SWITCHES,
        },
      ],
    },
    {
      name: "url",
      type: "text",
      required: true,
      label: { fr: "URL", en: "URL" },
    },
  ],
};
