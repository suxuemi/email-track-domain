# Eigene Domain binden

**Language**: [简体中文](custom-domain.md) · [繁體中文](custom-domain.zh-TW.md) · [English](custom-domain.en.md) · [日本語](custom-domain.ja.md) · [Français](custom-domain.fr.md) · **Deutsch**

Nach dem Deployment müssen Sie Ihre eigene Domain auf die Deployment-Plattform zeigen lassen, damit E-Mail-Tracking-Links Ihre eigene Domain verwenden.

DNS-Flexibilität der vier Plattformen:

| Plattform | DNS-Anforderung | Verbindungsmethode |
|---|---|---|
| Cloudflare Workers | Gesamte Zone muss bei CF gehostet sein | NS-Ebene |
| Vercel | Beliebiger DNS-Anbieter | CNAME |
| Netlify | Beliebiger DNS-Anbieter | CNAME |
| Deno Deploy | Beliebiger DNS-Anbieter | CNAME |

---

## Cloudflare Worker

> Voraussetzung: Ihre Domain ist bereits bei Cloudflare gehostet (DNS bei Cloudflare).

### Methode A: Workers Routes (empfohlen — vollständige Subdomain-Übernahme)

Geeignet für: eine Subdomain (z. B. `track.yourdomain.com`) ausschließlich für Tracking.

1. Cloudflare Dashboard öffnen → Domain auswählen
2. Linke Seitenleiste **DNS** → **Records** → Add record
   - Type: `AAAA`
   - Name: `track` (oder eine beliebige Subdomain)
   - IPv6 address: `100::` (Platzhalter, Worker verarbeitet alle Anfragen)
   - Proxy status: **Proxied** (orangefarbene Wolke muss aktiv sein)
3. Linke Seitenleiste **Workers Routes** → Add route
   - Route: `track.yourdomain.com/*`
   - Worker: den gerade deployten `email-track-domain` auswählen
4. Wirksam in wenigen Minuten. `https://track.yourdomain.com/r/test` aufrufen, um zu prüfen, ob die Anfrage Ihr Backend erreicht.

### Methode B: Worker Custom Domain (einfacher)

Geeignet für: ein Workers-Projekt direkt an eine Domain binden (Cloudflare kümmert sich automatisch um DNS und SSL).

1. Workers Dashboard öffnen → Worker `email-track-domain` auswählen
2. **Settings** → **Triggers** → **Custom Domains** → Add Custom Domain
3. `track.yourdomain.com` eingeben, bestätigen
4. Cloudflare erstellt automatisch DNS-Einträge und stellt ein SSL-Zertifikat aus

Unterschied: Methode A ist flexibel (kann spezifische Pfade routen), Methode B bindet die gesamte Domain (einfacher). Die meisten Nutzer sollten B wählen.

---

## Vercel

1. Vercel Dashboard öffnen → Projekt auswählen → **Settings** → **Domains**
2. `track.yourdomain.com` eingeben, Add
3. Vercel zeigt den DNS-Eintrag, den Sie bei Ihrem DNS-Anbieter hinzufügen müssen, ähnlich zu:
   ```
   Type: CNAME
   Name: track
   Value: cname.vercel-dns.com
   ```
4. Nach dem Hinzufügen des DNS-Eintrags einige Minuten warten, bis Vercel automatisch das SSL-Zertifikat ausstellt

---

## Netlify

1. Netlify Dashboard öffnen → Site auswählen → **Domain management** → **Custom domains** → **Add a domain**
2. `track.yourdomain.com` eingeben → **Verify** → **Yes, add domain**
3. Netlify zeigt die DNS-Einträge, die beim DNS-Anbieter hinzuzufügen sind:
   ```
   Type: CNAME
   Name: track
   Value: <your-site>.netlify.app
   ```
4. Auf SSL-Ausstellung warten (wenige Minuten bis 24 Stunden)

---

## Deno Deploy <a id="deno-deploy"></a>

1. [dash.deno.com](https://dash.deno.com) öffnen → Projekt auswählen → **Settings** → **Domains** → **Add Domain**
2. `track.yourdomain.com` eingeben, Deno Deploy gibt zwei Einträge an:
   ```
   Type: A      Name: track  Value: 34.120.54.55   (Beispiel, tatsächlichen Wert verwenden)
   Type: AAAA   Name: track  Value: ...           (IPv6)
   ```
   Oder CNAME verwenden:
   ```
   Type: CNAME  Name: track  Value: <project>.deno.dev
   ```
3. DNS-Einträge hinzufügen, dann zu Deno Deploy zurückkehren und **Verify** klicken
4. SSL wird automatisch ausgestellt

---

## Überprüfung

Nach Deployment + Bindung im Browser aufrufen:

| URL | Erwartetes Verhalten |
|---|---|
| `https://track.yourdomain.com/` | 302 Redirect zu google.com (Root nicht in Whitelist) |
| `https://track.yourdomain.com/test.php` | 302 Redirect zu google.com (blockierte Erweiterung) |
| `https://track.yourdomain.com/r/abc123` | Weitergeleitet an Ihr Backend (erlaubter Pfad) |
| `https://track.yourdomain.com/favicon.ico` | Weitergeleitet an Ihr Backend (erlaubte Root-Datei) |

Wenn die dritte Zeile 502 „Backend fetch failed" zurückgibt, ist `BACKEND_HOST` falsch konfiguriert oder das Backend nicht erreichbar.

---

## Verwendung in E-Mails

Ersetzen Sie alle Tracking-Links in Ihren E-Mails, die auf `cf-track.laifa.xin` zeigten, durch `track.yourdomain.com`. Beispiel:

```
Alt: http://cf-track.laifa.xin/r/abc123
Neu: https://track.yourdomain.com/r/abc123
```

Öffnungs-/Klickstatistiken fließen weiterhin zu Ihrem ursprünglichen Backend, aber die Empfänger sehen Ihre eigene Domain — professioneller und verbessert Ihren Anti-Spam-Score.
