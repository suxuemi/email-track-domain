# Vincular un dominio personalizado

**Language**: [简体中文](custom-domain.md) · [繁體中文](custom-domain.zh-TW.md) · [English](custom-domain.en.md) · [日本語](custom-domain.ja.md) · [Français](custom-domain.fr.md) · [Deutsch](custom-domain.de.md) · **Español** · [Português](custom-domain.pt.md)

Tras el despliegue, debes apuntar tu propio dominio a la plataforma de despliegue para que los enlaces de seguimiento de email usen tu propio dominio.

Flexibilidad DNS de las cuatro plataformas:

| Plataforma | Requisito DNS | Método de conexión |
|---|---|---|
| Cloudflare Workers | Toda la zona DNS debe estar alojada en CF | Nivel NS |
| Vercel | Cualquier proveedor DNS | CNAME |
| Netlify | Cualquier proveedor DNS | CNAME |
| Deno Deploy | Cualquier proveedor DNS | CNAME |

---

## Cloudflare Worker

> Prerrequisito: tu dominio ya está alojado en Cloudflare (DNS en Cloudflare).

### Opción A: Workers Routes (recomendado — toma total del subdominio)

Adecuado para: dedicar un subdominio (por ejemplo `track.yourdomain.com`) al seguimiento.

1. Abrir Cloudflare Dashboard → seleccionar tu dominio
2. Barra lateral izquierda **DNS** → **Records** → Add record
   - Type: `AAAA`
   - Name: `track` (o el subdominio que quieras)
   - IPv6 address: `100::` (dirección placeholder, el Worker maneja todas las peticiones)
   - Proxy status: **Proxied** (la nube naranja debe estar activada)
3. Barra lateral izquierda **Workers Routes** → Add route
   - Route: `track.yourdomain.com/*`
   - Worker: seleccionar el `email-track-domain` recién desplegado
4. Surte efecto en minutos. Visita `https://track.yourdomain.com/r/test` para verificar que llega a tu backend.

### Opción B: Worker Custom Domain (más simple)

Adecuado para: vincular un proyecto Workers directamente a un dominio (Cloudflare gestiona DNS y SSL automáticamente).

1. Abrir Workers Dashboard → seleccionar el Worker `email-track-domain`
2. **Settings** → **Triggers** → **Custom Domains** → Add Custom Domain
3. Introducir `track.yourdomain.com`, confirmar
4. Cloudflare crea automáticamente los registros DNS y emite un certificado SSL

Diferencia: la Opción A es flexible (puede enrutar rutas específicas), la Opción B vincula el dominio completo (más simple). La mayoría de usuarios debería elegir B.

---

## Vercel

1. Abrir Vercel Dashboard → seleccionar proyecto → **Settings** → **Domains**
2. Introducir `track.yourdomain.com`, Add
3. Vercel mostrará el registro DNS que debes añadir en tu proveedor DNS, similar a:
   ```
   Type: CNAME
   Name: track
   Value: cname.vercel-dns.com
   ```
4. Tras añadir el DNS, esperar unos minutos para que Vercel emita automáticamente el certificado SSL

---

## Netlify

1. Abrir Netlify Dashboard → seleccionar sitio → **Domain management** → **Custom domains** → **Add a domain**
2. Introducir `track.yourdomain.com` → **Verify** → **Yes, add domain**
3. Netlify muestra los registros DNS a añadir en tu proveedor DNS:
   ```
   Type: CNAME
   Name: track
   Value: <your-site>.netlify.app
   ```
4. Esperar la emisión del SSL (minutos a 24 horas)

---

## Deno Deploy <a id="deno-deploy"></a>

1. Abrir [dash.deno.com](https://dash.deno.com) → seleccionar proyecto → **Settings** → **Domains** → **Add Domain**
2. Introducir `track.yourdomain.com`, Deno Deploy da dos registros:
   ```
   Type: A      Name: track  Value: 34.120.54.55   (ejemplo, usar el valor real)
   Type: AAAA   Name: track  Value: ...           (IPv6)
   ```
   O usar CNAME:
   ```
   Type: CNAME  Name: track  Value: <project>.deno.dev
   ```
3. Añadir los registros DNS, luego volver a Deno Deploy y hacer clic en **Verify**
4. SSL emitido automáticamente

---

## Verificación

Tras el despliegue + vinculación, visitar en tu navegador:

| URL | Comportamiento esperado |
|---|---|
| `https://track.yourdomain.com/` | Redirección 302 a google.com (raíz no en lista blanca) |
| `https://track.yourdomain.com/test.php` | Redirección 302 a google.com (extensión bloqueada) |
| `https://track.yourdomain.com/r/abc123` | Reenviado a tu backend (ruta permitida) |
| `https://track.yourdomain.com/favicon.ico` | Reenviado a tu backend (archivo raíz permitido) |

Si la tercera devuelve 502 "Backend fetch failed", `BACKEND_HOST` está mal configurado o el backend es inaccesible.

---

## Uso en emails

Reemplazar todos los enlaces de seguimiento en tus emails que apuntaban a `cf-track.laifa.xin` con `track.yourdomain.com`. Por ejemplo:

```
Antes: http://cf-track.laifa.xin/r/abc123
Después: https://track.yourdomain.com/r/abc123
```

Las estadísticas de aperturas/clics siguen fluyendo a tu backend original, pero los destinatarios ven tu propio dominio — más profesional y mejora tu puntuación anti-spam.
