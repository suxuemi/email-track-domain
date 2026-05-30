# Deno Deploy Deployment

**Language**: [简体中文](README.md) · [繁體中文](README.zh-TW.md) · **English** · [日本語](README.ja.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Español](README.es.md) · [Português](README.pt.md)

Deno Deploy doesn't have a URL-level "one-click deploy button", but its GitHub integration is nearly equivalent — set it up once, then push deploys automatically.

## Template repo URL

Copy this URL into the Deno Deploy console:

```
https://github.com/suxuemi/email-track-domain
```

## Deployment steps

1. Open [dash.deno.com/new](https://dash.deno.com/new)
2. Sign in and pick **Deploy from GitHub repository**
3. Authorize Deno Deploy to access your GitHub (first time)
4. Select repository → paste the URL above
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

Project Settings → Domains → Add Domain, follow the instructions to add a CNAME. See [docs/custom-domain.en.md](../docs/custom-domain.en.md#deno-deploy).

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
