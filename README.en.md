<div align="center">

# Email Tracking Domain

**One-click email tracking domain reverse proxy — opens, clicks & attachments on your own domain**

[![release](https://img.shields.io/github/v/release/suxuemi/email-track-domain?style=flat-square&color=purple&label=release)](https://github.com/suxuemi/email-track-domain/releases/latest)
![platforms](https://img.shields.io/badge/platforms-Cloudflare%20%7C%20Vercel%20%7C%20Netlify%20%7C%20Deno-orange?style=flat-square)
![license](https://img.shields.io/badge/license-MIT-green?style=flat-square)
![i18n](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/suxuemi/email-track-domain/main/.github/badges/i18n.json&style=flat-square)
![stars](https://img.shields.io/github/stars/suxuemi/email-track-domain?style=flat-square&logo=github)

🌐 **Official Website**: [laifa.xin](https://laifa.xin)

[简体中文](README.md) | [繁體中文](README.zh-TW.md) | **English** | [日本語](README.ja.md) | [Français](README.fr.md) | [Deutsch](README.de.md) | [Español](README.es.md) | [Português](README.pt.md) | [📋 Changelog](CHANGELOG.md)

</div>

---

## One-Click Deploy (pick any of four platforms)

| Platform | Button | L2 anti-scanner | Domain flexibility |
|---|---|---|---|
| **Cloudflare Workers** | [![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/suxuemi/email-track-domain) | Native ASN (highest accuracy) | DNS must be hosted on CF |
| **Vercel** | [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/suxuemi/email-track-domain&root-directory=vercel&env=BACKEND_HOST,BACKEND_PROTOCOL,REDIRECT_TARGET&envDescription=Tracking+backend+host) | IP-range (medium) | Any DNS via CNAME |
| **Netlify** | [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/suxuemi/email-track-domain) | IP-range (medium) | Any DNS via CNAME |
| **Deno Deploy** | [→ Setup guide](deno-deploy/README.en.md) | IP-range (medium) | Any DNS via CNAME |

> **Which one?**
> - DNS already on Cloudflare → **CF Worker** (most accurate anti-scanner)
> - Don't want to move DNS → **Vercel** or **Netlify** (CNAME from any DNS provider)
> - Prefer Deno / want native Service Worker syntax → **Deno Deploy**

After deploying, **you must bind a custom domain** to get any benefit → [docs/custom-domain.md](docs/custom-domain.en.md)

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
| **L1** | Path allowlist — only tracking paths (`/r/`, `/track/`, `/img/`, etc.) and root static files (`.png/.ico` etc.) | Miss → 302 |
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

## Supported tracking types

| Type | Implementation | Example paths |
|---|---|---|
| Email open tracking | 1×1 transparent pixel | `/img/p.png?id=xxx`, `/track/open.gif` |
| Link click tracking | 302 redirect to original URL | `/r/abc123`, `/l/xxx`, `/link/xxx` |
| **Attachment download tracking** | Reverse-proxy the file stream | `/att/xxx.pdf`, `/attachment/file` |

All three types **share the same reverse-proxy logic** — attachment tracking works out of the box with zero extra configuration. The Worker forwards requests to your backend; your backend records the event and streams back the file/pixel/302.

---

## Configuration

| Variable | Default | Description |
|---|---|---|
| `BACKEND_HOST` | `cf-track.laifa.xin` | Real tracking backend hostname |
| `BACKEND_PROTOCOL` | `http:` | Backend protocol, must include colon (`http:` or `https:`) |
| `REDIRECT_TARGET` | `https://www.google.com` | Where to send rejected requests |

Where to change:
- **Cloudflare**: Workers Dashboard → Settings → Variables; or edit `wrangler.jsonc` and redeploy
- **Vercel**: Project → Settings → Environment Variables
- **Netlify**: Site Settings → Environment Variables
- **Deno Deploy**: Project Settings → Environment Variables

---

## Custom domain binding

A deployment is useless without binding your own subdomain. See **[docs/custom-domain.md](docs/custom-domain.en.md)** (covers all four platforms).

---

## Local development (optional)

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
├── docs/custom-domain.md              # Custom domain guide (all four)
├── README.md                          # this file
└── LICENSE                            # MIT
```

---

## Modifying the path allowlist

To extend or modify the path allowlist, sync the `ALLOWED_PATH_PREFIXES` constant across **all four** platform source files:

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

## Notes

1. **Default backend is `cf-track.laifa.xin`** — this is the template author's tracking backend. You can:
   - **Keep the default**: your traffic flows through the author's backend (default protocol is HTTP, unencrypted)
   - **Switch to your own**: change `BACKEND_HOST` to your tracking backend address
2. **HTTP backend**: default `BACKEND_PROTOCOL=http:` because the author's backend uses HTTP. If your backend is HTTPS, change to `https:`
3. **Do not put this on a domain serving a regular website** — the path allowlist is very narrow; ordinary web requests get 302'd
4. **Free tier limits**:
   - CF Worker: 100k requests/day
   - Vercel: 100GB traffic/month
   - Netlify: 100GB traffic/month
   - Deno Deploy: 1M requests/month

---

## License

MIT — see [LICENSE](LICENSE).

---

## Contact the author

- 🌐 Website: [laifa.xin](https://laifa.xin)
- 💬 WeChat (please mention "email track" when adding):

<img src="https://cos.files.maozhishi.com/data/web/web-files/wx/tony-apan.png" alt="Author WeChat" width="240">

## Credits

Derived from the email-tracking infrastructure of [laifa.xin](https://laifa.xin), open-sourced so users can deploy their own dedicated tracking domain.
