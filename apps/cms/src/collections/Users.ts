import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  admin: {
    useAsTitle: "email",
  },
  auth: {
    // Enable API key authentication for server-to-CMS communication
    // API keys are encrypted in the database
    useAPIKey: true,
  },
  fields: [
    // Email added by default
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "admin",
      options: [
        { label: "Admin", value: "admin" },
        { label: "API", value: "api" },
      ],
      admin: {
        description: "API role is for server integrations using API keys",
      },
    },
  ],
};
