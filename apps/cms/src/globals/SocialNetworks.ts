import type { GlobalConfig } from "payload";

import { isAuthenticated } from "@/access/authenticated";
import { isAdminOrEditorOrApi } from "@/access/roles";
import { globalAfterChangeHook } from "@/hooks/cache-invalidation";

export const SocialNetworks: GlobalConfig = {
  slug: "social-networks",
  label: { fr: "Réseaux sociaux", en: "Social Networks" },
  admin: {
    group: { fr: "Configuration", en: "Settings" },
  },
  access: {
    read: isAuthenticated,
    update: isAdminOrEditorOrApi,
  },
  hooks: {
    afterChange: [globalAfterChangeHook],
  },
  fields: [
    {
      type: "ui",
      name: "socialInfo",
      admin: {
        components: {
          Field: "@/components/fields/InfoPanel#SocialInfoPanel",
        },
      },
    },
    {
      name: "networks",
      type: "array",
      label: { fr: "Réseaux", en: "Networks" },
      admin: {
        initCollapsed: false,
      },
      fields: [
        {
          type: "row",
          fields: [
            {
              name: "title",
              type: "text",
              required: true,
              label: { fr: "Titre", en: "Title" },
              admin: {
                width: "50%",
              },
            },
            {
              name: "iconText",
              type: "text",
              label: { fr: "Icône", en: "Icon" },
              admin: {
                width: "50%",
                description: {
                  fr: "Nom de l'icône Lucide",
                  en: "Lucide icon name",
                },
              },
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
    },
  ],
};
