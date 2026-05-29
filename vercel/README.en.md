# Vercel Deployment

**Language**: [简体中文](README.md) · [繁體中文](README.zh-TW.md) · **English** · [日本語](README.ja.md) · [Français](README.fr.md) · [Deutsch](README.de.md)

Full four-stage filtering. L2 anti-Microsoft Defender SafeLinks scanner uses IP-range matching instead of CF's native ASN detection — slightly lower accuracy (IP ranges need to be refreshed every few months), but good enough.

## One-click deploy

See the button at the repo root [README.en.md](../README.en.md).

## Configuration

| Variable | Default | Description |
|---|---|---|
| `BACKEND_HOST` | `cf-track.laifa.xin` | Tracking backend hostname |
| `BACKEND_PROTOCOL` | `http:` | Backend protocol, colon required (`http:` or `https:`) |
| `REDIRECT_TARGET` | `https://www.google.com` | Where to send rejected requests |

After deploying, change them at Vercel Dashboard → Project → Settings → Environment Variables.

## Custom Domain

After deployment, go to Vercel Dashboard → Project → Settings → Domains, add your domain, and follow the instructions to add a CNAME `track → cname.vercel-dns.com` at your DNS provider. See [docs/custom-domain.en.md](../docs/custom-domain.en.md).

## Differences vs. Cloudflare Worker

| | Cloudflare | Vercel |
|---|---|---|
| L0/L1 path filtering | ✓ | ✓ |
| L2 detection method | **Native ASN 8075** (high accuracy) | **IP-range matching** (medium) |
| L2 IP-range refresh needed? | No | Every 3-6 months |
| L3 reverse proxy | ✓ | ✓ |
| Domain flexibility | DNS must be hosted on CF | Any DNS via CNAME |

IP ranges live in the `MICROSOFT_IPV4_RANGES` constant in [`api/track.js`](api/track.js); update according to the comments in [`shared/microsoft-ranges.js`](../shared/microsoft-ranges.js).
