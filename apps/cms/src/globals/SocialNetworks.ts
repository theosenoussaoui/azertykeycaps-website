import type { GlobalConfig } from "payload";
import { globalAfterChangeHook } from "../hooks/cache-invalidation";

export const SocialNetworks: GlobalConfig = {
  slug: "social-networks",
  label: { fr: "Réseaux sociaux", en: "Social Networks" },
  admin: {
    group: { fr: "Configuration", en: "Settings" },
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [globalAfterChangeHook],
  },
  fields: [
    {
      name: "networks",
      type: "array",
      label: { fr: "Réseaux", en: "Networks" },
      fields: [
        {
          name: "title",
          type: "text",
          required: true,
          label: { fr: "Titre", en: "Title" },
        },
        {
          name: "url",
          type: "text",
          required: true,
          label: { fr: "URL", en: "URL" },
        },
        {
          name: "iconText",
          type: "text",
          label: { fr: "Texte de l'icône", en: "Icon Text" },
          admin: {
            description: {
              fr: "Nom de l'icône Lucide",
              en: "Lucide icon name",
            },
          },
        },
      ],
    },
  ],
};
