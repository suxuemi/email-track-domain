# Deno Deploy Deployment


Deno Deploy hat keinen „Ein-Klick-Deployment-Button" auf URL-Ebene, aber die GitHub-Integration ist nahezu gleichwertig — einmal einrichten, dann deployt jeder Push automatisch.

## Deployment-Schritte

1. [dash.deno.com/new](https://dash.deno.com/new) öffnen
2. Anmelden und **Deploy from GitHub repository** wählen
3. Deno Deploy den Zugriff auf Ihr GitHub erlauben (beim ersten Mal)
4. Repository auswählen: `suxuemi/email-track-domain` (oder Ihr Fork)
5. Konfiguration:
   - **Production branch**: `main`
   - **Entry point**: `deno-deploy/main.js`
   - **Install step**: leer lassen
   - **Build step**: leer lassen
6. **Environment Variables** (optional, Standardwerte vorhanden):
   - `BACKEND_HOST` → `cf-track.laifa.xin`
   - `BACKEND_PROTOCOL` → `http:`
   - `REDIRECT_TARGET` → `https://www.google.com`
7. **Deploy Project** klicken

Nach dem Deployment erhalten Sie eine `<project>.deno.dev`-Domain.

## Eigene Domain

Project Settings → Domains → Add Domain, gemäß Anweisung CNAME hinzufügen. Details siehe [custom-domain.md](../custom-domain.md#deno-deploy).

## Lokale Entwicklung

```bash
cd deno-deploy
deno run --allow-net --allow-env main.js
```

Standardmäßig auf `http://localhost:8000`. Testen:

```bash
curl -I http://localhost:8000/r/test
curl -I http://localhost:8000/test.php   # sollte 302 zurückgeben
```

## Unterschiede zu anderen Plattformen

| | Cloudflare | Vercel | Netlify | **Deno Deploy** |
|---|---|---|---|---|
| L2-Erkennungsgenauigkeit | ASN (hoch) | IP-Bereich (mittel) | IP-Bereich (mittel) | **IP-Bereich (mittel)** |
| Code-Syntax | Worker Module | Edge Function | Edge Function | **Deno.serve()** |
| Ein-Klick-Deployment-Button | Offiziell | Offiziell | Offiziell | **GitHub-Integration (1 manueller Schritt)** |
| Kostenloses Kontingent | 100K req/Tag | 100 GB Traffic | 100 GB Traffic | **1 Mio. req/Monat** |
| DNS-Flexibilität | DNS auf CF festgelegt | Beliebiges DNS via CNAME | Beliebiges DNS via CNAME | **Beliebiges DNS via CNAME** |

Vorteile von Deno Deploy:
- Syntax **am nächsten am ursprünglichen Cloudflare Worker** (`addEventListener('fetch', ...)` ebenfalls unterstützt)
- Großzügigstes kostenloses Kontingent (nach Anfragen gezählt, nicht nach Traffic)
- Meiste globale Edge-Standorte
