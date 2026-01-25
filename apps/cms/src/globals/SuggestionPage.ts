import type { GlobalConfig } from "payload";

import { isAuthenticated } from "@/access/authenticated";
import { globalAfterChangeHook } from "@/hooks/cache-invalidation";

export const SuggestionPage: GlobalConfig = {
  slug: "suggestion-page",
  label: { fr: "Page Suggestion", en: "Suggestion Page" },
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
              defaultValue: "Suggérez un keyset !",
            },
            {
              name: "description",
              type: "textarea",
              required: true,
              label: { fr: "Description", en: "Description" },
              defaultValue:
                "Vous avez un keyset en tête qui n'est pas présent sur le site ? Vous pouvez le suggérer ici, et nous l'ajouterons si il correspond aux critères de sélection.",
            },
          ],
        },
      ],
    },
    {
      name: "formEnabled",
      type: "checkbox",
      label: { fr: "Formulaire activé", en: "Form Enabled" },
      defaultValue: false,
      admin: {
        position: "sidebar",
        description: {
          fr: "Active ou désactive le formulaire de suggestion",
          en: "Enable or disable the suggestion form",
        },
      },
    },
  ],
};
