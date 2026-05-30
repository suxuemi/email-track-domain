# Architektur und technische Referenz

**Language**: [简体中文](architecture.md) · [繁體中文](architecture.zh-TW.md) · [English](architecture.en.md) · [日本語](architecture.ja.md) · [Français](architecture.fr.md) · **Deutsch** · [Español](architecture.es.md) · [Português](architecture.pt.md)

> Dieses Dokument richtet sich an Entwickler / technisch Interessierte. Wenn Sie nur deployen möchten, folgen Sie den „Drei Schritten" in der Haupt-[README](../README.de.md).

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
| **L1** | Pfad-Whitelist — nur Tracking-Pfade (`/r/`, `/track/`, `/img/`, `/att/`, `/attachment/`, usw.) und statische Root-Dateien (`.png/.ico` usw.) | Verfehlt → 302 |
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
├── docs/
│   ├── custom-domain.md               # Custom-Domain-Anleitung (alle vier)
│   └── architecture.md                # dieses Dokument
├── CHANGELOG.md                       # Release-Historie (Englisch)
├── README.md                          # Haupt-README (schlank)
└── LICENSE                            # MIT
```

---

## Lokale Entwicklung

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

## Pfad-Whitelist anpassen

Um `ALLOWED_PATH_PREFIXES` zu erweitern oder zu ändern, synchronisieren Sie die Konstante in **allen vier** Plattform-Quelldateien:

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

## Plattform-Vergleich

| Plattform | L2-Anti-Scanner | DNS-Flexibilität | Kostenloses Kontingent |
|---|---|---|---|
| **Cloudflare Workers** | Native ASN (höchste Genauigkeit) | DNS muss bei CF gehostet sein | 100.000 Anfragen/Tag |
| **Vercel** | IP-Bereich-Matching | Beliebiges DNS via CNAME | 100 GB Traffic/Monat |
| **Netlify** | IP-Bereich-Matching | Beliebiges DNS via CNAME | 100 GB Traffic/Monat |
| **Deno Deploy** | IP-Bereich-Matching | Beliebiges DNS via CNAME | 1 Mio. Anfragen/Monat |

---

## Hinweise

1. **Standard-Backend ist `cf-track.laifa.xin`** — das ist das Tracking-Backend des Template-Autors. Sie können:
   - **Standard beibehalten**: Ihr Traffic läuft über das Backend des Autors (Standardprotokoll HTTP, unverschlüsselt)
   - **Auf eigenes umstellen**: `BACKEND_HOST` auf Ihre Tracking-Backend-Adresse ändern
2. **HTTP-Backend**: Standard `BACKEND_PROTOCOL=http:`, weil das Backend des Autors HTTP nutzt. Bei HTTPS auf `https:` ändern
3. **Setzen Sie diese Domain nicht auf einer regulären Website ein** — die Pfad-Whitelist ist sehr eng; normale Web-Anfragen werden mit 302 weitergeleitet

---

## CI-Automatisierung (Repo-interne)

- `.github/workflows/update-i18n-badge.yml`: nach Push von README*.md wird das i18n-Badge-JSON automatisch neu berechnet
- Haupt-README `release`-Badge: liest den neuesten Tag live von der GitHub Releases API
- Haupt-README `i18n`-Badge: Endpoint-Modus liest `.github/badges/i18n.json`
