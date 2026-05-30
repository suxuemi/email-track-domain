# Despliegue Vercel


Filtrado de cuatro etapas completo. El anti-escáner L2 de Microsoft Defender SafeLinks usa coincidencia de rangos IP en lugar de la detección nativa de ASN de CF — precisión ligeramente menor (los rangos IP deben actualizarse cada pocos meses), pero suficiente.

## Despliegue en un clic

Botón en la raíz del repositorio [quick-start.md](../quick-start.md).

## Configuración

| Variable | Por defecto | Descripción |
|---|---|---|
| `BACKEND_HOST` | `cf-track.laifa.xin` | Nombre de host del backend de seguimiento |
| `BACKEND_PROTOCOL` | `http:` | Protocolo del backend, los dos puntos son obligatorios (`http:` o `https:`) |
| `REDIRECT_TARGET` | `https://www.google.com` | Destino al rechazar peticiones |

Tras el despliegue, modificar en Vercel Dashboard → Project → Settings → Environment Variables.

## Dominio personalizado

Tras el despliegue, ir a Vercel Dashboard → Project → Settings → Domains, añadir tu dominio y seguir las instrucciones para añadir un CNAME `track → cname.vercel-dns.com` en tu proveedor DNS. Detalles en [custom-domain.md](../custom-domain.md).

## Diferencias frente a Cloudflare Worker

| | Cloudflare | Vercel |
|---|---|---|
| Filtrado de rutas L0/L1 | ✓ | ✓ |
| Método de detección L2 | **ASN 8075 nativo** (alta precisión) | **Coincidencia de rangos IP** (media) |
| ¿Se necesita actualizar los rangos IP L2? | No | Cada 3-6 meses |
| Proxy inverso L3 | ✓ | ✓ |
| Flexibilidad DNS | DNS alojado en CF | Cualquier DNS vía CNAME |

Los rangos IP están en la constante `MICROSOFT_IPV4_RANGES` de [`api/track.js`](api/track.js); actualizar según los comentarios en [`shared/microsoft-ranges.js`](../shared/microsoft-ranges.js).
