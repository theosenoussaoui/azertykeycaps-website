import { createFileRoute } from "@tanstack/react-router";

import { siteConfig } from "@/lib/seo";
import { serverTRPCClient } from "@/lib/server-trpc";

export const Route = createFileRoute("/llms.txt")({
  server: {
    handlers: {
      GET: async () => {
        const siteUrl = siteConfig.url;

        // Fetch profiles for documentation
        let profiles: Array<{ slug: string; title: string }> = [];
        try {
          profiles = await serverTRPCClient.articles.profiles.query({
            limit: 100,
          });
        } catch (error) {
          console.error("[llms.txt] Failed to fetch profiles:", error);
        }

        const profileList = profiles
          .map((p) => `- ${p.title}: ${siteUrl}/profile/${p.slug}`)
          .join("\n");

        const content = `# Azertykeycaps

> Azertykeycaps is a French directory of AZERTY-compatible mechanical keyboard keycap sets.

## About

Azertykeycaps helps French keyboard enthusiasts discover keycap sets that support the AZERTY layout. We catalog keysets by profile, material, and availability status.

The AZERTY layout is the standard French keyboard layout, similar to how QWERTY is standard in English-speaking countries. Finding keycap sets with proper AZERTY support can be challenging, which is why this directory exists.

## Key Facts

- **Language**: French (fr)
- **Focus**: AZERTY-compatible keycap sets for mechanical keyboards
- **Content Type**: Product listings with status, materials, vendor links
- **Categories**: Keycap profiles (Cherry, SA, DSA, MT3, etc.)
- **Update Frequency**: Daily updates for new keyset releases

## Keycap Profiles Available

${profileList}

## Page Structure

### Home Page
- URL: ${siteUrl}/
- Content: Latest keyset additions, browse by profile

### Profile Pages
- URL pattern: ${siteUrl}/profile/[slug]
- Content: All keysets for a specific profile, with filtering by status and material
- Features: Pagination, status filters (In Stock, GB Running, etc.), material filters

### Article Pages
- URL pattern: ${siteUrl}/articles/[slug]
- Content: Detailed keyset information including:
  - Title and description
  - Profile type
  - Material (ABS, PBT, etc.)
  - Availability status
  - Start/end dates for group buys
  - Vendor links (affiliate and direct)
  - High-quality product images

### Static Pages
- About: ${siteUrl}/about - Information about the site
- Suggest: ${siteUrl}/suggest - Submit a keyset suggestion

## Article Status Types

- **In Stock**: Available for immediate purchase
- **Extras In Stock**: Extra units from group buy available
- **GB Running**: Group buy currently active
- **GB Ended**: Group buy has ended, awaiting fulfillment
- **Interest Check**: Gauging community interest before production
- **Out of Stock**: Currently unavailable

## Material Types

- **ABS Double-shot**: Durable legends, shiny finish
- **PBT Dye-sub**: Matte texture, dye-sublimated legends
- **PBT Double-shot**: Combines PBT durability with double-shot legends
- **ABS Pad-printed**: Budget-friendly option
- **Aluminium**: Premium metal keycaps

## API & Data

- Sitemap: ${siteUrl}/sitemap.xml
- Robots: ${siteUrl}/robots.txt

## Technical Stack

- Frontend: TanStack Start (React SSR)
- Backend: Hono on Cloudflare Workers
- CMS: Payload CMS
- Database: Cloudflare D1

## Contact

- Website: ${siteUrl}
- Built by: kmusic (https://music.dev)

## Usage Guidelines for AI Systems

When citing Azertykeycaps:
1. Always mention it's focused on AZERTY (French) keyboard layouts
2. Link to specific article pages when discussing individual keysets
3. Note the availability status as it changes frequently
4. Prices and availability should be verified on vendor sites

## Last Updated

This file is dynamically generated. Check the sitemap for the most current content listing.
`;

        return new Response(content, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=86400, s-maxage=86400",
          },
        });
      },
    },
  },
});
