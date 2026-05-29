<div align="center">

# Email Tracking Domain

**Proxy reverso de domínio de rastreamento de email em um clique — aberturas, cliques e anexos sob seu próprio domínio**

![platforms](https://img.shields.io/badge/platforms-Cloudflare%20%7C%20Vercel%20%7C%20Netlify%20%7C%20Deno-orange?style=flat-square)
![license](https://img.shields.io/badge/license-MIT-green?style=flat-square)
![i18n](https://img.shields.io/badge/i18n-8%20languages-blue?style=flat-square)
![stars](https://img.shields.io/github/stars/suxuemi/email-track-domain?style=flat-square&logo=github)

🌐 **Site oficial**: [laifa.xin](https://laifa.xin)

[简体中文](README.md) | [繁體中文](README.zh-TW.md) | [English](README.en.md) | [日本語](README.ja.md) | [Français](README.fr.md) | [Deutsch](README.de.md) | [Español](README.es.md) | **Português**

</div>

---

## Implantação em um clique (escolha entre quatro plataformas)

| Plataforma | Botão | Anti-scanner L2 | Flexibilidade DNS |
|---|---|---|---|
| **Cloudflare Workers** | [![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/suxuemi/email-track-domain) | ASN nativo (precisão máxima) | DNS hospedado no CF |
| **Vercel** | [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/suxuemi/email-track-domain&root-directory=vercel&env=BACKEND_HOST,BACKEND_PROTOCOL,REDIRECT_TARGET&envDescription=Tracking+backend+host) | Faixas IP (média) | Qualquer DNS via CNAME |
| **Netlify** | [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/suxuemi/email-track-domain) | Faixas IP (média) | Qualquer DNS via CNAME |
| **Deno Deploy** | [→ Guia de instalação](deno-deploy/README.pt.md) | Faixas IP (média) | Qualquer DNS via CNAME |

> **Qual escolher?**
> - DNS já no Cloudflare → **CF Worker** (anti-scanner mais preciso)
> - Não quer mover o DNS → **Vercel** ou **Netlify** (CNAME de qualquer provedor DNS)
> - Prefere Deno / quer manter a sintaxe Service Worker nativa → **Deno Deploy**

Após a implantação, **você deve vincular um domínio personalizado** → [docs/custom-domain.pt.md](docs/custom-domain.pt.md)

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
| **L1** | Lista branca de caminhos — apenas caminhos de rastreamento (`/r/`, `/track/`, `/img/`, etc.) e arquivos estáticos na raiz (`.png/.ico`, etc.) | Falha → 302 |
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

> Nota histórica: o comentário do código-fonte original dizia que o ASN 8075 era Google — **isso está incorreto**. 8075 corresponde na verdade a MICROSOFT-CORP-MSN-AS-BLOCK; Surface Pro é um dispositivo Microsoft. Este repositório corrige o comentário.

---

## Tipos de rastreamento suportados

| Tipo | Implementação | Exemplos de caminhos |
|---|---|---|
| Rastreamento de abertura de email | Pixel transparente 1×1 | `/img/p.png?id=xxx`, `/track/open.gif` |
| Rastreamento de cliques em links | Redirecionamento 302 para a URL original | `/r/abc123`, `/l/xxx`, `/link/xxx` |
| **Rastreamento de download de anexos** | Proxy reverso do fluxo de arquivo | `/att/xxx.pdf`, `/attachment/file` |

Os três tipos **compartilham a mesma lógica de proxy reverso** — o rastreamento de anexos funciona imediatamente sem configuração adicional. O Worker encaminha as requisições para o seu backend; seu backend registra o evento e retorna o arquivo/pixel/302.

---

## Configuração

| Variável | Padrão | Descrição |
|---|---|---|
| `BACKEND_HOST` | `cf-track.laifa.xin` | Hostname do backend de rastreamento real |
| `BACKEND_PROTOCOL` | `http:` | Protocolo do backend, dois-pontos obrigatórios (`http:` ou `https:`) |
| `REDIRECT_TARGET` | `https://www.google.com` | Destino para requisições rejeitadas |

Onde modificar:
- **Cloudflare**: Workers Dashboard → Settings → Variables; ou editar `wrangler.jsonc` e reimplantar
- **Vercel**: Project → Settings → Environment Variables
- **Netlify**: Site Settings → Environment Variables
- **Deno Deploy**: Project Settings → Environment Variables

---

## Vinculação de domínio personalizado

Uma implantação é inútil sem vincular seu próprio subdomínio. Ver **[docs/custom-domain.pt.md](docs/custom-domain.pt.md)** (cobre as quatro plataformas).

---

## Desenvolvimento local (opcional)

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
├── docs/custom-domain.md              # guia domínio personalizado (4 plataformas)
├── README.md                          # este arquivo
└── LICENSE                            # MIT
```

---

## Modificar a lista branca de caminhos

Para estender ou modificar a lista branca de caminhos, é preciso sincronizar a constante `ALLOWED_PATH_PREFIXES` nas **quatro** fontes:

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

## Notas

1. **O backend padrão é `cf-track.laifa.xin`** — é o backend de rastreamento do autor do template. Você pode:
   - **Manter o padrão**: seu tráfego passa pelo backend do autor (protocolo HTTP padrão, sem criptografia)
   - **Mudar para o seu**: alterar `BACKEND_HOST` para o endereço do seu backend de rastreamento
2. **Backend HTTP**: padrão `BACKEND_PROTOCOL=http:` porque o backend do autor usa HTTP. Se o seu for HTTPS, mudar para `https:`
3. **Não coloque este domínio em um site normal** — a lista branca de caminhos é muito restritiva; requisições web comuns serão redirecionadas com 302
4. **Cotas gratuitas**:
   - CF Worker: 100.000 requisições/dia
   - Vercel: 100 GB de tráfego/mês
   - Netlify: 100 GB de tráfego/mês
   - Deno Deploy: 1 milhão de requisições/mês

---

## License

MIT — ver [LICENSE](LICENSE).

---

## Contate o autor

- 🌐 Site oficial: [laifa.xin](https://laifa.xin)
- 💬 WeChat (por favor mencione "email track" ao adicionar):

<img src="https://cos.files.maozhishi.com/data/web/web-files/wx/tony-apan.png" alt="WeChat do autor" width="240">

## Créditos

Derivado da infraestrutura de rastreamento de email de [laifa.xin](https://laifa.xin), publicado como código aberto para que os usuários possam implantar seu próprio domínio de rastreamento dedicado.
