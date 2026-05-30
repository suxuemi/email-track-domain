<div align="center">

# Email Tracking Domain

**Proxy reverso de domínio de rastreamento de email em um clique — aberturas, cliques e anexos sob seu próprio domínio**

[![release](https://img.shields.io/github/v/release/suxuemi/email-track-domain?style=flat-square&color=purple&label=release)](https://github.com/suxuemi/email-track-domain/releases/latest)
![platforms](https://img.shields.io/badge/platforms-Cloudflare%20%7C%20Vercel%20%7C%20Netlify%20%7C%20Deno-orange?style=flat-square)
![license](https://img.shields.io/badge/license-MIT-green?style=flat-square)
![i18n](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/suxuemi/email-track-domain/main/.github/badges/i18n.json&style=flat-square)
![stars](https://img.shields.io/github/stars/suxuemi/email-track-domain?style=flat-square&logo=github)

🌐 **Site oficial**: [laifa.xin](https://laifa.xin)

[简体中文](README.md) | [繁體中文](README.zh-TW.md) | [English](README.en.md) | [日本語](README.ja.md) | [Français](README.fr.md) | [Deutsch](README.de.md) | [Español](README.es.md) | **Português** | [📋 Changelog](CHANGELOG.md)

</div>

---

## ⚡ Três passos

### 1️⃣ Clicar no botão Deploy (escolher uma plataforma)

| Plataforma | Implantação em um clique | Ideal para |
|---|---|---|
| **Cloudflare Workers** | [![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/suxuemi/email-track-domain) | DNS já no Cloudflare |
| **Vercel** | [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/suxuemi/email-track-domain&root-directory=vercel&env=BACKEND_HOST,BACKEND_PROTOCOL,REDIRECT_TARGET&envDescription=Tracking+backend+host) | Não quer mover o DNS, CNAME de qualquer provedor |
| **Netlify** | [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/suxuemi/email-track-domain) | Igual ao Vercel |
| **Deno Deploy** | [→ Guia de instalação](deno-deploy/README.pt.md) | Prefere o ecossistema Deno |

> 💡 **Não sabe qual escolher? → Use Vercel** (qualquer DNS + o mais simples)

### 2️⃣ Vincular seu próprio domínio

Após a implantação, aponte seu subdomínio (por exemplo `track.yourdomain.com`) para o projeto implantado.

→ **[Configuração de domínio personalizado](custom-domain.pt.md)** (cobre as quatro plataformas)

### 3️⃣ Adicionar o domínio no **[backend laifa.xin]**

Abrir **[backend laifa.xin]** → adicionar domínio de rastreamento → inserir `track.yourdomain.com` → clicar em verificar → ✓

Após a verificação, todos os links de rastreamento nos seus emails usarão este domínio — mais profissional e melhora seu escore anti-spam.

---

## Tipos de rastreamento suportados

| Tipo | Como |
|---|---|
| 📧 Rastreamento de abertura de email | Pixel transparente 1×1 |
| 🔗 Rastreamento de cliques em links | Redirecionamento 302 |
| 📎 Rastreamento de download de anexos | Proxy reverso do fluxo de arquivo |

Os três funcionam imediatamente sem configuração adicional.

---

## Configuração (normalmente sem alterações)

| Variável | Padrão | Descrição |
|---|---|---|
| `BACKEND_HOST` | `cf-track.laifa.xin` | Hostname do backend de rastreamento |
| `BACKEND_PROTOCOL` | `http:` | Protocolo do backend (dois-pontos obrigatórios) |
| `REDIRECT_TARGET` | `https://www.google.com` | Destino para requisições rejeitadas |

A UI de implantação de cada plataforma permite confirmar ou alterar esses três valores. Os padrões servem para a maioria.

---

## License

MIT — ver [LICENSE](LICENSE).

---

## Contate o autor

- 🌐 Site oficial: [laifa.xin](https://laifa.xin)
- 💬 WeChat (por favor mencione "email track" ao adicionar):

<img src="https://cos.files.maozhishi.com/data/web/web-files/wx/tony-apan.png" alt="WeChat do autor" width="240">

---

## 🔧 Detalhes técnicos

Lógica de filtragem em quatro estágios, detalhes do anti-scanner Microsoft Defender SafeLinks, fluxo de atualização de faixas IP, desenvolvimento local, estrutura do código-fonte, etc. → **[`docs/architecture.pt.md`](docs/architecture.pt.md)**

## Créditos

Derivado da infraestrutura de rastreamento de email de [laifa.xin](https://laifa.xin), publicado como código aberto para que os usuários possam implantar seu próprio domínio de rastreamento dedicado.
