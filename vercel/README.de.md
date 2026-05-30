# Vercel Deployment

**Language**: [简体中文](README.md) · [繁體中文](README.zh-TW.md) · [English](README.en.md) · [日本語](README.ja.md) · [Français](README.fr.md) · **Deutsch** · [Español](README.es.md) · [Português](README.pt.md)

Vollständige vierstufige Filterung. Der L2-Anti-Scanner für Microsoft Defender SafeLinks nutzt IP-Bereich-Matching statt der nativen ASN-Erkennung von CF — geringfügig niedrigere Genauigkeit (IP-Bereiche müssen alle paar Monate aktualisiert werden), aber ausreichend.

## Ein-Klick-Deployment

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/suxuemi/email-track-domain&root-directory=vercel&env=BACKEND_HOST,BACKEND_PROTOCOL,REDIRECT_TARGET&envDescription=Tracking+backend+host)

Oder fügen Sie diese Template-Repo-URL in Vercel ein:

```
https://github.com/suxuemi/email-track-domain
```

> 💡 Möchten Sie den Code anpassen? [Forken Sie ihn zuerst in Ihr Konto](https://github.com/suxuemi/email-track-domain/fork) und verwenden Sie dann die URL Ihres Forks.

## Konfiguration

| Variable | Standard | Beschreibung |
|---|---|---|
| `BACKEND_HOST` | `cf-track.laifa.xin` | Hostname des Tracking-Backends |
| `BACKEND_PROTOCOL` | `http:` | Backend-Protokoll, Doppelpunkt erforderlich (`http:` oder `https:`) |
| `REDIRECT_TARGET` | `https://www.google.com` | Ziel für abgelehnte Anfragen |

Nach dem Deployment in Vercel Dashboard → Project → Settings → Environment Variables ändern.

## Eigene Domain

Nach dem Deployment in Vercel Dashboard → Project → Settings → Domains die Domain hinzufügen und gemäß Anweisung beim DNS-Anbieter einen CNAME `track → cname.vercel-dns.com` setzen. Details siehe [docs/custom-domain.de.md](../docs/custom-domain.de.md).

## Unterschiede zur Cloudflare Worker-Version

| | Cloudflare | Vercel |
|---|---|---|
| L0/L1 Pfadfilterung | ✓ | ✓ |
| L2-Erkennungsmethode | **Native ASN 8075** (hohe Genauigkeit) | **IP-Bereich-Matching** (mittel) |
| L2 IP-Bereich-Aktualisierung nötig? | Nein | Alle 3-6 Monate |
| L3 Reverse Proxy | ✓ | ✓ |
| DNS-Flexibilität | DNS muss bei CF gehostet sein | Beliebiges DNS via CNAME |

Die IP-Bereiche liegen in der Konstante `MICROSOFT_IPV4_RANGES` in [`api/track.js`](api/track.js); Aktualisierung gemäß den Kommentaren in [`shared/microsoft-ranges.js`](../shared/microsoft-ranges.js).
