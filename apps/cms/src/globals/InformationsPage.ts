import type { GlobalConfig } from "payload";

export const InformationsPage: GlobalConfig = {
  slug: "informations-page",
  label: { fr: "Page Informations", en: "Informations Page" },
  admin: {
    group: { fr: "Pages", en: "Pages" },
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
      defaultValue: "Informations",
    },
    {
      name: "content",
      type: "richText",
      required: true,
      label: { fr: "Contenu", en: "Content" },
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
