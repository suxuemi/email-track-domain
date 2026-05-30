# Implantação Deno Deploy

**Language**: [简体中文](README.md) · [繁體中文](README.zh-TW.md) · [English](README.en.md) · [日本語](README.ja.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Español](README.es.md) · **Português**

Deno Deploy não tem um "botão de implantação em um clique" no nível de URL, mas sua integração com GitHub é quase equivalente — configure uma vez, depois cada push implanta automaticamente.

## URL do repositório template

Copie esta URL para o console do Deno Deploy:

```
https://github.com/suxuemi/email-track-domain
```

## Passos de implantação

1. Abrir [dash.deno.com/new](https://dash.deno.com/new)
2. Fazer login e escolher **Deploy from GitHub repository**
3. Autorizar o Deno Deploy a acessar seu GitHub (primeira vez)
4. Selecionar repositório → cole a URL acima
5. Configuração:
   - **Production branch**: `main`
   - **Entry point**: `deno-deploy/main.js`
   - **Install step**: deixar vazio
   - **Build step**: deixar vazio
6. **Environment Variables** (opcional, valores padrão disponíveis):
   - `BACKEND_HOST` → `cf-track.laifa.xin`
   - `BACKEND_PROTOCOL` → `http:`
   - `REDIRECT_TARGET` → `https://www.google.com`
7. Clicar em **Deploy Project**

Após a implantação você receberá um domínio `<project>.deno.dev`.

## Domínio personalizado

Project Settings → Domains → Add Domain, seguir as instruções para adicionar um CNAME. Ver [docs/custom-domain.pt.md](../docs/custom-domain.pt.md#deno-deploy).

## Desenvolvimento local

```bash
cd deno-deploy
deno run --allow-net --allow-env main.js
```

Serve em `http://localhost:8000` por padrão. Testar:

```bash
curl -I http://localhost:8000/r/test
curl -I http://localhost:8000/test.php   # deve retornar 302
```

## Diferenças em relação a outras plataformas

| | Cloudflare | Vercel | Netlify | **Deno Deploy** |
|---|---|---|---|---|
| Precisão de detecção L2 | ASN (alta) | Faixas IP (média) | Faixas IP (média) | **Faixas IP (média)** |
| Sintaxe do código | Worker Module | Edge Function | Edge Function | **Deno.serve()** |
| Botão de implantação em um clique | Oficial | Oficial | Oficial | **Integração GitHub (1 passo manual)** |
| Cota gratuita | 100K req/dia | 100GB de tráfego | 100GB de tráfego | **1M req/mês** |
| Flexibilidade DNS | DNS bloqueado no CF | Qualquer DNS via CNAME | Qualquer DNS via CNAME | **Qualquer DNS via CNAME** |

Vantagens do Deno Deploy:
- Sintaxe **mais próxima do Cloudflare Worker original** (`addEventListener('fetch', ...)` também suportado)
- Cota gratuita mais generosa (contada por requisições, não por tráfego)
- Maior número de localizações edge globais
