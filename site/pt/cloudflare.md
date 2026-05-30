# Implantação Cloudflare Workers

A plataforma com **maior precisão de anti-scanner L2** entre as quatro (usa detecção nativa de ASN 8075 para identificar o scanner Microsoft Defender SafeLinks).

## Implantação em um clique

Botão na página inicial → [Início rápido →](/pt/quick-start#_1-clicar-no-botao-deploy-escolher-uma-plataforma)

## Configuração

| Variável | Padrão | Descrição |
|---|---|---|
| `BACKEND_HOST` | `cf-track.laifa.xin` | Hostname do backend de rastreamento |
| `BACKEND_PROTOCOL` | `http:` | Protocolo do backend (dois-pontos obrigatórios) |
| `REDIRECT_TARGET` | `https://www.google.com` | Destino para requisições rejeitadas |

Após a implantação, alterar em **Workers Dashboard → Settings → Variables**. Ou editar a seção `vars` de [`wrangler.jsonc`](https://github.com/suxuemi/email-track-domain/blob/main/wrangler.jsonc) e reimplantar.

## Domínio personalizado

Ver [Vincular domínio personalizado](/pt/custom-domain#cloudflare-worker).

## Diferenças em relação a outras plataformas

| | Cloudflare | Vercel / Netlify / Deno |
|---|---|---|
| Método de detecção L2 | **ASN 8075 nativo** (alta precisão) | Correspondência de faixas IP (média) |
| Atualização das faixas IP L2 necessária? | Não | A cada 3-6 meses |
| Flexibilidade DNS | DNS hospedado no CF | Qualquer DNS via CNAME |
| Cota gratuita | 100K req/dia | 100 GB de tráfego/mês (V, N) ou 1M req/mês (Deno) |
| Runtime | V8 isolate | V8 isolate / Deno |

**Ideal para**: DNS já no Cloudflare, necessidade de máxima precisão anti-scanner (por exemplo, marketing email B2B de alto valor).

**Evitar se**: não quer mover o DNS → use Vercel / Netlify em vez disso.
