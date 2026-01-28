import type { GlobalConfig } from "payload";

import { isAuthenticated } from "@/access/authenticated";
import { isAdminOrEditorOrApi } from "@/access/roles";
import { globalAfterChangeHook } from "@/hooks/cache-invalidation";

export const Homepage: GlobalConfig = {
  slug: "homepage",
  label: { fr: "Page d'accueil", en: "Homepage" },
  admin: {
    group: { fr: "Pages", en: "Pages" },
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
            },
            {
              name: "subtitle",
              type: "text",
              required: true,
              label: { fr: "Sous-titre", en: "Subtitle" },
              admin: {
                description: {
                  fr: "Texte affiché sous le titre principal",
                  en: "Text displayed below the main title",
                },
              },
            },
          ],
        },
        {
          label: { fr: "Profils", en: "Profiles" },
          fields: [
            {
              type: "ui",
              name: "profilesInfo",
              admin: {
                components: {
                  Field: "@/components/fields/InfoPanel#ProfilesInfoPanel",
                },
              },
            },
            {
              name: "profileCards",
              type: "relationship",
              relationTo: "keycap-profiles",
              hasMany: true,
              label: { fr: "Profils en vedette", en: "Featured Profiles" },
              admin: {
                description: {
                  fr: "Profils affichés sur la page d'accueil",
                  en: "Profiles displayed on the homepage",
                },
              },
            },
          ],
        },
      ],
    },
  ],
};
