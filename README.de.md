<div align="center">

# Email Tracking Domain

**Ein-Klick-Reverse-Proxy für E-Mail-Tracking-Domain — Öffnungen, Klicks und Anhänge unter Ihrer eigenen Domain**

![platforms](https://img.shields.io/badge/platforms-Cloudflare%20%7C%20Vercel%20%7C%20Netlify%20%7C%20Deno-orange?style=flat-square)
![license](https://img.shields.io/badge/license-MIT-green?style=flat-square)
![i18n](https://img.shields.io/badge/i18n-8%20languages-blue?style=flat-square)
![stars](https://img.shields.io/github/stars/suxuemi/email-track-domain?style=flat-square&logo=github)

🌐 **Offizielle Website**: [laifa.xin](https://laifa.xin)

[简体中文](README.md) | [繁體中文](README.zh-TW.md) | [English](README.en.md) | [日本語](README.ja.md) | [Français](README.fr.md) | **Deutsch** | [Español](README.es.md) | [Português](README.pt.md)

</div>

---

## Ein-Klick-Deployment (vier Plattformen zur Auswahl)

| Plattform | Button | L2-Anti-Scanner | DNS-Flexibilität |
|---|---|---|---|
| **Cloudflare Workers** | [![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/suxuemi/email-track-domain) | Native ASN (höchste Genauigkeit) | DNS muss bei CF gehostet sein |
| **Vercel** | [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/suxuemi/email-track-domain&root-directory=vercel&env=BACKEND_HOST,BACKEND_PROTOCOL,REDIRECT_TARGET&envDescription=Tracking+backend+host) | IP-Bereiche (mittel) | Beliebiges DNS via CNAME |
| **Netlify** | [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/suxuemi/email-track-domain) | IP-Bereiche (mittel) | Beliebiges DNS via CNAME |
| **Deno Deploy** | [→ Einrichtungsanleitung](deno-deploy/README.de.md) | IP-Bereiche (mittel) | Beliebiges DNS via CNAME |

> **Welche Plattform?**
> - DNS bereits bei Cloudflare → **CF Worker** (genauester Anti-Scanner)
> - DNS soll nicht umgezogen werden → **Vercel** oder **Netlify** (CNAME von jedem DNS-Anbieter)
> - Deno bevorzugt / native Service-Worker-Syntax gewünscht → **Deno Deploy**

Nach dem Deployment **müssen Sie eine eigene Domain binden** → [docs/custom-domain.md](docs/custom-domain.de.md)

---

## Was macht das?

Ihr E-Mail-Marketing-/Benachrichtigungssystem bettet **Tracking-Pixel** und **Weiterleitungslinks mit Klick-IDs** in E-Mails ein, um Öffnungs- und Klickraten zu messen. Diese Links zeigen auf ein Tracking-Backend (z. B. `cf-track.laifa.xin`).

**Probleme**:
- Die Domain des Backends direkt verwenden → hohes Versandvolumen → Blacklisting durch Anti-Spam-Systeme
- Geteilte Tracking-Domain → das Verhalten anderer Nutzer beeinträchtigt Ihre Domain-Reputation
- Microsoft Defender / Outlook ruft Links in E-Mails automatisch zum Pre-Scanning ab → verfälscht Ihre Öffnungs-/Klickstatistik

**Wie dieser Worker das löst**:

Verwenden Sie **Ihre eigene Domain** als Reverse-Proxy-Schicht mit vierstufiger Filterung:

```
Empfänger klickt → Ihre Domain (track.yourdomain.com)
                    ↓
         ┌──────────────────────┐
         │  Worker / Edge Func  │
         │                      │
         │  L0 .php/.aspx blocken│ → 302 google.com
         │  L1 Pfad-Whitelist    │ → 302 google.com
         │  L2 MS-Scanner-Schutz│ → 302 google.com
         │  L3 Reverse Proxy    │
         └──────────────────────┘
                    ↓
         Echtes Tracking-Backend (cf-track.laifa.xin oder Ihres)
                    ↓
         Öffnung/Klick aufzeichnen + Pixel/Redirect zurückgeben
```

Der Empfänger sieht **Ihre Domain**, aber die Daten fließen weiterhin zum ursprünglichen Tracking-Backend.

---

## Vierstufige Filterung im Detail

| Stufe | Zweck | Aktion |
|---|---|---|
| **L0** | Erweiterungs-Blacklist — `.php` / `.aspx` sind typische Scanner-Signaturen | 302 → google.com |
| **L1** | Pfad-Whitelist — nur Tracking-Pfade (`/r/`, `/track/`, `/img/` usw.) und statische Root-Dateien (`.png/.ico` usw.) | Verfehlt → 302 |
| **L2** | Microsoft Defender SafeLinks Scanner-Fingerprint (Header + ASN/IP-Bereich) | 302 → google.com |
| **L3** | Reverse-Proxy zu `BACKEND_HOST`, Pfad/Parameter unverändert | — |

### Zwei L2-Implementierungen

```
Header-Fingerprint (alle Plattformen)     Referer leer + Sec-CH-UA-Model="Surface Pro"
Netzwerk-Fingerprint (plattformspezifisch)
  ├─ Cloudflare Worker                    Native ASN 8075 (MICROSOFT-CORP-MSN-AS-BLOCK)
  └─ Vercel/Netlify/Deno                  IP-Bereich-Matching (Fallback)
```

**Zum IP-Bereich-Fallback**: Vercel/Netlify/Deno haben keinen Zugriff auf die ASN, daher verwenden wir hartkodierte Microsoft IP-Bereiche (EOP outbound + Microsoft 365 services + historische MS-Corp-Bereiche). Die Genauigkeit liegt leicht unter ASN; die Bereiche müssen alle 3–6 Monate aktualisiert werden.

> Historische Anmerkung: Der Kommentar im ursprünglichen Quellcode bezeichnete ASN 8075 als Google — **das ist falsch**. 8075 entspricht tatsächlich MICROSOFT-CORP-MSN-AS-BLOCK; Surface Pro ist ein Microsoft-Gerät. Dieses Repository korrigiert den Kommentar.

---

## Unterstützte Tracking-Typen

| Typ | Implementierung | Beispielpfade |
|---|---|---|
| E-Mail-Öffnungs-Tracking | 1×1 transparentes Pixel | `/img/p.png?id=xxx`, `/track/open.gif` |
| Link-Klick-Tracking | 302-Redirect zur Original-URL | `/r/abc123`, `/l/xxx`, `/link/xxx` |
| **Anhang-Download-Tracking** | Reverse-Proxy des Datei-Streams | `/att/xxx.pdf`, `/attachment/file` |

Alle drei Typen **teilen dieselbe Reverse-Proxy-Logik** — Anhang-Tracking funktioniert sofort ohne zusätzliche Konfiguration. Der Worker leitet Anfragen an Ihr Backend weiter; Ihr Backend erfasst das Ereignis und sendet Datei/Pixel/302 zurück.

---

## Konfiguration

| Variable | Standard | Beschreibung |
|---|---|---|
| `BACKEND_HOST` | `cf-track.laifa.xin` | Hostname des realen Tracking-Backends |
| `BACKEND_PROTOCOL` | `http:` | Backend-Protokoll, Doppelpunkt erforderlich (`http:` oder `https:`) |
| `REDIRECT_TARGET` | `https://www.google.com` | Ziel für abgelehnte Anfragen |

Wo ändern:
- **Cloudflare**: Workers Dashboard → Settings → Variables; oder `wrangler.jsonc` bearbeiten und neu deployen
- **Vercel**: Project → Settings → Environment Variables
- **Netlify**: Site Settings → Environment Variables
- **Deno Deploy**: Project Settings → Environment Variables

---

## Custom-Domain-Bindung

Ein Deployment ist ohne Bindung Ihrer eigenen Subdomain sinnlos. Siehe **[docs/custom-domain.md](docs/custom-domain.de.md)** (deckt alle vier Plattformen ab).

---

## Lokale Entwicklung (optional)

### Cloudflare
```bash
npm install -g wrangler
wrangler login
wrangler dev      # lokal
wrangler deploy   # deployen
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
deno run --allow-net --allow-env main.js   # läuft auf :8000
# Deployment über GitHub-Integration (dash.deno.com/new), kein CLI nötig
```

---

## Repository-Struktur

```
.
├── src/index.js                       # Cloudflare Worker (ASN + IP-Fallback)
├── wrangler.jsonc                     # Cloudflare-Konfiguration
├── vercel/
│   ├── api/track.js                   # Vercel Edge Function (IP-basiert)
│   ├── vercel.json
│   ├── package.json
│   └── README.md
├── netlify.toml                       # Netlify-Konfiguration
├── netlify/edge-functions/track.js    # Netlify Edge Function (IP-basiert)
├── deno-deploy/
│   ├── main.js                        # Deno Deploy (IP-basiert)
│   └── README.md
├── shared/microsoft-ranges.js         # Microsoft IP-Bereiche (Source of Truth)
├── public/index.html                  # Platzhalter für Netlify Publish
├── docs/custom-domain.md              # Custom-Domain-Anleitung (alle vier)
├── README.md                          # diese Datei
└── LICENSE                            # MIT
```

---

## Pfad-Whitelist anpassen

Um die Pfad-Whitelist zu erweitern oder zu ändern, synchronisieren Sie die Konstante `ALLOWED_PATH_PREFIXES` in **allen vier** Plattform-Quelldateien:

- `src/index.js` (CF)
- `vercel/api/track.js`
- `netlify/edge-functions/track.js`
- `deno-deploy/main.js`

Nach dem Bearbeiten löst ein Push das automatische Redeployment aus (CF erfordert manuelles `wrangler deploy`).

---

## Microsoft IP-Bereiche aktualisieren

`shared/microsoft-ranges.js` ist die Source of Truth. Synchronisationsablauf:

1. Aktuelle Daten von [endpoints.office.com](https://endpoints.office.com/endpoints/worldwide) oder [bgpview.io/asn/8075](https://bgpview.io/asn/8075) abrufen
2. `MICROSOFT_IPV4_RANGES` in `shared/microsoft-ranges.js` aktualisieren
3. In dieselbe Konstante in den vier Plattformquellen übernehmen
4. Commit + push

Alle 3–6 Monate aktualisieren. CFs ASN-basierte Erkennung ist nicht betroffen; die anderen drei Plattformen hängen von dieser Liste ab.

---

## Hinweise

1. **Standard-Backend ist `cf-track.laifa.xin`** — das ist das Tracking-Backend des Template-Autors. Sie können:
   - **Standard beibehalten**: Ihr Traffic läuft über das Backend des Autors (Standardprotokoll HTTP, unverschlüsselt)
   - **Auf eigenes umstellen**: `BACKEND_HOST` auf Ihre Tracking-Backend-Adresse ändern
2. **HTTP-Backend**: Standard `BACKEND_PROTOCOL=http:`, weil das Backend des Autors HTTP nutzt. Bei HTTPS auf `https:` ändern
3. **Setzen Sie diese Domain nicht auf einer regulären Website ein** — die Pfad-Whitelist ist sehr eng; normale Web-Anfragen werden mit 302 weitergeleitet
4. **Kostenlose Kontingente**:
   - CF Worker: 100.000 Anfragen/Tag
   - Vercel: 100 GB Traffic/Monat
   - Netlify: 100 GB Traffic/Monat
   - Deno Deploy: 1 Mio. Anfragen/Monat

---

## License

MIT — siehe [LICENSE](LICENSE).

---

## Kontakt zum Autor

- 🌐 Website: [laifa.xin](https://laifa.xin)
- 💬 WeChat (beim Hinzufügen bitte „email track" als Hinweis angeben):

<img src="https://cos.files.maozhishi.com/data/web/web-files/wx/tony-apan.png" alt="WeChat des Autors" width="240">

## Danksagung

Abgeleitet von der E-Mail-Tracking-Infrastruktur von [laifa.xin](https://laifa.xin), als Open Source veröffentlicht, damit Nutzer ihre eigene dedizierte Tracking-Domain deployen können.
