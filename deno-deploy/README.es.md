# Despliegue Deno Deploy

**Language**: [简体中文](README.md) · [繁體中文](README.zh-TW.md) · [English](README.en.md) · [日本語](README.ja.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · **Español** · [Português](README.pt.md)

Deno Deploy no tiene un "botón de despliegue en un clic" a nivel de URL, pero su integración con GitHub es casi equivalente — configúralo una vez, después cada push despliega automáticamente.

## URL del repositorio plantilla

Copia esta URL en la consola de Deno Deploy:

```
https://github.com/suxuemi/email-track-domain
```

> 💡 ¿Quieres modificar el código? [Hazle fork a tu cuenta de GitHub](https://github.com/suxuemi/email-track-domain/fork) primero, luego conecta Deno Deploy a tu fork.

## Pasos de despliegue

1. Abrir [dash.deno.com/new](https://dash.deno.com/new)
2. Iniciar sesión y elegir **Deploy from GitHub repository**
3. Autorizar a Deno Deploy a acceder a tu GitHub (primera vez)
4. Seleccionar repositorio (pega la URL anterior, o elige tu fork)
5. Configuración:
   - **Production branch**: `main`
   - **Entry point**: `deno-deploy/main.js`
   - **Install step**: dejar vacío
   - **Build step**: dejar vacío
6. **Environment Variables** (opcional, valores por defecto disponibles):
   - `BACKEND_HOST` → `cf-track.laifa.xin`
   - `BACKEND_PROTOCOL` → `http:`
   - `REDIRECT_TARGET` → `https://www.google.com`
7. Hacer clic en **Deploy Project**

Tras el despliegue obtendrás un dominio `<project>.deno.dev`.

## Dominio personalizado

Project Settings → Domains → Add Domain, seguir las instrucciones para añadir un CNAME. Ver [docs/custom-domain.es.md](../docs/custom-domain.es.md#deno-deploy).

## Desarrollo local

```bash
cd deno-deploy
deno run --allow-net --allow-env main.js
```

Sirve en `http://localhost:8000` por defecto. Probar:

```bash
curl -I http://localhost:8000/r/test
curl -I http://localhost:8000/test.php   # debería devolver 302
```

## Diferencias frente a otras plataformas

| | Cloudflare | Vercel | Netlify | **Deno Deploy** |
|---|---|---|---|---|
| Precisión de detección L2 | ASN (alta) | Rangos IP (media) | Rangos IP (media) | **Rangos IP (media)** |
| Sintaxis del código | Worker Module | Edge Function | Edge Function | **Deno.serve()** |
| Botón de despliegue en un clic | Oficial | Oficial | Oficial | **Integración GitHub (1 paso manual)** |
| Cuota gratuita | 100K req/día | 100GB de tráfico | 100GB de tráfico | **1M req/mes** |
| Flexibilidad DNS | DNS bloqueado en CF | Cualquier DNS vía CNAME | Cualquier DNS vía CNAME | **Cualquier DNS vía CNAME** |

Ventajas de Deno Deploy:
- Sintaxis **más cercana al Cloudflare Worker original** (`addEventListener('fetch', ...)` también soportado)
- Cuota gratuita más generosa (contada por peticiones, no por tráfico)
- Mayor número de ubicaciones edge globales
