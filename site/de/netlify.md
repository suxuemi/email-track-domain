# Netlify Deployment

Beliebiges DNS via CNAME + Edge Function auf Deno-Runtime. Auf Augenhöhe mit Vercel; je nach Team-Präferenz für die Verwaltungsoberfläche wählen.

## Ein-Klick-Deployment

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/suxuemi/email-track-domain)

Oder fügen Sie diese Template-Repo-URL in die Netlify-Konsole ein:

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

Nach dem Deployment in **Netlify Dashboard → Site Settings → Environment Variables** ändern.

## Eigene Domain

Siehe [Eigene Domain binden](/de/custom-domain#netlify).

## Unterschiede zu Cloudflare

| | Cloudflare | Netlify |
|---|---|---|
| L0/L1 Pfadfilterung | ✓ | ✓ |
| L2-Erkennungsmethode | **Native ASN 8075** (hohe Genauigkeit) | **IP-Bereich-Matching** (mittel) |
| L2-IP-Bereich-Aktualisierung nötig? | Nein | Alle 3-6 Monate |
| L3 Reverse Proxy | ✓ | ✓ |
| DNS-Flexibilität | DNS muss bei CF gehostet sein | **Beliebiges DNS via CNAME** |
| Runtime | V8 isolate | Deno |

**Geeignet für**: DNS nicht bei Cloudflare, kein Umzug gewünscht, CNAME-basierte Einrichtung.

**Vercel oder Netlify?**: Funktionen sind nahezu äquivalent — wählen Sie die Verwaltungsoberfläche, die Ihr Team bevorzugt.

IP-Bereiche befinden sich in der Konstante `MICROSOFT_IPV4_RANGES` in [`netlify/edge-functions/track.js`](https://github.com/suxuemi/email-track-domain/blob/main/netlify/edge-functions/track.js); Aktualisierungshinweise siehe [`shared/microsoft-ranges.js`](https://github.com/suxuemi/email-track-domain/blob/main/shared/microsoft-ranges.js).
