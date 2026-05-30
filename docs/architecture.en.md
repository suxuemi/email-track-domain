# Architecture & Technical Reference

**Language**: [简体中文](architecture.md) · [繁體中文](architecture.zh-TW.md) · **English** · [日本語](architecture.ja.md) · [Français](architecture.fr.md) · [Deutsch](architecture.de.md) · [Español](architecture.es.md) · [Português](architecture.pt.md)

> This document is for developers / the technically curious. If you just want to deploy, follow the "Three steps" in the main [README](../README.en.md).

---

## What does this do?

Your email marketing / notification system embeds **tracking pixels** and **redirect links with click IDs** in emails to measure open and click rates. These links point to a tracking backend (e.g., `cf-track.laifa.xin`).

**Problems**:
- Using the backend's own domain directly → high send volume → blacklisted by anti-spam systems
- Shared tracking domain → other users' behavior pollutes your domain reputation
- Microsoft Defender / Outlook auto-fetches links in emails for pre-scanning → pollutes your open/click statistics

**How this Worker solves it**:

Use **your own domain** as a reverse-proxy layer with four-stage filtering:

```
Recipient clicks → Your domain (track.yourdomain.com)
                    ↓
         ┌──────────────────────┐
         │  Worker / Edge Func  │
         │                      │
         │  L0 .php/.aspx block │ → 302 google.com
         │  L1 path allowlist   │ → 302 google.com
         │  L2 anti-MS scanner  │ → 302 google.com
         │  L3 reverse proxy    │
         └──────────────────────┘
                    ↓
         Real tracking backend (cf-track.laifa.xin or your own)
                    ↓
         Record open/click + return pixel/redirect
```

The recipient sees **your domain**, but data still flows to the original tracking backend.

---

## Four-stage filtering

| Stage | Purpose | Action |
|---|---|---|
| **L0** | Extension blocklist — `.php` / `.aspx` are common scanner signatures | 302 → google.com |
| **L1** | Path allowlist — only tracking paths (`/r/`, `/track/`, `/img/`, `/att/`, `/attachment/`, etc.) and root static files (`.png/.ico` etc.) | Miss → 302 |
| **L2** | Anti-Microsoft Defender SafeLinks fingerprint (headers + ASN/IP range) | 302 → google.com |
| **L3** | Reverse-proxy to `BACKEND_HOST`, original path/params untouched | — |

### Two L2 implementations

```
Header fingerprint (all platforms)        Referer empty + Sec-CH-UA-Model="Surface Pro"
Network fingerprint (platform-specific)
  ├─ Cloudflare Worker                    Native ASN 8075 (MICROSOFT-CORP-MSN-AS-BLOCK)
  └─ Vercel/Netlify/Deno                  IP-range match (fallback)
```

**About the IP-range fallback**: Vercel/Netlify/Deno cannot access ASN, so we use hard-coded Microsoft IP ranges (EOP outbound + Microsoft 365 services + MS Corp historical ranges). Accuracy is slightly lower than ASN; ranges need to be refreshed every 3-6 months.

---

## Repository layout

```
.
├── src/index.js                       # Cloudflare Worker (ASN + IP fallback)
├── wrangler.jsonc                     # Cloudflare config
├── vercel/
│   ├── api/track.js                   # Vercel Edge Function (IP-based)
│   ├── vercel.json
│   ├── package.json
│   └── README.md
├── netlify.toml                       # Netlify config
├── netlify/edge-functions/track.js    # Netlify Edge Function (IP-based)
├── deno-deploy/
│   ├── main.js                        # Deno Deploy (IP-based)
│   └── README.md
├── shared/microsoft-ranges.js         # Microsoft IP ranges (source of truth)
├── public/index.html                  # Netlify publish placeholder
├── docs/
│   ├── custom-domain.md               # Custom domain guide (all four)
│   └── architecture.md                # This document
├── CHANGELOG.md                       # Release history (English)
├── README.md                          # Main README (slim)
└── LICENSE                            # MIT
```

---

## Local development

### Cloudflare
```bash
npm install -g wrangler
wrangler login
wrangler dev      # local
wrangler deploy   # deploy
```

### Vercel
```bash
cd vercel && npm install -g vercel
vercel dev
vercel --prod
```

### Netlify
```bash
npm install -g netlify-cli
netlify dev
netlify deploy --prod
```

### Deno Deploy
```bash
cd deno-deploy
deno run --allow-net --allow-env main.js   # serves on :8000
# Deployment via GitHub integration (dash.deno.com/new), no CLI needed
```

---

## Modifying the path allowlist

To extend or modify `ALLOWED_PATH_PREFIXES`, sync the constant across **all four** platform source files:

- `src/index.js` (CF)
- `vercel/api/track.js`
- `netlify/edge-functions/track.js`
- `deno-deploy/main.js`

After editing, push to deploy automatically (CF requires manual `wrangler deploy`).

---

## Updating Microsoft IP ranges

`shared/microsoft-ranges.js` is the source of truth. Sync workflow:

1. Pull the latest data from [endpoints.office.com](https://endpoints.office.com/endpoints/worldwide) or [bgpview.io/asn/8075](https://bgpview.io/asn/8075)
2. Update `MICROSOFT_IPV4_RANGES` in `shared/microsoft-ranges.js`
3. Mirror to the same constant in each of the four platform sources
4. Commit + push

Refresh every 3-6 months. CF's ASN-based detection is unaffected; the other three platforms depend on this list.

---

## Platform comparison

| Platform | L2 anti-scanner | Domain flexibility | Free tier |
|---|---|---|---|
| **Cloudflare Workers** | Native ASN (highest accuracy) | DNS must be on CF | 100K req/day |
| **Vercel** | IP-range match | Any DNS via CNAME | 100GB traffic/month |
| **Netlify** | IP-range match | Any DNS via CNAME | 100GB traffic/month |
| **Deno Deploy** | IP-range match | Any DNS via CNAME | 1M req/month |

---

## Notes

1. **Default backend is `cf-track.laifa.xin`** — this is the template author's tracking backend. You can:
   - **Keep the default**: your traffic flows through the author's backend (default protocol is HTTP, unencrypted)
   - **Switch to your own**: change `BACKEND_HOST` to your tracking backend address
2. **HTTP backend**: default `BACKEND_PROTOCOL=http:` because the author's backend uses HTTP. If your backend is HTTPS, change to `https:`
3. **Do not put this on a domain serving a regular website** — the path allowlist is very narrow; ordinary web requests get 302'd

---

## CI automation (repo internals)

- `.github/workflows/update-i18n-badge.yml`: after pushing README*.md, automatically recomputes the i18n badge JSON
- Main README `release` badge: reads latest tag from GitHub Releases API live
- Main README `i18n` badge: endpoint mode reads `.github/badges/i18n.json`
