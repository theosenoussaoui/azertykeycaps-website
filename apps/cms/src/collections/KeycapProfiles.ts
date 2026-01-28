import type { CollectionConfig, FieldHook } from "payload";
import slugify from "slugify";

import { isAuthenticated } from "@/access/authenticated";
import { isAdminOrApi, isAdminOrEditorOrApi } from "@/access/roles";
import { PROFILE_SHAPES } from "@/constants";

/**
 * Auto-generates a slug from the title field.
 * Only generates on create, not on update (to preserve existing slugs).
 */
const generateSlugFromTitle: FieldHook = ({ data, operation, value }) => {
  if (operation === "create" && !value && data?.title) {
    return slugify(data.title, {
      lower: true,
      strict: true,
      locale: "fr",
    });
  }
  return value;
};
import {
  collectionAfterChangeHook,
  collectionAfterDeleteHook,
} from "@/hooks/cache-invalidation";

export const KeycapProfiles: CollectionConfig = {
  slug: "keycap-profiles",
  labels: {
    singular: { fr: "Profil de keycap", en: "Keycap Profile" },
    plural: { fr: "Profils de keycap", en: "Keycap Profiles" },
  },
  defaultPopulate: {
    id: true,
    title: true,
    slug: true,
    abbreviation: true,
    navbarDescription: true,
    shape: true,
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "abbreviation", "shape"],
    listSearchableFields: ["title", "slug", "abbreviation"],
    group: { fr: "Contenu", en: "Content" },
  },
  access: {
    create: isAdminOrEditorOrApi,
    read: isAuthenticated,
    update: isAdminOrEditorOrApi,
    delete: isAdminOrApi,
  },
  hooks: {
    afterChange: [collectionAfterChangeHook],
    afterDelete: [collectionAfterDeleteHook],
  },
  fields: [
    {
      type: "tabs",
      tabs: [
        {
          label: { fr: "Informations", en: "Information" },
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
                  name: "abbreviation",
                  type: "text",
                  required: true,
                  label: { fr: "Abréviation", en: "Abbreviation" },
                  admin: {
                    width: "50%",
                    description: {
                      fr: "Ex: SA, DSA, Cherry, etc.",
                      en: "E.g.: SA, DSA, Cherry, etc.",
                    },
                  },
                },
              ],
            },
            {
              name: "slug",
              type: "text",
              required: true,
              unique: true,
              index: true,
              label: { fr: "Slug", en: "Slug" },
              hooks: {
                beforeValidate: [generateSlugFromTitle],
              },
              admin: {
                readOnly: true,
                description: {
                  fr: "Identifiant URL unique (généré automatiquement depuis le titre)",
                  en: "Unique URL identifier (auto-generated from title)",
                },
                components: {
                  Field: "@/components/fields/SlugField#SlugField",
                },
              },
            },
            {
              name: "description",
              type: "textarea",
              label: { fr: "Description", en: "Description" },
            },
            {
              name: "thumbnail",
              type: "upload",
              relationTo: "media",
              label: { fr: "Miniature", en: "Thumbnail" },
            },
          ],
        },
        {
          label: { fr: "Navigation", en: "Navigation" },
          fields: [
            {
              type: "ui",
              name: "navInfo",
              admin: {
                components: {
                  Field: "@/components/fields/InfoPanel#NavInfoPanel",
                },
              },
            },
            {
              name: "navbarDescription",
              type: "text",
              required: true,
              label: { fr: "Description navbar", en: "Navbar Description" },
              admin: {
                description: {
                  fr: "Courte description pour le menu de navigation",
                  en: "Short description for the navigation menu",
                },
              },
            },
            {
              name: "navbarIconName",
              type: "text",
              label: { fr: "Nom de l'icône navbar", en: "Navbar Icon Name" },
              admin: {
                description: {
                  fr: "Nom de l'icône Lucide pour le menu",
                  en: "Lucide icon name for the menu",
                },
              },
            },
          ],
        },
      ],
    },
    {
      name: "shape",
      type: "select",
      required: true,
      label: { fr: "Forme", en: "Shape" },
      admin: {
        position: "sidebar",
      },
      options: [
        {
          label: { fr: "Sculpté", en: "Sculpted" },
          value: PROFILE_SHAPES.SCULPTED,
        },
        {
          label: { fr: "Uniforme", en: "Uniform" },
          value: PROFILE_SHAPES.UNIFORM,
        },
      ],
    },
  ],
};
