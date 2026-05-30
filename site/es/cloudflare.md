# Despliegue Cloudflare Workers

La plataforma con **mayor precisión de anti-escáner L2** entre las cuatro (usa detección nativa de ASN 8075 para identificar el escáner Microsoft Defender SafeLinks).

## Despliegue en un clic

Botón en la página de inicio → [Inicio rápido →](/es/quick-start#_1-hacer-clic-en-el-boton-deploy-elegir-una-plataforma)

## Configuración

| Variable | Por defecto | Descripción |
|---|---|---|
| `BACKEND_HOST` | `cf-track.laifa.xin` | Hostname del backend de seguimiento |
| `BACKEND_PROTOCOL` | `http:` | Protocolo del backend (dos puntos obligatorios) |
| `REDIRECT_TARGET` | `https://www.google.com` | Destino para peticiones rechazadas |

Tras el despliegue, modificar en **Workers Dashboard → Settings → Variables**. O editar la sección `vars` de [`wrangler.jsonc`](https://github.com/suxuemi/email-track-domain/blob/main/wrangler.jsonc) y volver a desplegar.

## Dominio personalizado

Ver [Vincular dominio personalizado](/es/custom-domain#cloudflare-worker).

## Diferencias con otras plataformas

| | Cloudflare | Vercel / Netlify / Deno |
|---|---|---|
| Método de detección L2 | **ASN 8075 nativo** (alta precisión) | Coincidencia de rangos IP (media) |
| ¿Actualizar rangos IP L2? | No | Cada 3-6 meses |
| Flexibilidad DNS | DNS alojado en CF | Cualquier DNS vía CNAME |
| Cuota gratuita | 100K req/día | 100 GB de tráfico/mes (V, N) o 1M req/mes (Deno) |
| Runtime | V8 isolate | V8 isolate / Deno |

**Ideal para**: DNS ya en Cloudflare, necesidad de máxima precisión anti-escáner (por ejemplo, marketing email B2B de alto valor).

**Evitar si**: no quieres mover el DNS → usa Vercel / Netlify en su lugar.
