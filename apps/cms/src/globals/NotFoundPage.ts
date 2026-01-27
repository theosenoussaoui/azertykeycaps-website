import type { GlobalConfig } from "payload";

import { isAuthenticated } from "@/access/authenticated";
import { globalAfterChangeHook } from "@/hooks/cache-invalidation";

export const NotFoundPage: GlobalConfig = {
  slug: "not-found-page",
  label: { fr: "Page 404", en: "404 Page" },
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
              defaultValue: "404",
              admin: {
                description: {
                  fr: "Titre affiché sur la page 404 (généralement '404')",
                  en: "Title displayed on the 404 page (typically '404')",
                },
              },
            },
            {
              name: "description",
              type: "textarea",
              required: true,
              label: { fr: "Description", en: "Description" },
              defaultValue:
                "Page not found. The page you're looking for doesn't exist or has been moved.",
              admin: {
                description: {
                  fr: "Message d'erreur affiché sous le titre",
                  en: "Error message displayed below the title",
                },
              },
            },
            {
              name: "ctaText",
              type: "text",
              required: true,
              label: { fr: "Texte du bouton", en: "Button Text" },
              defaultValue: "Back to Home",
              admin: {
                description: {
                  fr: "Texte du bouton de retour à l'accueil",
                  en: "Text for the back to home button",
                },
              },
            },
          ],
        },
      ],
    },
  ],
};
