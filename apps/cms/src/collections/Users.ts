import type { CollectionConfig } from "payload";

import { isAdmin } from "@/access/roles";

export const Users: CollectionConfig = {
  slug: "users",
  admin: {
    useAsTitle: "email",
  },
  auth: {
    useAPIKey: true,
  },
  access: {
    create: isAdmin,
    read: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    {
      name: "role",
      type: "select",
      required: true,
      defaultValue: "admin",
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
