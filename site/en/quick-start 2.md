## ⚡ Three steps

### 1️⃣ Click a Deploy button (pick one platform)

| Platform | One-click deploy | Best for |
|---|---|---|
| **Cloudflare Workers** | [![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/suxuemi/email-track-domain) | DNS already on Cloudflare |
| **Vercel** | [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/suxuemi/email-track-domain&root-directory=vercel&env=BACKEND_HOST,BACKEND_PROTOCOL,REDIRECT_TARGET&envDescription=Tracking+backend+host) | Don't want to move DNS, CNAME from any provider |
| **Netlify** | [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/suxuemi/email-track-domain) | Same as Vercel |
| **Deno Deploy** | [→ Setup guide](deno-deploy.md) | Prefer the Deno ecosystem |

> 💡 **Not sure which? → Use Vercel** (any DNS + simplest one-click)

### 2️⃣ Bind your own domain

After deploying, point your subdomain (e.g. `track.yourdomain.com`) to the project you just deployed.

→ **[Custom domain setup](custom-domain.en.md)** (covers all four platforms)

### 3️⃣ Add the domain in the **[laifa.xin backend]**

Open **[laifa.xin backend]** → add tracking domain → enter `track.yourdomain.com` → click verify → ✓

After verification, every tracking link in your emails will use this domain — looking more professional and improving your anti-spam score.

---

## Supported tracking types

| Type | How |
|---|---|
| 📧 Email open tracking | 1×1 transparent pixel |
| 🔗 Link click tracking | 302 redirect |
| 📎 Attachment download tracking | Reverse-proxy the file stream |

All three work out of the box with zero extra config.

---

## Configuration (usually leave as-is)

| Variable | Default | Description |
|---|---|---|
| `BACKEND_HOST` | `cf-track.laifa.xin` | Tracking backend hostname |
| `BACKEND_PROTOCOL` | `http:` | Backend protocol (colon required) |
| `REDIRECT_TARGET` | `https://www.google.com` | Where to send rejected requests |

The deploy UI on each platform will let you confirm or change these three values; defaults are fine for most users.

---

## License

MIT — see [LICENSE](LICENSE).

---

## Contact the author

- 🌐 Website: [laifa.xin](https://laifa.xin)
- 💬 WeChat (please mention "email track" when adding):

<img src="https://cos.files.maozhishi.com/data/web/web-files/wx/tony-apan.png" alt="Author WeChat" width="240">

---

## 🔧 Technical details

Four-stage filtering logic, anti-Microsoft Defender SafeLinks scanner internals, IP-range refresh workflow, local development, source layout, etc. → **[`architecture.md`](architecture.md)**

## Credits

Derived from the email-tracking infrastructure of [laifa.xin](https://laifa.xin), open-sourced so users can deploy their own dedicated tracking domain.
