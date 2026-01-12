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
        // Disable prerendering until API is live
        // Pages that fetch from API during build will fail otherwise
        enabled: false,
      },
    }),
    viteReact(),
    alchemy(),
  ],
  server: {
    port: 3001,
  },
});
