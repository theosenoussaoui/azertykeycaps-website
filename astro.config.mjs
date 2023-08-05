import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import compress from 'astro-compress';
import vanillaExtract from 'astro-vanilla-extract';
import sitemap from '@astrojs/sitemap';

import vercel from '@astrojs/vercel/serverless';

// https://astro.build/config
export default defineConfig({
  integrations: [vanillaExtract(), compress(), sitemap(), preact()],
  output: 'server',
  site: 'https://azertykeycaps.fr',
  adapter: vercel(),
  experimental: {
    viewTransitions: true
  }
});
