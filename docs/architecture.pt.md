# Arquitetura e referência técnica

**Language**: [简体中文](architecture.md) · [繁體中文](architecture.zh-TW.md) · [English](architecture.en.md) · [日本語](architecture.ja.md) · [Français](architecture.fr.md) · [Deutsch](architecture.de.md) · [Español](architecture.es.md) · **Português**

> Este documento é para desenvolvedores / curiosos técnicos. Se você só quer implantar, siga os "Três passos" no [README](../README.pt.md) principal.

---

## O que isso faz?

Seu sistema de email marketing/notificações incorpora **pixels de rastreamento** e **links de redirecionamento com IDs de clique** nos emails para medir taxas de abertura e clique. Esses links apontam para um backend de rastreamento (por exemplo `cf-track.laifa.xin`).

**Problemas**:
- Usar o domínio do backend diretamente → alto volume de envio → lista negra dos sistemas anti-spam
- Domínio de rastreamento compartilhado → o comportamento de outros usuários polui a reputação do seu domínio
- Microsoft Defender / Outlook faz GET automaticamente nos links dos emails para pré-escaneamento → polui suas estatísticas de abertura/clique

**Como este Worker resolve**:

Use **seu próprio domínio** como camada de proxy reverso com filtragem em quatro estágios:

```
Destinatário clica → Seu domínio (track.yourdomain.com)
                    ↓
         ┌──────────────────────┐
         │  Worker / Edge Func  │
         │                      │
         │  L0 bloqueia .php/.aspx│ → 302 google.com
         │  L1 lista branca rotas│ → 302 google.com
         │  L2 anti-scanner MS  │ → 302 google.com
         │  L3 proxy reverso    │
         └──────────────────────┘
                    ↓
         Backend de rastreamento real (cf-track.laifa.xin ou o seu)
                    ↓
         Registra abertura/clique + retorna pixel/redirecionamento
```

O destinatário vê **seu domínio**, mas os dados continuam fluindo para o backend de rastreamento original.

---

## Filtragem em quatro estágios

| Estágio | Função | Ação |
|---|---|---|
| **L0** | Lista negra de extensões — `.php` / `.aspx` são assinaturas comuns de scanners | 302 → google.com |
| **L1** | Lista branca de caminhos — apenas caminhos de rastreamento (`/r/`, `/track/`, `/img/`, `/att/`, `/attachment/`, etc.) e arquivos estáticos na raiz (`.png/.ico`, etc.) | Falha → 302 |
| **L2** | Detecção de impressão digital do scanner Microsoft Defender SafeLinks (cabeçalhos + ASN/faixa IP) | 302 → google.com |
| **L3** | Proxy reverso para `BACKEND_HOST`, caminho/parâmetros sem modificar | — |

### Duas implementações de L2

```
Impressão de cabeçalho (todas as plataformas)   Referer vazio + Sec-CH-UA-Model="Surface Pro"
Impressão de rede (por plataforma)
  ├─ Cloudflare Worker                          ASN 8075 nativo (MICROSOFT-CORP-MSN-AS-BLOCK)
  └─ Vercel/Netlify/Deno                        Correspondência de faixas IP (alternativa)
```

**Sobre a alternativa por faixas IP**: Vercel/Netlify/Deno não conseguem acessar o ASN, então usamos faixas IP da Microsoft codificadas (EOP outbound + Microsoft 365 services + faixas históricas da MS Corp). A precisão é ligeiramente menor que o ASN; as faixas precisam ser atualizadas a cada 3-6 meses.

---

## Estrutura do repositório

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
├── shared/microsoft-ranges.js         # faixas IP Microsoft (source of truth)
├── public/index.html                  # placeholder publish Netlify
├── docs/
│   ├── custom-domain.md               # guia domínio personalizado (4 plataformas)
│   └── architecture.md                # este documento
├── CHANGELOG.md                       # histórico de versões (inglês)
├── README.md                          # README principal (enxuto)
└── LICENSE                            # MIT
```

---

## Desenvolvimento local

### Cloudflare
```bash
npm install -g wrangler
wrangler login
wrangler dev      # local
wrangler deploy   # implantar
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
deno run --allow-net --allow-env main.js   # serve em :8000
# Implantação via integração GitHub (dash.deno.com/new), sem necessidade de CLI
```

---

## Modificar a lista branca de caminhos

Para estender ou modificar `ALLOWED_PATH_PREFIXES`, é preciso sincronizar a constante nas **quatro** fontes:

- `src/index.js` (CF)
- `vercel/api/track.js`
- `netlify/edge-functions/track.js`
- `deno-deploy/main.js`

Após a modificação, um push aciona a reimplantação automática (CF requer `wrangler deploy` manual).

---

## Atualizar faixas IP da Microsoft

`shared/microsoft-ranges.js` é o source of truth. Fluxo de sincronização:

1. Obter os dados mais recentes de [endpoints.office.com](https://endpoints.office.com/endpoints/worldwide) ou [bgpview.io/asn/8075](https://bgpview.io/asn/8075)
2. Atualizar `MICROSOFT_IPV4_RANGES` em `shared/microsoft-ranges.js`
3. Replicar na mesma constante nas quatro fontes de plataforma
4. Commit + push

Atualizar a cada 3-6 meses. A detecção por ASN do CF não é afetada; as outras três plataformas dependem desta lista.

---

## Comparação de plataformas

| Plataforma | Anti-scanner L2 | Flexibilidade DNS | Cota gratuita |
|---|---|---|---|
| **Cloudflare Workers** | ASN nativo (precisão máxima) | DNS hospedado no CF | 100K req/dia |
| **Vercel** | Correspondência de faixas IP | CNAME qualquer DNS | 100 GB de tráfego/mês |
| **Netlify** | Correspondência de faixas IP | CNAME qualquer DNS | 100 GB de tráfego/mês |
| **Deno Deploy** | Correspondência de faixas IP | CNAME qualquer DNS | 1 M req/mês |

---

## Notas

1. **O backend padrão é `cf-track.laifa.xin`** — é o backend de rastreamento do autor do template. Você pode:
   - **Manter o padrão**: seu tráfego passa pelo backend do autor (protocolo HTTP padrão, sem criptografia)
   - **Mudar para o seu**: alterar `BACKEND_HOST` para o endereço do seu backend de rastreamento
2. **Backend HTTP**: padrão `BACKEND_PROTOCOL=http:` porque o backend do autor usa HTTP. Se o seu for HTTPS, mudar para `https:`
3. **Não coloque este domínio em um site normal** — a lista branca de caminhos é muito restritiva; requisições web comuns serão redirecionadas com 302

---

## Automação CI (interna do repo)

- `.github/workflows/update-i18n-badge.yml`: após push de README*.md, recompila automaticamente o JSON do badge i18n
- Badge `release` do README principal: lê a última tag da API GitHub Releases ao vivo
- Badge `i18n` do README principal: modo endpoint que lê `.github/badges/i18n.json`
