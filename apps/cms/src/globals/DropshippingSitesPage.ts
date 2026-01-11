import type { GlobalConfig } from "payload";

export const DropshippingSitesPage: GlobalConfig = {
  slug: "dropshipping-sites-page",
  label: { fr: "Page sites dropshipping", en: "Dropshipping Sites Page" },
  admin: {
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
      name: "description",
      type: "textarea",
      required: true,
      label: { fr: "Description", en: "Description" },
    },
  ],
};
