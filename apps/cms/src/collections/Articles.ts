import type { CollectionConfig } from "payload";

import { ARTICLE_MATERIALS, ARTICLE_STATUS } from "@azertykeycaps-app/schemas";
import { collectionAfterChangeHook, collectionAfterDeleteHook } from "../hooks/cache-invalidation";
import { isAuthenticated } from "../access/authenticated";

export const Articles: CollectionConfig = {
  slug: "articles",
  labels: {
    singular: { fr: "Article", en: "Article" },
    plural: { fr: "Articles", en: "Articles" },
  },
  admin: {
    useAsTitle: "title",
    defaultColumns: ["title", "status", "profile", "isNew", "updatedAt"],
    listSearchableFields: ["title", "slug"],
    group: { fr: "Contenu", en: "Content" },
  },
  access: {
    read: isAuthenticated,
  },
  hooks: {
    afterChange: [collectionAfterChangeHook],
    afterDelete: [collectionAfterDeleteHook],
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      label: { fr: "Titre", en: "Title" },
    },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      label: { fr: "Slug", en: "Slug" },
      admin: {
        description: {
          fr: "Identifiant URL unique de l'article",
          en: "Unique URL identifier for the article",
        },
      },
    },
    {
      name: "img",
      type: "upload",
      relationTo: "media",
      required: true,
      label: { fr: "Image", en: "Image" },
    },
    {
      name: "profile",
      type: "relationship",
      relationTo: "keycap-profiles",
      required: true,
      label: { fr: "Profil", en: "Profile" },
    },
    {
      name: "material",
      type: "select",
      label: { fr: "Matériau", en: "Material" },
      options: [
        {
          label: { fr: "ABS Double-Shot", en: "ABS Double-Shot" },
          value: ARTICLE_MATERIALS.ABS_DOUBLE_SHOT,
        },
        {
          label: { fr: "ABS Pad-Printed", en: "ABS Pad-Printed" },
          value: ARTICLE_MATERIALS.ABS_PAD_PRINTED,
        },
        {
          label: { fr: "ABS Simple", en: "ABS Simple" },
          value: ARTICLE_MATERIALS.ABS_SIMPLE,
        },
        {
          label: { fr: "Aluminium", en: "Aluminium" },
          value: ARTICLE_MATERIALS.ALUMINIUM,
        },
        {
          label: { fr: "PBT Double-Shot", en: "PBT Double-Shot" },
          value: ARTICLE_MATERIALS.PBT_DOUBLE_SHOT,
        },
        {
          label: { fr: "PBT Dye-Sub", en: "PBT Dye-Sub" },
          value: ARTICLE_MATERIALS.PBT_DYE_SUB,
        },
        {
          label: { fr: "PBT Laser Printed", en: "PBT Laser Printed" },
          value: ARTICLE_MATERIALS.PBT_LASER_PRINTED,
        },
      ],
    },
    {
      name: "description",
      type: "textarea",
      label: { fr: "Description", en: "Description" },
    },
    {
      name: "status",
      type: "select",
      required: true,
      defaultValue: ARTICLE_STATUS.IN_STOCK,
      label: { fr: "Statut", en: "Status" },
      options: [
        {
          label: { fr: "En stock", en: "In Stock" },
          value: ARTICLE_STATUS.IN_STOCK,
        },
        {
          label: { fr: "Extras GB", en: "Extras GB" },
          value: ARTICLE_STATUS.EXTRAS_GB,
        },
        {
          label: { fr: "Extras In-Stock", en: "Extras In-Stock" },
          value: ARTICLE_STATUS.EXTRAS_IN_STOCK,
        },
        {
          label: { fr: "GB en cours", en: "GB Running" },
          value: ARTICLE_STATUS.GB_RUNNING,
        },
        {
          label: { fr: "GB terminé", en: "GB Ended" },
          value: ARTICLE_STATUS.GB_ENDED,
        },
        {
          label: { fr: "Interest Check", en: "Interest Check" },
          value: ARTICLE_STATUS.INTEREST_CHECK,
        },
        {
          label: { fr: "Rupture de stock", en: "Out Of Stock" },
          value: ARTICLE_STATUS.OUT_OF_STOCK,
        },
      ],
    },
    {
      name: "startDate",
      type: "date",
      label: { fr: "Date de début", en: "Start Date" },
      admin: {
        description: {
          fr: "Date de début du Group Buy",
          en: "Group Buy start date",
        },
      },
    },
    {
      name: "endDate",
      type: "date",
      label: { fr: "Date de fin", en: "End Date" },
      admin: {
        description: {
          fr: "Date de fin du Group Buy",
          en: "Group Buy end date",
        },
      },
    },
    {
      name: "url",
      type: "text",
      required: true,
      label: { fr: "URL", en: "URL" },
      admin: {
        description: {
          fr: "Lien vers le produit",
          en: "Link to the product",
        },
      },
    },
    {
      name: "additionalUrl",
      type: "text",
      label: { fr: "URL supplémentaire", en: "Additional URL" },
    },
    {
      name: "affiliateUrl",
      type: "text",
      label: { fr: "URL affilié", en: "Affiliate URL" },
    },
    {
      name: "warningText",
      type: "text",
      label: { fr: "Texte d'avertissement", en: "Warning Text" },
      admin: {
        description: {
          fr: "Message d'avertissement affiché sur la carte",
          en: "Warning message displayed on the card",
        },
      },
    },
    {
      name: "isNew",
      type: "checkbox",
      defaultValue: false,
      label: { fr: "Nouveau", en: "New" },
      admin: {
        description: {
          fr: "Affiche un badge 'Nouveau' sur l'article",
          en: "Displays a 'New' badge on the article",
        },
      },
    },
  ],
};
