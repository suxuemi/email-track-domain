<div align="center">

# Email Tracking Domain

**Proxy inverso de dominio de seguimiento de email en un clic — aperturas, clics y adjuntos bajo tu propio dominio**

[![release](https://img.shields.io/github/v/release/suxuemi/email-track-domain?style=flat-square&color=purple&label=release)](https://github.com/suxuemi/email-track-domain/releases/latest)
![platforms](https://img.shields.io/badge/platforms-Cloudflare%20%7C%20Vercel%20%7C%20Netlify%20%7C%20Deno-orange?style=flat-square)
![license](https://img.shields.io/badge/license-MIT-green?style=flat-square)
![i18n](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/suxuemi/email-track-domain/main/.github/badges/i18n.json&style=flat-square)
![stars](https://img.shields.io/github/stars/suxuemi/email-track-domain?style=flat-square&logo=github)

🌐 **Sitio oficial**: [laifa.xin](https://laifa.xin)

[简体中文](README.md) | [繁體中文](README.zh-TW.md) | [English](README.en.md) | [日本語](README.ja.md) | [Français](README.fr.md) | [Deutsch](README.de.md) | **Español** | [Português](README.pt.md) | [📋 Changelog](CHANGELOG.md)

</div>

---

## ⚡ Tres pasos

### 1️⃣ Hacer clic en el botón Deploy (elegir una plataforma)

| Plataforma | Despliegue en un clic | Ideal para |
|---|---|---|
| **Cloudflare Workers** | [![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/suxuemi/email-track-domain) | DNS ya en Cloudflare |
| **Vercel** | [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/suxuemi/email-track-domain&root-directory=vercel&env=BACKEND_HOST,BACKEND_PROTOCOL,REDIRECT_TARGET&envDescription=Tracking+backend+host) | No quieres mover el DNS, CNAME desde cualquier proveedor |
| **Netlify** | [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/suxuemi/email-track-domain) | Igual que Vercel |
| **Deno Deploy** | [→ Guía de instalación](deno-deploy/README.es.md) | Prefieres el ecosistema Deno |

> 💡 **¿No sabes cuál? → Usa Vercel** (cualquier DNS + el más simple)

### 2️⃣ Vincular tu propio dominio

Tras el despliegue, apunta tu subdominio (por ejemplo `track.yourdomain.com`) al proyecto desplegado.

→ **[Configuración de dominio personalizado](custom-domain.es.md)** (cubre las cuatro plataformas)

### 3️⃣ Añadir el dominio en el **[backend de laifa.xin]**

Abrir **[backend de laifa.xin]** → añadir dominio de seguimiento → introducir `track.yourdomain.com` → hacer clic en verificar → ✓

Tras la verificación, todos los enlaces de seguimiento en tus emails usarán este dominio — más profesional y mejora tu puntuación anti-spam.

---

## Tipos de seguimiento soportados

| Tipo | Cómo |
|---|---|
| 📧 Seguimiento de aperturas | Píxel transparente 1×1 |
| 🔗 Seguimiento de clics | Redirección 302 |
| 📎 Seguimiento de descargas de adjuntos | Proxy inverso del flujo de archivo |

Los tres funcionan de inmediato sin configuración adicional.

---

## Configuración (normalmente sin cambios)

| Variable | Por defecto | Descripción |
|---|---|---|
| `BACKEND_HOST` | `cf-track.laifa.xin` | Hostname del backend de seguimiento |
| `BACKEND_PROTOCOL` | `http:` | Protocolo del backend (dos puntos obligatorios) |
| `REDIRECT_TARGET` | `https://www.google.com` | Destino para peticiones rechazadas |

La UI de despliegue de cada plataforma te permite confirmar o cambiar estos tres valores. Los predeterminados están bien para la mayoría.

---

## License

MIT — ver [LICENSE](LICENSE).

---

## Contactar al autor

- 🌐 Sitio web: [laifa.xin](https://laifa.xin)
- 💬 WeChat (por favor menciona "email track" al añadir):

<img src="https://cos.files.maozhishi.com/data/web/web-files/wx/tony-apan.png" alt="WeChat del autor" width="240">

---

## 🔧 Detalles técnicos

Lógica de filtrado de cuatro etapas, detalles del anti-escáner Microsoft Defender SafeLinks, flujo de actualización de rangos IP, desarrollo local, estructura del código fuente, etc. → **[`docs/architecture.es.md`](docs/architecture.es.md)**

## Créditos

Derivado de la infraestructura de seguimiento de email de [laifa.xin](https://laifa.xin), publicado como código abierto para que los usuarios puedan desplegar su propio dominio de seguimiento dedicado.
