import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import alchemy from "alchemy/cloudflare/tanstack-start";

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    tailwindcss(),
    tanstackStart({
      prerender: {
        // Enable static prerendering
        enabled: true,
        // Auto-discover static paths (routes without dynamic params)
        autoStaticPathsDiscovery: true,
        // Crawl links from prerendered pages
        crawlLinks: false,
      },
    }),
    viteReact(),
    alchemy(),
  ],
  server: {
    port: 3001,
  },
});
