# Deployment Guide

This document describes how to set up GitHub Actions deployments for the azertykeycaps monorepo.

---

## DNS Setup (Cloudflare)

### Prerequisites

- Domain `azertykeycaps.fr` registered at OVH
- Cloudflare account (free tier is fine)
- Current site running on Vercel (will keep running during migration)

### Step 1: Add Domain to Cloudflare

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click **Add a site** → Enter `azertykeycaps.fr`
3. Select **Free plan**
4. Cloudflare will scan existing DNS records
5. Click **Continue to activation**
6. Copy the 2 nameservers Cloudflare provides (e.g., `adaline.ns.cloudflare.com`)

### Step 2: Update OVH Nameservers

1. Go to [OVH Dashboard](https://www.ovh.com/manager/)
2. Navigate to **Web Cloud** → **Domain names** → `azertykeycaps.fr`
3. Click **DNS Servers** tab → **Modify DNS servers**
4. Replace OVH nameservers with Cloudflare's
5. Save and wait 1-24 hours for propagation

### Step 3: Configure DNS Records (Gradual Migration)

After Cloudflare shows domain as **"Active"**, configure DNS:

| Type  | Name      | Content                                     | Proxy            | Purpose                       |
| ----- | --------- | ------------------------------------------- | ---------------- | ----------------------------- |
| CNAME | `@`       | `cname.vercel-dns.com`                      | DNS only (gray)  | Keep current Vercel site live |
| CNAME | `www`     | `azertykeycaps.fr`                          | Proxied (orange) | Redirect to root              |
| CNAME | `staging` | `azertykeycaps-app-web-prod.workers.dev`    | Proxied (orange) | **NEW** - Test new site       |
| CNAME | `api`     | `azertykeycaps-app-server-prod.workers.dev` | Proxied (orange) | **NEW** - Hono API            |
| CNAME | `cms`     | `cname.vercel-dns.com`                      | DNS only (gray)  | **NEW** - Payload CMS         |

> **Important:** Keep all MX records for email!

### Step 4: Configure Vercel Custom Domain for CMS

1. Vercel Dashboard → CMS Project → Settings → Domains
2. Add `cms.azertykeycaps.fr`
3. Vercel will verify the CNAME automatically

### Step 5: Get Cloudflare IDs

In Cloudflare Dashboard → Overview page (right sidebar):

- **Account ID** - Under "API" section
- **Zone ID** - Under "API" section

### Going Live (When Ready)

When you're ready to switch from Vercel to Cloudflare Workers:

1. In Cloudflare DNS, change the `@` record:
   - **From:** `cname.vercel-dns.com` (DNS only)
   - **To:** `azertykeycaps-app-web-prod.workers.dev` (Proxied)
2. Optionally delete or keep `staging` subdomain

### Environment URLs Summary

**During staging:**

```
Staging site:  https://staging.azertykeycaps.fr  (new TanStack Start)
API:           https://api.azertykeycaps.fr      (new Hono server)
CMS:           https://cms.azertykeycaps.fr      (Payload CMS)
Current site:  https://azertykeycaps.fr          (old Vercel - still live)
```

**After going live:**

```
Website:       https://azertykeycaps.fr          (TanStack Start on Workers)
API:           https://api.azertykeycaps.fr      (Hono on Workers)
CMS:           https://cms.azertykeycaps.fr      (Payload on Vercel)
```

---

## Architecture Overview

```
                    GitHub Actions
                          |
                deploy-cloudflare.yml
                          |
          +---------------+---------------+
          |                               |
     Alchemy Deploy                  Wrangler Deploy
    (Web + Server)                      (CMS)
          |                               |
          v                               v
    +-----+-----+                   +-----+-----+
    | Cloudflare|                   | Cloudflare|
    |  Workers  |                   |  Workers  |
    +-----------+                   +-----------+
          |                               |
    +-----+-----+                   +-----+-----+
    |    D1     |                   |  D1 + R2  |
    | (api-db)  |                   | (cms-db)  |
    +-----------+                   +-----------+
```

**Deployments:**

- **Web + Server** → Cloudflare Workers (via Alchemy)
- **CMS** → Cloudflare Workers (via wrangler + opennextjs-cloudflare)

## Workflows

| Workflow                | Trigger                                    | Deploys                                 |
| ----------------------- | ------------------------------------------ | --------------------------------------- |
| `ci.yml`                | All pushes/PRs                             | Type check, lint, build verification    |
| `deploy-cloudflare.yml` | Push to main, PRs (web/server/cms changes) | Web + Server (Alchemy) + CMS (wrangler) |

## CMS Deployment Setup (Cloudflare Workers)

The CMS is deployed independently from Alchemy using the standard Payload + wrangler workflow.

### Initial Setup (One-time)

The D1 databases and R2 buckets need to be created manually before the first deployment:

```bash
cd apps/cms

# Create production D1 database
wrangler d1 create azertykeycaps-cms-db-prod
# Output: database_id = "66c18deb-28f3-4a6f-aeeb-73886d495f76"

# Create preview D1 database (shared for all PRs)
wrangler d1 create azertykeycaps-cms-db-preview
# Output: database_id = "5eb5f498-07dd-48a7-a2d9-094f1cfe2594"

# Create production R2 bucket (media storage)
wrangler r2 bucket create azertykeycaps-cms-media-prod

# Create preview R2 bucket
wrangler r2 bucket create azertykeycaps-cms-media-preview
```

After creating the resources, update `apps/cms/wrangler.jsonc` with the actual database IDs.

### Configuration File

The CMS uses `apps/cms/wrangler.jsonc` for all environments:

- **Default (no env)**: Preview environment - used for PRs and CI
- **prod**: Production environment - only for main branch deploys
- Local dev uses Miniflare's local emulation automatically (when `remoteBindings: false`)

### Deployment Commands

```bash
cd apps/cms

# Deploy to production (main branch)
CLOUDFLARE_ENV=prod bun run deploy

# Deploy to preview (PRs) - uses default config
bun run deploy

# Run migrations only
CLOUDFLARE_ENV=prod bun run deploy:database  # prod
bun run deploy:database                       # preview (default)

# Deploy app only (without migrations)
CLOUDFLARE_ENV=prod bun run deploy:app
bun run deploy:app
```

### How Migrations Work

The `deploy:database` script runs:

1. `payload migrate` - Applies Payload schema migrations to D1
2. `wrangler d1 execute D1 --command 'PRAGMA optimize'` - Optimizes the database

**Important:** The `"remote": true` flag in wrangler.jsonc ensures migrations run against the actual remote D1 database, not a local emulator.

### Secrets Configuration

CMS secrets are set via wrangler:

```bash
# Set production secrets
wrangler secret put PAYLOAD_SECRET --env prod
wrangler secret put CACHE_INVALIDATION_SECRET --env prod

# Set preview secrets (default config)
wrangler secret put PAYLOAD_SECRET
wrangler secret put CACHE_INVALIDATION_SECRET
```

Or via CI environment variables (they're passed automatically in the workflow).

### Local Development

Local development uses Miniflare (Wrangler's local emulator) to provide D1 and R2 bindings without connecting to remote Cloudflare services.

```bash
# From root - starts all apps (web, server, cms)
bun run dev

# Start only CMS
bun run dev:cms

# Start web + server without CMS
bun run dev:no-cms
```

The CMS runs at `http://localhost:3002/admin` in local dev.

**How it works:**

- `wrangler.jsonc` default config (no env) uses local D1/R2
- `getPlatformProxy()` from wrangler creates local Miniflare bindings
- Data is stored in `.wrangler/` directory (gitignored)
- No Cloudflare authentication needed for local dev

**Environment variables for local dev:**
Create `apps/cms/.env` with:

```
PAYLOAD_SECRET=your-local-dev-secret
```

### Cloudflare Resources Summary

| Resource              | Name                              | Purpose             |
| --------------------- | --------------------------------- | ------------------- |
| D1 Database (prod)    | `azertykeycaps-cms-db-prod`       | CMS data storage    |
| D1 Database (preview) | `azertykeycaps-cms-db-preview`    | PR preview CMS data |
| R2 Bucket (prod)      | `azertykeycaps-cms-media-prod`    | Media file storage  |
| R2 Bucket (preview)   | `azertykeycaps-cms-media-preview` | PR preview media    |
| Worker (prod)         | `azertykeycaps-cms-prod`          | CMS application     |
| Worker (preview)      | `azertykeycaps-cms-preview`       | PR preview CMS      |

---

## GitHub Secrets Configuration

Go to **Settings → Secrets and variables → Actions** in your GitHub repository.

### Required Secrets

#### Cloudflare & Alchemy (12 secrets)

| Secret                  | Description                     | How to Get                                                                                                             |
| ----------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `ALCHEMY_PASSWORD`      | Encrypts Alchemy state          | Generate: `openssl rand -base64 32`                                                                                    |
| `ALCHEMY_STATE_TOKEN`   | Cloudflare R2 state store token | See [Alchemy State Store Guide](https://alchemy.run/guides/cloudflare-state-store)                                     |
| `CLOUDFLARE_API_TOKEN`  | Cloudflare API access           | [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens) - Create token with Workers, D1, R2 permissions |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account         | [Find Account ID](https://developers.cloudflare.com/fundamentals/account/find-account-and-zone-ids/)                   |
| `CLOUDFLARE_EMAIL`      | Cloudflare account email        | Your Cloudflare login email                                                                                            |
| `CLOUDFLARE_ZONE_ID`    | Zone for CDN cache purge        | Cloudflare Dashboard → Your domain → Overview (right sidebar)                                                          |

#### App Environment (7 secrets)

| Secret                      | Description                   | Example                                 |
| --------------------------- | ----------------------------- | --------------------------------------- |
| `CORS_ORIGIN`               | Allowed CORS origin           | `https://azertykeycaps.fr`              |
| `BETTER_AUTH_SECRET`        | Auth encryption key           | Generate: `openssl rand -base64 32`     |
| `BETTER_AUTH_URL`           | Auth callback URL             | `https://api.azertykeycaps.fr`          |
| `VITE_SERVER_URL`           | Server URL for web app        | `https://api.azertykeycaps.fr`          |
| `CMS_API_URL`               | Payload CMS API URL           | `https://cms.azertykeycaps.fr`          |
| `SERVER_URL`                | Server self-reference         | `https://api.azertykeycaps.fr`          |
| `CACHE_INVALIDATION_SECRET` | Shared secret for cache purge | Generate: `openssl rand -base64 32`     |
| `CMS_API_KEY`               | Payload CMS API key           | Generate in CMS admin panel (see below) |

#### CMS (Cloudflare Workers) (2 secrets)

| Secret                      | Description                   | How to Get                          |
| --------------------------- | ----------------------------- | ----------------------------------- |
| `PAYLOAD_SECRET`            | CMS encryption key            | Generate: `openssl rand -base64 32` |
| `CACHE_INVALIDATION_SECRET` | Shared secret for cache purge | Generate: `openssl rand -base64 32` |

**Note:** Other CMS config (WEB_URL, CACHE_INVALIDATION_URL) is set in `apps/cms/wrangler.jsonc` vars.

### Complete Secrets Checklist

```
# Cloudflare & Alchemy
ALCHEMY_PASSWORD=<openssl rand -base64 32>
ALCHEMY_STATE_TOKEN=<from alchemy state store setup>
CLOUDFLARE_API_TOKEN=<from cloudflare dashboard>
CLOUDFLARE_ACCOUNT_ID=<from cloudflare dashboard>
CLOUDFLARE_EMAIL=<your-email@example.com>
CLOUDFLARE_ZONE_ID=<from cloudflare dashboard>

# App Environment (use staging URLs during migration, then switch to prod)
# Staging:
CORS_ORIGIN=https://staging.azertykeycaps.fr
BETTER_AUTH_SECRET=<openssl rand -base64 32>
BETTER_AUTH_URL=https://api.azertykeycaps.fr
VITE_SERVER_URL=https://api.azertykeycaps.fr
CMS_API_URL=https://cms.azertykeycaps.fr
SERVER_URL=https://api.azertykeycaps.fr
CACHE_INVALIDATION_SECRET=<openssl rand -base64 32>
CMS_API_KEY=<from cms admin panel - see instructions below>
# After going live, change CORS_ORIGIN to: https://azertykeycaps.fr

# Vercel & CMS
VERCEL_TOKEN=<from vercel dashboard>
VERCEL_ORG_ID=<from vercel project settings>
VERCEL_CMS_PROJECT_ID=<from vercel project settings>
PAYLOAD_SECRET=<openssl rand -base64 32>
CMS_PUBLIC_URL=https://cms.azertykeycaps.fr
DATABASE_URL=libsql://your-db.turso.io
DATABASE_AUTH_TOKEN=<from turso dashboard>
BLOB_READ_WRITE_TOKEN=<from vercel blob integration>
CACHE_INVALIDATION_URL=https://api.azertykeycaps.fr/api/cache/invalidate
WEB_URL=https://azertykeycaps.fr
```

## Generating CMS API Key

After deploying the CMS, you need to generate an API key for the server to authenticate with the CMS:

1. Go to your CMS admin panel: `https://cms.azertykeycaps.fr/admin`
2. Login with your admin account
3. Navigate to **Users** collection
4. Click **Create New User**
5. Fill in:
   - Email: `api@azertykeycaps.fr` (or any email)
   - Password: Generate a strong password
   - Role: Select **API**
6. Save the user
7. Edit the user you just created
8. Scroll down to find **Enable API Key** checkbox
9. Check it and click **Save**
10. Copy the generated API key
11. Add it as `CMS_API_KEY` secret in GitHub Actions

**Important:** The API key is only shown once when generated. If you lose it, you'll need to regenerate it.

## Preview Deployments

### Cloudflare (Web + Server)

- **Stage naming**: `pr-{number}` for PRs, `prod` for main branch
- **Preview URLs**: Auto-generated by Cloudflare Workers
- **Cleanup**: Automatic when PR is closed/merged

### Vercel (CMS)

- **Preview URLs**: Generated by Vercel for each PR
- **Comment**: Bot posts preview URL on PR

## Cache Invalidation Flow

When content changes in the CMS:

```
CMS Content Update
       |
       v
+------+------+
| Payload Hook |
+------+------+
       |
       +---------------+
       |               |
       v               v
Server Cache      Cloudflare CDN
  Purge              Purge
       |               |
       v               v
/api/cache/       Zone Cache
 invalidate         Purge API
```

**Required for cache invalidation:**

1. `CACHE_INVALIDATION_SECRET` - Shared between CMS and Server
2. `CACHE_INVALIDATION_URL` - Server endpoint
3. `CLOUDFLARE_ZONE_ID` + `CLOUDFLARE_API_TOKEN` - CDN purge
4. `WEB_URL` - Target URLs to purge

## Troubleshooting

### Alchemy Deployment Fails

```bash
# Check Alchemy state store token is valid
curl -H "Authorization: Bearer $ALCHEMY_STATE_TOKEN" \
  https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/r2/buckets

# Verify Cloudflare API token permissions
curl -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  https://api.cloudflare.com/client/v4/user/tokens/verify
```

### Vercel Deployment Fails

```bash
# Check Vercel token
curl -H "Authorization: Bearer $VERCEL_TOKEN" \
  https://api.vercel.com/v2/user
```

### Database Connection Issues

```bash
# Test Turso connection
turso db shell your-db-name "SELECT 1"
```

### Cache Invalidation Not Working

1. Verify `CACHE_INVALIDATION_SECRET` matches in both CMS and Server
2. Check Server logs for `/api/cache/invalidate` endpoint errors
3. Verify `CLOUDFLARE_ZONE_ID` is correct for your domain

## Manual Deployment

```bash
# Deploy Cloudflare (from root)
STAGE=prod bun run deploy

# Deploy CMS (from apps/cms)
cd apps/cms && vercel --prod
```

## Environment Variables Summary Table

| Variable                    | Web | Server | CMS | GitHub Secret |
| --------------------------- | --- | ------ | --- | ------------- |
| `VITE_SERVER_URL`           | ✅  | -      | -   | ✅            |
| `SERVER_URL`                | -   | ✅     | -   | ✅            |
| `CORS_ORIGIN`               | ✅  | ✅     | -   | ✅            |
| `BETTER_AUTH_SECRET`        | ✅  | ✅     | -   | ✅            |
| `BETTER_AUTH_URL`           | ✅  | ✅     | -   | ✅            |
| `CMS_API_URL`               | -   | ✅     | -   | ✅            |
| `CMS_API_KEY`               | -   | ✅     | -   | ✅            |
| `CACHE_INVALIDATION_SECRET` | -   | ✅     | ✅  | ✅            |
| `CACHE_INVALIDATION_URL`    | -   | -      | ✅  | ✅            |
| `CLOUDFLARE_ZONE_ID`        | -   | -      | ✅  | ✅            |
| `CLOUDFLARE_API_TOKEN`      | -   | -      | ✅  | ✅            |
| `WEB_URL`                   | -   | -      | ✅  | ✅            |
| `DATABASE_URL`              | -   | -      | ✅  | ✅            |
| `DATABASE_AUTH_TOKEN`       | -   | -      | ✅  | ✅            |
| `PAYLOAD_SECRET`            | -   | -      | ✅  | ✅            |
| `BLOB_READ_WRITE_TOKEN`     | -   | -      | ✅  | ✅            |
