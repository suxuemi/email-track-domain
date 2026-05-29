# Bind a Custom Domain

**Language**: [简体中文](custom-domain.md) · [繁體中文](custom-domain.zh-TW.md) · **English** · [日本語](custom-domain.ja.md) · [Français](custom-domain.fr.md) · [Deutsch](custom-domain.de.md)

After deploying, you need to point your own domain at the deployment platform so that email tracking links use your own domain.

DNS flexibility across the four platforms:

| Platform | DNS requirement | Connection method |
|---|---|---|
| Cloudflare Workers | Entire zone must be hosted on CF | NS-level |
| Vercel | Any DNS provider | CNAME |
| Netlify | Any DNS provider | CNAME |
| Deno Deploy | Any DNS provider | CNAME |

---

## Cloudflare Worker

> Prerequisite: your domain is already hosted on Cloudflare (DNS at Cloudflare).

### Option A: Workers Routes (recommended — full subdomain takeover)

Best for: dedicating a subdomain (e.g., `track.yourdomain.com`) to tracking.

1. Open Cloudflare Dashboard → select your domain
2. Left sidebar **DNS** → **Records** → Add record
   - Type: `AAAA`
   - Name: `track` (or any subdomain you want)
   - IPv6 address: `100::` (placeholder, Worker handles all requests)
   - Proxy status: **Proxied** (orange cloud must be on)
3. Left sidebar **Workers Routes** → Add route
   - Route: `track.yourdomain.com/*`
   - Worker: select the just-deployed `email-track-domain`
4. Takes effect within minutes. Visit `https://track.yourdomain.com/r/test` to verify it reaches your backend.

### Option B: Worker Custom Domain (simpler)

Best for: binding a Workers project directly to a domain (Cloudflare handles DNS and SSL automatically).

1. Open Workers Dashboard → select `email-track-domain` Worker
2. **Settings** → **Triggers** → **Custom Domains** → Add Custom Domain
3. Enter `track.yourdomain.com`, confirm
4. Cloudflare auto-creates DNS records and issues an SSL certificate

Difference: Option A is flexible (can route specific paths), Option B binds the whole domain (simpler). Most users should pick B.

---

## Vercel

1. Open Vercel Dashboard → select project → **Settings** → **Domains**
2. Enter `track.yourdomain.com`, Add
3. Vercel will show the DNS record you need to add at your DNS provider, similar to:
   ```
   Type: CNAME
   Name: track
   Value: cname.vercel-dns.com
   ```
4. After adding DNS, wait a few minutes for Vercel to auto-issue the SSL certificate

---

## Netlify

1. Open Netlify Dashboard → select site → **Domain management** → **Custom domains** → **Add a domain**
2. Enter `track.yourdomain.com` → **Verify** → **Yes, add domain**
3. Netlify shows the DNS records to add at your DNS provider:
   ```
   Type: CNAME
   Name: track
   Value: <your-site>.netlify.app
   ```
4. Wait for SSL to be issued (minutes to 24 hours)

---

## Deno Deploy <a id="deno-deploy"></a>

1. Open [dash.deno.com](https://dash.deno.com) → select project → **Settings** → **Domains** → **Add Domain**
2. Enter `track.yourdomain.com`, Deno Deploy gives two records:
   ```
   Type: A      Name: track  Value: 34.120.54.55   (example, use the actual value)
   Type: AAAA   Name: track  Value: ...           (IPv6)
   ```
   Or use CNAME:
   ```
   Type: CNAME  Name: track  Value: <project>.deno.dev
   ```
3. Add the DNS records, then return to Deno Deploy and click **Verify**
4. SSL is issued automatically

---

## Verification

After deployment + binding, visit in your browser:

| URL | Expected behavior |
|---|---|
| `https://track.yourdomain.com/` | 302 redirect to google.com (root not in allowlist) |
| `https://track.yourdomain.com/test.php` | 302 redirect to google.com (blocked extension) |
| `https://track.yourdomain.com/r/abc123` | Forwarded to your backend (allowed path) |
| `https://track.yourdomain.com/favicon.ico` | Forwarded to your backend (allowed root file) |

If the third one returns 502 "Backend fetch failed", `BACKEND_HOST` is misconfigured or the backend is unreachable.

---

## Using in emails

Replace all tracking links in your emails that pointed to `cf-track.laifa.xin` with `track.yourdomain.com`. For example:

```
Old: http://cf-track.laifa.xin/r/abc123
New: https://track.yourdomain.com/r/abc123
```

Open/click statistics still flow to your original backend, but recipients see your own domain — more professional, and improves your anti-spam score.
