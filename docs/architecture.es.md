# Arquitectura y referencia técnica

**Language**: [简体中文](architecture.md) · [繁體中文](architecture.zh-TW.md) · [English](architecture.en.md) · [日本語](architecture.ja.md) · [Français](architecture.fr.md) · [Deutsch](architecture.de.md) · **Español** · [Português](architecture.pt.md)

> Este documento es para desarrolladores / curiosos técnicos. Si solo quieres desplegar, sigue los "Tres pasos" en el [README](../README.es.md) principal.

---

## ¿Qué hace esto?

Tu sistema de email marketing/notificaciones incrusta **píxeles de seguimiento** y **enlaces de redirección con IDs de clic** en los emails para medir tasas de apertura y clic. Estos enlaces apuntan a un backend de seguimiento (por ejemplo `cf-track.laifa.xin`).

**Problemas**:
- Usar el dominio del backend directamente → alto volumen de envío → lista negra de los sistemas anti-spam
- Dominio de seguimiento compartido → el comportamiento de otros usuarios contamina la reputación de tu dominio
- Microsoft Defender / Outlook hace GET automáticamente a los enlaces de los emails para escaneo previo → contamina tus estadísticas de aperturas/clics

**Cómo lo resuelve este Worker**:

Usa **tu propio dominio** como capa de proxy inverso con filtrado en cuatro etapas:

```
El destinatario hace clic → Tu dominio (track.yourdomain.com)
                    ↓
         ┌──────────────────────┐
         │  Worker / Edge Func  │
         │                      │
         │  L0 bloquea .php/.aspx│ → 302 google.com
         │  L1 lista blanca rutas│ → 302 google.com
         │  L2 anti-escáner MS  │ → 302 google.com
         │  L3 proxy inverso    │
         └──────────────────────┘
                    ↓
         Backend de seguimiento real (cf-track.laifa.xin o el tuyo)
                    ↓
         Registra apertura/clic + devuelve píxel/redirección
```

El destinatario ve **tu dominio**, pero los datos siguen fluyendo al backend de seguimiento original.

---

## Filtrado en cuatro etapas

| Etapa | Función | Acción |
|---|---|---|
| **L0** | Lista negra de extensiones — `.php` / `.aspx` son firmas comunes de escáneres | 302 → google.com |
| **L1** | Lista blanca de rutas — solo rutas de seguimiento (`/r/`, `/track/`, `/img/`, `/att/`, `/attachment/`, etc.) y archivos estáticos raíz (`.png/.ico`, etc.) | Fallo → 302 |
| **L2** | Detección de huella del escáner Microsoft Defender SafeLinks (cabeceras + ASN/rango IP) | 302 → google.com |
| **L3** | Proxy inverso a `BACKEND_HOST`, ruta/parámetros sin modificar | — |

### Dos implementaciones de L2

```
Huella de cabecera (todas las plataformas)   Referer vacío + Sec-CH-UA-Model="Surface Pro"
Huella de red (según plataforma)
  ├─ Cloudflare Worker                       ASN 8075 nativo (MICROSOFT-CORP-MSN-AS-BLOCK)
  └─ Vercel/Netlify/Deno                     Coincidencia de rangos IP (alternativa)
```

**Sobre la alternativa por rangos IP**: Vercel/Netlify/Deno no pueden acceder al ASN, así que usamos rangos IP de Microsoft codificados (EOP outbound + Microsoft 365 services + rangos históricos de MS Corp). La precisión es ligeramente menor que ASN; los rangos deben refrescarse cada 3-6 meses.

---

## Estructura del repositorio

```
.
├── src/index.js                       # Cloudflare Worker (ASN + alternativa IP)
├── wrangler.jsonc                     # config Cloudflare
├── vercel/
│   ├── api/track.js                   # Vercel Edge Function (IP)
│   ├── vercel.json
│   ├── package.json
│   └── README.md
├── netlify.toml                       # config Netlify
├── netlify/edge-functions/track.js    # Netlify Edge Function (IP)
├── deno-deploy/
│   ├── main.js                        # Deno Deploy (IP)
│   └── README.md
├── shared/microsoft-ranges.js         # rangos IP Microsoft (source of truth)
├── public/index.html                  # placeholder publish Netlify
├── docs/
│   ├── custom-domain.md               # guía dominio personalizado (4 plataformas)
│   └── architecture.md                # este documento
├── CHANGELOG.md                       # historial de versiones (inglés)
├── README.md                          # README principal (delgado)
└── LICENSE                            # MIT
```

---

## Desarrollo local

### Cloudflare
```bash
npm install -g wrangler
wrangler login
wrangler dev      # local
wrangler deploy   # desplegar
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
deno run --allow-net --allow-env main.js   # sirve en :8000
# Despliegue vía integración GitHub (dash.deno.com/new), sin CLI necesaria
```

---

## Modificar la lista blanca de rutas

Para extender o modificar `ALLOWED_PATH_PREFIXES`, hay que sincronizar la constante en las **cuatro** fuentes:

- `src/index.js` (CF)
- `vercel/api/track.js`
- `netlify/edge-functions/track.js`
- `deno-deploy/main.js`

Tras la modificación, un push activa el redespliegue automático (CF requiere `wrangler deploy` manual).

---

## Actualizar rangos IP de Microsoft

`shared/microsoft-ranges.js` es el source of truth. Flujo de sincronización:

1. Obtener los datos más recientes desde [endpoints.office.com](https://endpoints.office.com/endpoints/worldwide) o [bgpview.io/asn/8075](https://bgpview.io/asn/8075)
2. Actualizar `MICROSOFT_IPV4_RANGES` en `shared/microsoft-ranges.js`
3. Replicar en la misma constante en las cuatro fuentes de plataforma
4. Commit + push

Refrescar cada 3-6 meses. La detección por ASN de CF no se ve afectada; las otras tres plataformas dependen de esta lista.

---

## Comparación de plataformas

| Plataforma | Anti-escáner L2 | Flexibilidad DNS | Cuota gratuita |
|---|---|---|---|
| **Cloudflare Workers** | ASN nativo (máxima precisión) | DNS alojado en CF | 100K req/día |
| **Vercel** | Coincidencia de rangos IP | CNAME cualquier DNS | 100 GB de tráfico/mes |
| **Netlify** | Coincidencia de rangos IP | CNAME cualquier DNS | 100 GB de tráfico/mes |
| **Deno Deploy** | Coincidencia de rangos IP | CNAME cualquier DNS | 1 M req/mes |

---

## Notas

1. **El backend por defecto es `cf-track.laifa.xin`** — es el backend de seguimiento del autor de la plantilla. Puedes:
   - **Mantener el predeterminado**: tu tráfico pasa por el backend del autor (protocolo HTTP por defecto, sin cifrar)
   - **Cambiar al tuyo**: cambiar `BACKEND_HOST` a la dirección de tu backend de seguimiento
2. **Backend HTTP**: por defecto `BACKEND_PROTOCOL=http:` porque el backend del autor usa HTTP. Si el tuyo es HTTPS, cambiar a `https:`
3. **No pongas este dominio en un sitio web normal** — la lista blanca de rutas es muy restrictiva; las peticiones web ordinarias serán redirigidas con 302

---

## Automatización CI (interna del repo)

- `.github/workflows/update-i18n-badge.yml`: tras push de README*.md, recompila automáticamente el JSON del badge i18n
- Badge `release` del README principal: lee el último tag de la API GitHub Releases en vivo
- Badge `i18n` del README principal: modo endpoint que lee `.github/badges/i18n.json`
