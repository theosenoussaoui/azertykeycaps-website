# Deployment Guide

This document describes how to set up GitHub Actions deployments for the azertykeycaps monorepo.

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

**All apps deploy to Cloudflare Workers:**

| App    | Deployment Tool | Database    | Storage | Custom Domain          |
| ------ | --------------- | ----------- | ------- | ---------------------- |
| Web    | Alchemy         | -           | -       | `www.azertykeycaps.fr` |
| Server | Alchemy         | D1 (api-db) | -       | `api.azertykeycaps.fr` |
| CMS    | Wrangler        | D1 (cms-db) | R2      | `cms.azertykeycaps.fr` |

---

## DNS Setup (Cloudflare)

### Prerequisites

- Domain `azertykeycaps.fr` registered at OVH
- Cloudflare account (free tier is fine)
- Nameservers pointed to Cloudflare

### DNS Records

| Type  | Name  | Content                                     | Proxy            | Purpose         |
| ----- | ----- | ------------------------------------------- | ---------------- | --------------- |
| CNAME | `@`   | `azertykeycaps-app-web-prod.workers.dev`    | Proxied (orange) | Main website    |
| CNAME | `www` | `azertykeycaps-app-web-prod.workers.dev`    | Proxied (orange) | WWW redirect    |
| CNAME | `api` | `azertykeycaps-app-server-prod.workers.dev` | Proxied (orange) | Hono API server |
| CNAME | `cms` | `azertykeycaps-cms-prod.workers.dev`        | Proxied (orange) | Payload CMS     |

> **Important:** Keep all MX records for email!

### Get Cloudflare IDs

In Cloudflare Dashboard → Overview page (right sidebar):

- **Account ID** - Under "API" section
- **Zone ID** - Under "API" section

---

## Workflows

| Workflow                | Trigger                                    | Deploys                                 |
| ----------------------- | ------------------------------------------ | --------------------------------------- |
| `ci.yml`                | All pushes/PRs                             | Type check, lint, build verification    |
| `deploy-cloudflare.yml` | Push to main, PRs (web/server/cms changes) | Web + Server (Alchemy) + CMS (Wrangler) |

### Deployment Flow

```
Push to main or PR
        |
        v
   CI Checks (ci.yml)
        |
        +------ Pass ------+
        |                  |
        v                  v
  deploy-apps         deploy-cms
  (Alchemy)           (Wrangler)
        |                  |
        v                  v
  Web + Server          CMS
  to Workers          to Workers
```

---

## CMS Deployment (Cloudflare Workers)

The CMS is deployed independently using `opennextjs-cloudflare` and Wrangler.

### Initial Setup (One-time)

Create D1 databases and R2 buckets before first deployment:

```bash
cd apps/cms

# Create production D1 database
wrangler d1 create azertykeycaps-cms-db-prod
# Output: database_id = "66c18deb-28f3-4a6f-aeeb-73886d495f76"

# Create preview D1 database (shared for all PRs)
wrangler d1 create azertykeycaps-cms-db-preview
# Output: database_id = "29ecbbda-5256-426b-9f5d-ffe6766089a2"

# Create production R2 bucket (media storage)
wrangler r2 bucket create azertykeycaps-cms-media-prod

# Create preview R2 bucket
wrangler r2 bucket create azertykeycaps-cms-media-preview
```

Update `apps/cms/wrangler.jsonc` with the database IDs.

### Configuration File

The CMS uses `apps/cms/wrangler.jsonc`:

- **Default (no env)**: Preview environment - PRs and local dev
- **prod env**: Production - main branch deploys only

### Deployment Commands

```bash
cd apps/cms

# Deploy to production (main branch)
CLOUDFLARE_ENV=prod bun run deploy

# Deploy to preview (PRs)
bun run deploy

# Run migrations only
CLOUDFLARE_ENV=prod bun run deploy:database  # prod
bun run deploy:database                       # preview

# Deploy app only (without migrations)
CLOUDFLARE_ENV=prod bun run deploy:app
bun run deploy:app
```

### How Migrations Work

The `deploy:database` script runs:

1. `payload migrate` - Applies Payload schema migrations to D1
2. Uses `remote: true` flag to target actual Cloudflare D1

**Important:** Never mix "push mode" and migrations on the same database. Use migrations for production.

### Setting Secrets

```bash
# Set production secrets
echo "your-secret" | wrangler secret put PAYLOAD_SECRET --env prod
echo "your-secret" | wrangler secret put CACHE_INVALIDATION_SECRET --env prod

# Set preview secrets
echo "your-secret" | wrangler secret put PAYLOAD_SECRET
echo "your-secret" | wrangler secret put CACHE_INVALIDATION_SECRET
```

### Cloudflare Resources

| Resource              | Name                              | Purpose             |
| --------------------- | --------------------------------- | ------------------- |
| D1 Database (prod)    | `azertykeycaps-cms-db-prod`       | CMS data storage    |
| D1 Database (preview) | `azertykeycaps-cms-db-preview`    | PR preview CMS data |
| R2 Bucket (prod)      | `azertykeycaps-cms-media-prod`    | Media file storage  |
| R2 Bucket (preview)   | `azertykeycaps-cms-media-preview` | PR preview media    |
| Worker (prod)         | `azertykeycaps-cms-prod`          | CMS application     |
| Worker (preview)      | `azertykeycaps-cms-preview`       | PR preview CMS      |

---

## Web + Server Deployment (Alchemy)

Managed by `packages/infra/alchemy.run.ts`.

### Resources Created

| Resource        | Name                         | Purpose               |
| --------------- | ---------------------------- | --------------------- |
| D1 Database     | `azertykeycaps-app-api-db-*` | Better-Auth user data |
| Worker (web)    | `azertykeycaps-app-web-*`    | TanStack Start SSR    |
| Worker (server) | `azertykeycaps-app-server-*` | Hono API server       |

### Custom Domains

In production (`STAGE=prod`), custom domains are attached via Alchemy:

- Web: `WEB_DOMAIN` env var → `www.azertykeycaps.fr`
- Server: `API_DOMAIN` env var → `api.azertykeycaps.fr`

---

## Local Development

```bash
# From root - starts all apps (web, server, cms)
bun run dev

# Start only CMS
bun run dev:cms

# Start web + server without CMS
bun run dev:no-cms
```

**Local URLs:**

- Web: `http://localhost:3001`
- Server: `http://localhost:1337`
- CMS: `http://localhost:3002/admin`

**Local environment:**

- Uses Miniflare for D1/R2 emulation
- Data stored in `.wrangler/` (gitignored)
- No Cloudflare auth needed

Create `apps/cms/.env` for local dev:

```
PAYLOAD_SECRET=your-local-dev-secret
```

---

## GitHub Secrets Configuration

Go to **Settings → Secrets and variables → Actions** in your GitHub repository.

### Required Secrets

#### Cloudflare & Alchemy (6 secrets)

| Secret                  | Description                     | How to Get                                                                                      |
| ----------------------- | ------------------------------- | ----------------------------------------------------------------------------------------------- |
| `ALCHEMY_PASSWORD`      | Encrypts Alchemy state          | Generate: `openssl rand -base64 32`                                                             |
| `ALCHEMY_STATE_TOKEN`   | Cloudflare R2 state store token | See [Alchemy State Store Guide](https://alchemy.run/guides/cloudflare-state-store)              |
| `CLOUDFLARE_API_TOKEN`  | Cloudflare API access           | [Create token](https://dash.cloudflare.com/profile/api-tokens) with Workers, D1, R2 permissions |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare account         | Cloudflare Dashboard → Overview (right sidebar)                                                 |
| `CLOUDFLARE_EMAIL`      | Cloudflare account email        | Your login email                                                                                |
| `CLOUDFLARE_ZONE_ID`    | Zone for CDN cache purge        | Cloudflare Dashboard → Your domain → Overview                                                   |

#### Custom Domains (3 secrets)

| Secret       | Description       | Example                |
| ------------ | ----------------- | ---------------------- |
| `WEB_DOMAIN` | Web app domain    | `www.azertykeycaps.fr` |
| `API_DOMAIN` | API server domain | `api.azertykeycaps.fr` |
| `CMS_DOMAIN` | CMS domain        | `cms.azertykeycaps.fr` |

#### App Environment (7 secrets)

| Secret                      | Description                   | Example                           |
| --------------------------- | ----------------------------- | --------------------------------- |
| `CORS_ORIGIN`               | Allowed CORS origin           | `https://www.azertykeycaps.fr`    |
| `BETTER_AUTH_SECRET`        | Auth encryption key           | `openssl rand -base64 32`         |
| `BETTER_AUTH_URL`           | Auth callback URL             | `https://api.azertykeycaps.fr`    |
| `VITE_SERVER_URL`           | Server URL for web app        | `https://api.azertykeycaps.fr`    |
| `SERVER_URL`                | Server self-reference         | `https://api.azertykeycaps.fr`    |
| `CACHE_INVALIDATION_SECRET` | Shared secret for cache purge | `openssl rand -base64 32`         |
| `CMS_API_KEY`               | Payload CMS API key           | Generate in CMS admin (see below) |

#### CMS Secrets (2 secrets)

| Secret                      | Description                   | How to Get                         |
| --------------------------- | ----------------------------- | ---------------------------------- |
| `PAYLOAD_SECRET`            | CMS encryption key            | `openssl rand -base64 32`          |
| `CACHE_INVALIDATION_SECRET` | Shared secret for cache purge | Same as above (shared with Server) |

### Complete Secrets Checklist

```bash
# Cloudflare & Alchemy
ALCHEMY_PASSWORD=<openssl rand -base64 32>
ALCHEMY_STATE_TOKEN=<from alchemy state store setup>
CLOUDFLARE_API_TOKEN=<from cloudflare dashboard>
CLOUDFLARE_ACCOUNT_ID=<from cloudflare dashboard>
CLOUDFLARE_EMAIL=<your-email@example.com>
CLOUDFLARE_ZONE_ID=<from cloudflare dashboard>

# Custom Domains
WEB_DOMAIN=www.azertykeycaps.fr
API_DOMAIN=api.azertykeycaps.fr
CMS_DOMAIN=cms.azertykeycaps.fr

# App Environment
CORS_ORIGIN=https://www.azertykeycaps.fr
BETTER_AUTH_SECRET=<openssl rand -base64 32>
BETTER_AUTH_URL=https://api.azertykeycaps.fr
VITE_SERVER_URL=https://api.azertykeycaps.fr
SERVER_URL=https://api.azertykeycaps.fr
CACHE_INVALIDATION_SECRET=<openssl rand -base64 32>
CMS_API_KEY=<from cms admin panel>

# CMS
PAYLOAD_SECRET=<openssl rand -base64 32>
```

---

## Generating CMS API Key

After deploying the CMS:

1. Go to CMS admin: `https://cms.azertykeycaps.fr/admin`
2. Login with admin account
3. Navigate to **Users** collection
4. Click **Create New User**
5. Fill in:
   - Email: `api@azertykeycaps.fr`
   - Password: Strong password
   - Role: **API**
6. Save, then edit the user
7. Check **Enable API Key** and save
8. Copy the generated API key
9. Add as `CMS_API_KEY` secret in GitHub

**Note:** API key is only shown once. Regenerate if lost.

---

## Preview Deployments

### How It Works

- **Stage naming**: `pr-{number}` for PRs, `prod` for main branch
- **Preview URLs**: Auto-generated `*.workers.dev` URLs
- **Cleanup**: Automatic when PR is closed/merged (Web + Server only)

### PR Comment

Alchemy posts a comment on PRs with preview URLs:

| App    | URL                                                 |
| ------ | --------------------------------------------------- |
| Web    | `https://azertykeycaps-app-web-pr-X.workers.dev`    |
| Server | `https://azertykeycaps-app-server-pr-X.workers.dev` |

---

## Cache Invalidation Flow

When content changes in CMS:

```
CMS Content Update
       |
       v
+------+------+
| Payload Hook |
+------+------+
       |
       v
Server Cache Purge
/api/cache/invalidate
       |
       v
Cloudflare CDN Purge
(via Zone API)
```

**Required:**

1. `CACHE_INVALIDATION_SECRET` - Shared between CMS and Server
2. `CACHE_INVALIDATION_URL` - Set in `wrangler.jsonc` vars
3. `CF_ZONE_ID` + `CF_API_TOKEN` - For CDN purge (Server bindings)

---

## Environment Variables Summary

| Variable                    | Web | Server | CMS | Source             |
| --------------------------- | --- | ------ | --- | ------------------ |
| `VITE_SERVER_URL`           | ✅  | -      | -   | Alchemy binding    |
| `SERVER_URL`                | -   | ✅     | -   | Alchemy binding    |
| `CORS_ORIGIN`               | ✅  | ✅     | -   | Alchemy binding    |
| `BETTER_AUTH_SECRET`        | ✅  | ✅     | -   | GitHub Secret      |
| `BETTER_AUTH_URL`           | ✅  | ✅     | -   | Alchemy binding    |
| `CMS_API_URL`               | -   | ✅     | -   | Alchemy binding    |
| `CMS_API_KEY`               | -   | ✅     | -   | GitHub Secret      |
| `CACHE_INVALIDATION_SECRET` | -   | ✅     | ✅  | GitHub Secret      |
| `CACHE_INVALIDATION_URL`    | -   | -      | ✅  | wrangler.jsonc var |
| `WEB_URL`                   | -   | -      | ✅  | wrangler.jsonc var |
| `CF_ZONE_ID`                | -   | ✅     | -   | GitHub Secret      |
| `CF_API_TOKEN`              | -   | ✅     | -   | GitHub Secret      |
| `PAYLOAD_SECRET`            | -   | -      | ✅  | Wrangler secret    |
| `D1` (binding)              | -   | ✅     | ✅  | Alchemy/Wrangler   |
| `R2` (binding)              | -   | -      | ✅  | Wrangler           |

---

## Troubleshooting

### Alchemy Deployment Fails

```bash
# Verify Cloudflare API token
curl -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  https://api.cloudflare.com/client/v4/user/tokens/verify

# Check Alchemy state store
curl -H "Authorization: Bearer $ALCHEMY_STATE_TOKEN" \
  https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/r2/buckets
```

### CMS Deployment Fails

```bash
cd apps/cms

# Check wrangler auth
wrangler whoami

# Test D1 connection
wrangler d1 execute azertykeycaps-cms-db-prod --command "SELECT 1"

# View worker logs
wrangler tail azertykeycaps-cms-prod
```

### Migration Errors

If migrations fail due to schema conflicts:

1. **For preview/dev:** Delete the D1 database and recreate

   ```bash
   wrangler d1 delete azertykeycaps-cms-db-preview
   wrangler d1 create azertykeycaps-cms-db-preview
   # Update database_id in wrangler.jsonc
   ```

2. **For production:** Never delete! Create a new migration to fix the issue
   ```bash
   cd apps/cms
   bun run migrate:create
   # Edit the generated migration file
   ```

### Cache Invalidation Not Working

1. Verify `CACHE_INVALIDATION_SECRET` matches in CMS and Server
2. Check Server logs: `wrangler tail azertykeycaps-app-server-prod`
3. Verify `CF_ZONE_ID` is correct for your domain

### 522 Connection Error (Server → CMS)

1. Verify CMS is deployed and accessible directly
2. Check `CMS_API_URL` binding in Server worker
3. Ensure CMS worker isn't hitting CPU/memory limits

---

## Manual Deployment

```bash
# Deploy Web + Server (from packages/infra)
cd packages/infra
STAGE=prod bun alchemy deploy

# Deploy CMS (from apps/cms)
cd apps/cms
CLOUDFLARE_ENV=prod bun run deploy
```
