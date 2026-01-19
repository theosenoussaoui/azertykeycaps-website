import { createFileRoute } from "@tanstack/react-router";

import { siteConfig } from "@/lib/seo";

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async () => {
        const siteUrl = siteConfig.url;

        const robots = `# Azertykeycaps Robots.txt
# ${siteUrl}

User-agent: *
Allow: /

# Private routes
Disallow: /dashboard
Disallow: /login
Disallow: /api/

# AI crawlers (LLMO - LLM Optimization)
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Amazonbot
Allow: /

# Sitemap
Sitemap: ${siteUrl}/sitemap.xml
`;

        return new Response(robots, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=86400, s-maxage=86400",
          },
        });
      },
    },
  },
});
