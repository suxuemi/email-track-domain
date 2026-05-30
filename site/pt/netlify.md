# Implantação Netlify

Qualquer DNS via CNAME + Edge Function em runtime Deno. No mesmo nível do Vercel; escolha conforme as preferências do painel da sua equipe.

## Implantação em um clique

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/suxuemi/email-track-domain)

Ou cole esta URL do repositório template no console Netlify:

```
https://github.com/suxuemi/email-track-domain
```

## Configuração

| Variável | Padrão | Descrição |
|---|---|---|
| `BACKEND_HOST` | `cf-track.laifa.xin` | Hostname do backend de rastreamento |
| `BACKEND_PROTOCOL` | `http:` | Protocolo do backend (dois-pontos obrigatórios) |
| `REDIRECT_TARGET` | `https://www.google.com` | Destino para requisições rejeitadas |

Após a implantação, alterar em **Netlify Dashboard → Site Settings → Environment Variables**.

## Domínio personalizado

Ver [Vincular domínio personalizado](/pt/custom-domain#netlify).

## Diferenças em relação ao Cloudflare

| | Cloudflare | Netlify |
|---|---|---|
| Filtragem de caminhos L0/L1 | ✓ | ✓ |
| Método de detecção L2 | **ASN 8075 nativo** (alta precisão) | **Correspondência de faixas IP** (média) |
| Atualização das faixas IP L2 necessária? | Não | A cada 3-6 meses |
| Proxy reverso L3 | ✓ | ✓ |
| Flexibilidade DNS | DNS hospedado no CF | **Qualquer DNS via CNAME** |
| Runtime | V8 isolate | Deno |

**Ideal para**: DNS não no Cloudflare, não quer migrar, configuração baseada em CNAME.

**Vercel ou Netlify?**: Os recursos são quase equivalentes — escolha o painel que sua equipe preferir.

As faixas IP estão na constante `MICROSOFT_IPV4_RANGES` em [`netlify/edge-functions/track.js`](https://github.com/suxuemi/email-track-domain/blob/main/netlify/edge-functions/track.js); ver [`shared/microsoft-ranges.js`](https://github.com/suxuemi/email-track-domain/blob/main/shared/microsoft-ranges.js) para orientação de atualização.
