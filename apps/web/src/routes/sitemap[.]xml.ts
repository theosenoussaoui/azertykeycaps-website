import { createFileRoute } from "@tanstack/react-router";

import { siteConfig } from "@/lib/seo";
import { serverTRPCClient } from "@/lib/server-trpc";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const siteUrl = siteConfig.url;

        // Fetch all articles from CMS (paginate to get all)
        let articles: Array<{ slug: string; updatedAt?: string }> = [];
        let profiles: Array<{ slug: string }> = [];

        try {
          // Fetch profiles
          profiles = await serverTRPCClient.articles.profiles.query({
            limit: 100,
          });

          // Fetch articles with pagination (max 100 per request)
          let page = 1;
          let hasMore = true;
          while (hasMore) {
            const response = await serverTRPCClient.articles.list.query({
              limit: 100,
              page,
            });
            articles = [...articles, ...response.docs];
            hasMore = response.hasNextPage;
            page++;
            // Safety limit to prevent infinite loops
            if (page > 50) break;
          }
        } catch (error) {
          console.error("[sitemap] Failed to fetch data:", error);
        }

        const today = new Date().toISOString().split("T")[0];

        // Generate sitemap XML
        const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Static pages -->
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${siteUrl}/about</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${siteUrl}/suggest</loc>
    <changefreq>monthly</changefreq>
    <priority>0.3</priority>
  </url>

  <!-- Profile pages -->
${profiles
  .map(
    (profile) => `  <url>
    <loc>${siteUrl}/profile/${profile.slug}</loc>
    <changefreq>daily</changefreq>
    <priority>0.7</priority>
  </url>`,
  )
  .join("\n")}

  <!-- Article pages -->
${articles
  .map(
    (article) => `  <url>
    <loc>${siteUrl}/articles/${article.slug}</loc>
    <lastmod>${article.updatedAt ? new Date(article.updatedAt).toISOString().split("T")[0] : today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`;

        return new Response(sitemap, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=3600",
          },
        });
      },
    },
  },
});
