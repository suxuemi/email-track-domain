## ⚡ In drei Schritten

### 1️⃣ Deploy-Button klicken (eine Plattform auswählen)

| Plattform | Ein-Klick-Deployment | Geeignet für |
|---|---|---|
| **Cloudflare Workers** | [![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/suxuemi/email-track-domain) | DNS bereits bei Cloudflare |
| **Vercel** | [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/suxuemi/email-track-domain&root-directory=vercel&env=BACKEND_HOST,BACKEND_PROTOCOL,REDIRECT_TARGET&envDescription=Tracking+backend+host) | DNS nicht umziehen, CNAME von beliebigem Anbieter |
| **Netlify** | [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/suxuemi/email-track-domain) | Wie Vercel |
| **Deno Deploy** | [→ Einrichtungsanleitung](deno-deploy.md) | Bevorzugen Deno-Ökosystem |

> 💡 **Unsicher? → Verwenden Sie Vercel** (beliebiges DNS + einfachster Ein-Klick)

### 2️⃣ Eigene Domain binden

Nach dem Deployment leiten Sie Ihre Subdomain (z. B. `track.yourdomain.com`) auf das deployte Projekt um.

→ **[Anleitung Custom-Domain](custom-domain.de.md)** (deckt alle vier Plattformen ab)

### 3️⃣ Domain im **[laifa.xin Backend]** hinzufügen

**[laifa.xin Backend]** öffnen → Tracking-Domain hinzufügen → `track.yourdomain.com` eingeben → Verify klicken → ✓

Nach erfolgreicher Verifizierung verwenden alle Tracking-Links in Ihren E-Mails diese Domain — wirkt professioneller und verbessert Ihren Anti-Spam-Score.

---

## Unterstützte Tracking-Typen

| Typ | Wie |
|---|---|
| 📧 E-Mail-Öffnungs-Tracking | 1×1 transparentes Pixel |
| 🔗 Link-Klick-Tracking | 302-Redirect |
| 📎 Anhang-Download-Tracking | Reverse-Proxy des Datei-Streams |

Alle drei funktionieren sofort ohne zusätzliche Konfiguration.

---

## Konfiguration (in der Regel beibehalten)

| Variable | Standard | Beschreibung |
|---|---|---|
| `BACKEND_HOST` | `cf-track.laifa.xin` | Hostname des Tracking-Backends |
| `BACKEND_PROTOCOL` | `http:` | Backend-Protokoll (Doppelpunkt erforderlich) |
| `REDIRECT_TARGET` | `https://www.google.com` | Ziel für abgelehnte Anfragen |

Die Deploy-UI jeder Plattform ermöglicht das Bestätigen oder Ändern dieser drei Werte; die Standardwerte sind für die meisten Nutzer ausreichend.

---

## License

MIT — siehe [LICENSE](LICENSE).

---

## Kontakt zum Autor

- 🌐 Website: [laifa.xin](https://laifa.xin)
- 💬 WeChat (beim Hinzufügen bitte „email track" als Hinweis angeben):

<img src="https://cos.files.maozhishi.com/data/web/web-files/wx/tony-apan.png" alt="WeChat des Autors" width="240">

---

## 🔧 Technische Details

Vierstufige Filterlogik, Anti-Microsoft Defender SafeLinks Scanner, IP-Bereich-Update-Workflow, lokale Entwicklung, Quellcode-Struktur usw. → **[`architecture.md`](architecture.md)**

## Danksagung

Abgeleitet von der E-Mail-Tracking-Infrastruktur von [laifa.xin](https://laifa.xin), als Open Source veröffentlicht, damit Nutzer ihre eigene dedizierte Tracking-Domain deployen können.
