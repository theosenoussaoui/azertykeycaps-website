import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import vanillaExtract from 'astro-vanilla-extract';
import sitemap from '@astrojs/sitemap';
import AstroPWA from '@vite-pwa/astro';

import vercel from '@astrojs/vercel/serverless';

// https://astro.build/config
export default defineConfig({
  integrations: [vanillaExtract(), sitemap(), preact(), AstroPWA()],
  output: 'server',
  site: 'https://azertykeycaps.fr',
  adapter: vercel({})
});
