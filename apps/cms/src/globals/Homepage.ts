import type { GlobalConfig } from "payload";

export const Homepage: GlobalConfig = {
  slug: "homepage",
  label: { fr: "Page d'accueil", en: "Homepage" },
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
    },
    {
      name: "description",
      type: "textarea",
      required: true,
      label: { fr: "Description", en: "Description" },
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
};
