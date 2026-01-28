import type { CollectionConfig } from "payload";

import { isAdmin } from "@/access/roles";

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
  access: {
    // Only admins can manage users
    create: isAdmin,
    read: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    // Email added by default
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "admin",
      // Store role in JWT to avoid database lookups on every request
      saveToJWT: true,
      options: [
        { label: "Admin", value: "admin" },
        { label: "API", value: "api" },
        { label: "Editor", value: "editor" },
      ],
      admin: {
        description:
          "Admin: full access | Editor: create/update content, no delete | API: server integrations",
      },
    },
  ],
};
