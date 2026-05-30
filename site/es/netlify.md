# Despliegue Netlify

Cualquier DNS vía CNAME + Edge Function en runtime Deno. Al mismo nivel que Vercel; elige según las preferencias del panel de tu equipo.

## Despliegue en un clic

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/suxuemi/email-track-domain)

O pega esta URL del repositorio plantilla en la consola Netlify:

```
https://github.com/suxuemi/email-track-domain
```

> 💡 ¿Quieres modificar el código? [Hazle fork a tu cuenta](https://github.com/suxuemi/email-track-domain/fork) primero, luego usa la URL de tu fork.

## Configuración

| Variable | Por defecto | Descripción |
|---|---|---|
| `BACKEND_HOST` | `cf-track.laifa.xin` | Hostname del backend de seguimiento |
| `BACKEND_PROTOCOL` | `http:` | Protocolo del backend (dos puntos obligatorios) |
| `REDIRECT_TARGET` | `https://www.google.com` | Destino para peticiones rechazadas |

Tras el despliegue, modificar en **Netlify Dashboard → Site Settings → Environment Variables**.

## Dominio personalizado

Ver [Vincular dominio personalizado](/es/custom-domain#netlify).

## Diferencias con Cloudflare

| | Cloudflare | Netlify |
|---|---|---|
| Filtrado de rutas L0/L1 | ✓ | ✓ |
| Método de detección L2 | **ASN 8075 nativo** (alta precisión) | **Coincidencia de rangos IP** (media) |
| ¿Actualizar rangos IP L2? | No | Cada 3-6 meses |
| Proxy inverso L3 | ✓ | ✓ |
| Flexibilidad DNS | DNS alojado en CF | **Cualquier DNS vía CNAME** |
| Runtime | V8 isolate | Deno |

**Ideal para**: DNS no en Cloudflare, no quieres migrar, configuración basada en CNAME.

**¿Vercel o Netlify?**: Las características son casi equivalentes — elige el panel que tu equipo prefiera.

Los rangos IP están en la constante `MICROSOFT_IPV4_RANGES` de [`netlify/edge-functions/track.js`](https://github.com/suxuemi/email-track-domain/blob/main/netlify/edge-functions/track.js); ver [`shared/microsoft-ranges.js`](https://github.com/suxuemi/email-track-domain/blob/main/shared/microsoft-ranges.js) para guía de actualización.
