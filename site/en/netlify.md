# Netlify Deployment

Any-DNS CNAME + Deno-runtime Edge Function. On par with Vercel; pick whichever dashboard your team prefers.

## One-click deploy

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/suxuemi/email-track-domain)

Or paste this template repo URL into the Netlify console:

```
https://github.com/suxuemi/email-track-domain
```

> 💡 Want to modify the code? [Fork it to your account](https://github.com/suxuemi/email-track-domain/fork) first, then use your fork's URL.

## Configuration

| Variable | Default | Description |
|---|---|---|
| `BACKEND_HOST` | `cf-track.laifa.xin` | Tracking backend hostname |
| `BACKEND_PROTOCOL` | `http:` | Backend protocol (colon required) |
| `REDIRECT_TARGET` | `https://www.google.com` | Where to send rejected requests |

After deploying, modify in **Netlify Dashboard → Site Settings → Environment Variables**.

## Custom domain

See [Bind a Custom Domain](/en/custom-domain#netlify).

## Differences vs Cloudflare

| | Cloudflare | Netlify |
|---|---|---|
| L0/L1 path filtering | ✓ | ✓ |
| L2 detection method | **Native ASN 8075** (high accuracy) | **IP-range match** (medium) |
| L2 IP range refresh needed? | No | Every 3-6 months |
| L3 reverse proxy | ✓ | ✓ |
| Domain flexibility | DNS must be hosted on CF | **Any DNS via CNAME** |
| Runtime | V8 isolate | Deno |

**Best for**: DNS not on Cloudflare, don't want to migrate, want CNAME-based setup.

**Vercel or Netlify?**: Features are nearly equivalent — pick the dashboard your team prefers.

IP ranges live in [`netlify/edge-functions/track.js`](https://github.com/suxuemi/email-track-domain/blob/main/netlify/edge-functions/track.js)'s `MICROSOFT_IPV4_RANGES` constant; see [`shared/microsoft-ranges.js`](https://github.com/suxuemi/email-track-domain/blob/main/shared/microsoft-ranges.js) for update guidance.
