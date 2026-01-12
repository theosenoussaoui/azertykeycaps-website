import type { GlobalConfig } from "payload";
import { globalAfterChangeHook } from "../hooks/cache-invalidation";

export const DropshippingInfoPage: GlobalConfig = {
  slug: "dropshipping-info-page",
  label: { fr: "Page info dropshipping", en: "Dropshipping Info Page" },
  admin: {
    group: { fr: "Dropshipping", en: "Dropshipping" },
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [globalAfterChangeHook],
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
    {
      name: "youtubeUrl",
      type: "text",
      label: { fr: "URL YouTube", en: "YouTube URL" },
      admin: {
        description: {
          fr: "Lien vers une vidéo explicative",
          en: "Link to an explanatory video",
        },
      },
    },
  ],
};
