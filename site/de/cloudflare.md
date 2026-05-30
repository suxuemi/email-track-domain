# Cloudflare Workers Deployment

Die Plattform mit der **höchsten L2-Anti-Scanner-Genauigkeit** unter den vier (nutzt native ASN 8075-Erkennung zur Identifizierung des Microsoft Defender SafeLinks Scanners).

## Ein-Klick-Deployment

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/suxuemi/email-track-domain)

Oder fügen Sie diese Template-Repo-URL in die Cloudflare-Konsole ein:

```
https://github.com/suxuemi/email-track-domain
```

> 💡 Möchten Sie den Code anpassen? [Forken Sie ihn zuerst in Ihr Konto](https://github.com/suxuemi/email-track-domain/fork) und verwenden Sie dann die URL Ihres Forks.

## Konfiguration

| Variable | Standard | Beschreibung |
|---|---|---|
| `BACKEND_HOST` | `cf-track.laifa.xin` | Hostname des Tracking-Backends |
| `BACKEND_PROTOCOL` | `http:` | Backend-Protokoll (Doppelpunkt erforderlich) |
| `REDIRECT_TARGET` | `https://www.google.com` | Ziel für abgelehnte Anfragen |

Nach dem Deployment in **Workers Dashboard → Settings → Variables** ändern. Oder [`wrangler.jsonc`](https://github.com/suxuemi/email-track-domain/blob/main/wrangler.jsonc) `vars`-Bereich bearbeiten und neu deployen.

## Eigene Domain

Siehe [Eigene Domain binden](/de/custom-domain#cloudflare-worker).

## Unterschiede zu anderen Plattformen

| | Cloudflare | Vercel / Netlify / Deno |
|---|---|---|
| L2-Erkennungsmethode | **Native ASN 8075** (hohe Genauigkeit) | IP-Bereich-Matching (mittel) |
| L2-IP-Bereich-Aktualisierung nötig? | Nein | Alle 3-6 Monate |
| DNS-Flexibilität | DNS muss bei CF gehostet sein | Beliebiges DNS via CNAME |
| Kostenloses Kontingent | 100K Anfragen/Tag | 100 GB Traffic/Monat (V, N) oder 1 Mio. Anfragen/Monat (Deno) |
| Runtime | V8 isolate | V8 isolate / Deno |

**Geeignet für**: DNS bereits bei Cloudflare, höchste Anti-Scanner-Genauigkeit erforderlich (z. B. hochwertiges B2B-E-Mail-Marketing).

**Nicht geeignet, wenn**: Sie das DNS nicht umziehen möchten → verwenden Sie stattdessen Vercel / Netlify.
