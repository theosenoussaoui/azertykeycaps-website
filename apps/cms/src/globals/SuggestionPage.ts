import type { GlobalConfig } from "payload";
import { isAuthenticated } from "../access/authenticated";
import { globalAfterChangeHook } from "../hooks/cache-invalidation";

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
    {
      name: "formEnabled",
      type: "checkbox",
      label: { fr: "Formulaire activé", en: "Form Enabled" },
      defaultValue: false,
      admin: {
        description: {
          fr: "Active ou désactive le formulaire de suggestion",
          en: "Enable or disable the suggestion form",
        },
      },
    },
    {
      name: "seo",
      type: "group",
      label: { fr: "SEO", en: "SEO" },
      fields: [
        {
          name: "metaTitle",
          type: "text",
          label: { fr: "Titre Meta", en: "Meta Title" },
        },
        {
          name: "metaDescription",
          type: "textarea",
          label: { fr: "Description Meta", en: "Meta Description" },
        },
      ],
    },
  ],
};
