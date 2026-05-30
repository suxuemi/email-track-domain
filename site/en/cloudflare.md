# Cloudflare Workers Deployment

The platform with **highest L2 anti-scanner accuracy** among the four (uses native ASN 8075 detection to identify Microsoft Defender SafeLinks scanner).

## One-click deploy

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/suxuemi/email-track-domain)

Or paste this template repo URL into the Cloudflare console:

```
https://github.com/suxuemi/email-track-domain
```

## Configuration

| Variable | Default | Description |
|---|---|---|
| `BACKEND_HOST` | `cf-track.laifa.xin` | Tracking backend hostname |
| `BACKEND_PROTOCOL` | `http:` | Backend protocol (colon required) |
| `REDIRECT_TARGET` | `https://www.google.com` | Where to send rejected requests |

After deploying, modify in **Workers Dashboard → Settings → Variables**. Or edit [`wrangler.jsonc`](https://github.com/suxuemi/email-track-domain/blob/main/wrangler.jsonc) `vars` section and redeploy.

## Custom domain

See [Bind a Custom Domain](/en/custom-domain#cloudflare-worker).

## Differences vs other platforms

| | Cloudflare | Vercel / Netlify / Deno |
|---|---|---|
| L2 detection method | **Native ASN 8075** (high accuracy) | IP-range match (medium) |
| L2 IP range refresh needed? | No | Every 3-6 months |
| Domain flexibility | DNS must be hosted on CF | Any DNS via CNAME |
| Free tier | 100K req/day | 100GB traffic/month (V, N) or 1M req/month (Deno) |
| Runtime | V8 isolate | V8 isolate / Deno |

**Best for**: DNS already on Cloudflare, need highest anti-scanner accuracy (e.g., high-value B2B email marketing).

**Avoid if**: Don't want to move DNS → use Vercel / Netlify instead.
