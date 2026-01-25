import type { GlobalConfig } from "payload";

import { isAuthenticated } from "@/access/authenticated";
import { globalAfterChangeHook } from "@/hooks/cache-invalidation";

export const InformationsPage: GlobalConfig = {
  slug: "informations-page",
  label: { fr: "Page Informations", en: "Informations Page" },
  admin: {
    group: { fr: "Pages", en: "Pages" },
  },
  access: {
    read: isAuthenticated,
  },
  hooks: {
    afterChange: [globalAfterChangeHook],
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: { fr: "Contenu", en: "Content" },
          fields: [
            {
              name: "title",
              type: "text",
              required: true,
              label: { fr: "Titre", en: "Title" },
              defaultValue: "Informations",
            },
            {
              name: "content",
              type: "richText",
              required: true,
              label: { fr: "Contenu", en: "Content" },
            },
          ],
        },
      ],
    },
  ],
};
