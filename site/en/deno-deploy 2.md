# Deno Deploy Deployment


Deno Deploy doesn't have a URL-level "one-click deploy button", but its GitHub integration is nearly equivalent — set it up once, then push deploys automatically.

## Deployment steps

1. Open [dash.deno.com/new](https://dash.deno.com/new)
2. Sign in and pick **Deploy from GitHub repository**
3. Authorize Deno Deploy to access your GitHub (first time)
4. Select repository: `suxuemi/email-track-domain` (or your fork)
5. Configuration:
   - **Production branch**: `main`
   - **Entry point**: `deno-deploy/main.js`
   - **Install step**: leave empty
   - **Build step**: leave empty
6. **Environment Variables** (optional, defaults provided):
   - `BACKEND_HOST` → `cf-track.laifa.xin`
   - `BACKEND_PROTOCOL` → `http:`
   - `REDIRECT_TARGET` → `https://www.google.com`
7. Click **Deploy Project**

After deployment you'll get a `<project>.deno.dev` domain.

## Custom domain

Project Settings → Domains → Add Domain, follow the instructions to add a CNAME. See [custom-domain.md](../custom-domain.md#deno-deploy).

## Local development

```bash
cd deno-deploy
deno run --allow-net --allow-env main.js
```

Serves at `http://localhost:8000` by default. Test:

```bash
curl -I http://localhost:8000/r/test
curl -I http://localhost:8000/test.php   # should return 302
```

## Differences vs. other platforms

| | Cloudflare | Vercel | Netlify | **Deno Deploy** |
|---|---|---|---|---|
| L2 detection accuracy | ASN (high) | IP-range (medium) | IP-range (medium) | **IP-range (medium)** |
| Code syntax | Worker Module | Edge Function | Edge Function | **Deno.serve()** |
| One-click deploy button | Official | Official | Official | **GitHub integration (1 manual step)** |
| Free tier | 100K req/day | 100GB traffic | 100GB traffic | **1M req/month** |
| Domain flexibility | DNS locked to CF | Any DNS via CNAME | Any DNS via CNAME | **Any DNS via CNAME** |

Deno Deploy's advantages:
- Syntax **closest to original Cloudflare Worker** (`addEventListener('fetch', ...)` is also supported)
- Most generous free tier (counted by requests, not by traffic)
- Most global edge locations
