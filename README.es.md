<div align="center">

# Email Tracking Domain

**Proxy inverso de dominio de seguimiento de email en un clic — aperturas, clics y adjuntos bajo tu propio dominio**

[![release](https://img.shields.io/github/v/release/suxuemi/email-track-domain?style=flat-square&color=purple&label=release)](https://github.com/suxuemi/email-track-domain/releases/latest)
![platforms](https://img.shields.io/badge/platforms-Cloudflare%20%7C%20Vercel%20%7C%20Netlify%20%7C%20Deno-orange?style=flat-square)
![license](https://img.shields.io/badge/license-MIT-green?style=flat-square)
![i18n](https://img.shields.io/badge/i18n-8%20languages-blue?style=flat-square)
![stars](https://img.shields.io/github/stars/suxuemi/email-track-domain?style=flat-square&logo=github)

🌐 **Sitio oficial**: [laifa.xin](https://laifa.xin)

[简体中文](README.md) | [繁體中文](README.zh-TW.md) | [English](README.en.md) | [日本語](README.ja.md) | [Français](README.fr.md) | [Deutsch](README.de.md) | **Español** | [Português](README.pt.md) | [📋 Changelog](CHANGELOG.md)

</div>

---

## Despliegue en un clic (cuatro plataformas a elegir)

| Plataforma | Botón | Anti-escáner L2 | Flexibilidad DNS |
|---|---|---|---|
| **Cloudflare Workers** | [![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/suxuemi/email-track-domain) | ASN nativo (máxima precisión) | DNS alojado en CF |
| **Vercel** | [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/suxuemi/email-track-domain&root-directory=vercel&env=BACKEND_HOST,BACKEND_PROTOCOL,REDIRECT_TARGET&envDescription=Tracking+backend+host) | Rangos IP (media) | Cualquier DNS vía CNAME |
| **Netlify** | [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/suxuemi/email-track-domain) | Rangos IP (media) | Cualquier DNS vía CNAME |
| **Deno Deploy** | [→ Guía de instalación](deno-deploy/README.es.md) | Rangos IP (media) | Cualquier DNS vía CNAME |

> **¿Cuál elegir?**
> - DNS ya en Cloudflare → **CF Worker** (anti-escáner más preciso)
> - No quieres mover el DNS → **Vercel** o **Netlify** (CNAME desde cualquier proveedor DNS)
> - Prefieres Deno / quieres mantener sintaxis Service Worker nativa → **Deno Deploy**

Tras el despliegue, **debes vincular un dominio personalizado** → [docs/custom-domain.es.md](docs/custom-domain.es.md)

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
| **L1** | Lista blanca de rutas — solo rutas de seguimiento (`/r/`, `/track/`, `/img/`, etc.) y archivos estáticos raíz (`.png/.ico`, etc.) | Fallo → 302 |
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

> Nota histórica: el comentario del código fuente original decía que el ASN 8075 era Google — **esto es incorrecto**. 8075 corresponde en realidad a MICROSOFT-CORP-MSN-AS-BLOCK; Surface Pro es un dispositivo Microsoft. Este repositorio corrige el comentario.

---

## Tipos de seguimiento soportados

| Tipo | Implementación | Ejemplos de rutas |
|---|---|---|
| Seguimiento de aperturas de email | Píxel transparente 1×1 | `/img/p.png?id=xxx`, `/track/open.gif` |
| Seguimiento de clics en enlaces | Redirección 302 a la URL original | `/r/abc123`, `/l/xxx`, `/link/xxx` |
| **Seguimiento de descargas de adjuntos** | Proxy inverso del flujo de archivo | `/att/xxx.pdf`, `/attachment/file` |

Los tres tipos **comparten la misma lógica de proxy inverso** — el seguimiento de adjuntos funciona de inmediato sin configuración adicional. El Worker reenvía las peticiones a tu backend; tu backend registra el evento y devuelve el archivo/píxel/302.

---

## Configuración

| Variable | Por defecto | Descripción |
|---|---|---|
| `BACKEND_HOST` | `cf-track.laifa.xin` | Hostname del backend de seguimiento real |
| `BACKEND_PROTOCOL` | `http:` | Protocolo del backend, dos puntos obligatorios (`http:` o `https:`) |
| `REDIRECT_TARGET` | `https://www.google.com` | Destino para peticiones rechazadas |

Dónde modificar:
- **Cloudflare**: Workers Dashboard → Settings → Variables; o editar `wrangler.jsonc` y volver a desplegar
- **Vercel**: Project → Settings → Environment Variables
- **Netlify**: Site Settings → Environment Variables
- **Deno Deploy**: Project Settings → Environment Variables

---

## Vinculación de dominio personalizado

Un despliegue es inútil sin vincular tu propio subdominio. Ver **[docs/custom-domain.es.md](docs/custom-domain.es.md)** (cubre las cuatro plataformas).

---

## Desarrollo local (opcional)

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
├── docs/custom-domain.md              # guía dominio personalizado (4 plataformas)
├── README.md                          # este archivo
└── LICENSE                            # MIT
```

---

## Modificar la lista blanca de rutas

Para extender o modificar la lista blanca de rutas, hay que sincronizar la constante `ALLOWED_PATH_PREFIXES` en las **cuatro** fuentes:

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

## Notas

1. **El backend por defecto es `cf-track.laifa.xin`** — es el backend de seguimiento del autor de la plantilla. Puedes:
   - **Mantener el predeterminado**: tu tráfico pasa por el backend del autor (protocolo HTTP por defecto, sin cifrar)
   - **Cambiar al tuyo**: cambiar `BACKEND_HOST` a la dirección de tu backend de seguimiento
2. **Backend HTTP**: por defecto `BACKEND_PROTOCOL=http:` porque el backend del autor usa HTTP. Si el tuyo es HTTPS, cambiar a `https:`
3. **No pongas este dominio en un sitio web normal** — la lista blanca de rutas es muy restrictiva; las peticiones web ordinarias serán redirigidas con 302
4. **Cuotas gratuitas**:
   - CF Worker: 100.000 peticiones/día
   - Vercel: 100 GB de tráfico/mes
   - Netlify: 100 GB de tráfico/mes
   - Deno Deploy: 1 millón de peticiones/mes

---

## License

MIT — ver [LICENSE](LICENSE).

---

## Contactar al autor

- 🌐 Sitio web: [laifa.xin](https://laifa.xin)
- 💬 WeChat (por favor menciona "email track" al añadir):

<img src="https://cos.files.maozhishi.com/data/web/web-files/wx/tony-apan.png" alt="WeChat del autor" width="240">

## Créditos

Derivado de la infraestructura de seguimiento de email de [laifa.xin](https://laifa.xin), publicado como código abierto para que los usuarios puedan desplegar su propio dominio de seguimiento dedicado.
