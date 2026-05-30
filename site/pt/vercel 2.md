# Implantação Vercel


Filtragem em quatro estágios completa. O anti-scanner L2 do Microsoft Defender SafeLinks usa correspondência de faixas de IP em vez da detecção nativa de ASN do CF — precisão ligeiramente menor (as faixas de IP precisam ser atualizadas a cada poucos meses), mas suficiente.

## Implantação em um clique

Botão na raiz do repositório [quick-start.md](../quick-start.md).

## Configuração

| Variável | Padrão | Descrição |
|---|---|---|
| `BACKEND_HOST` | `cf-track.laifa.xin` | Hostname do backend de rastreamento |
| `BACKEND_PROTOCOL` | `http:` | Protocolo do backend, dois-pontos obrigatórios (`http:` ou `https:`) |
| `REDIRECT_TARGET` | `https://www.google.com` | Destino para requisições rejeitadas |

Após a implantação, alterar em Vercel Dashboard → Project → Settings → Environment Variables.

## Domínio personalizado

Após a implantação, vá em Vercel Dashboard → Project → Settings → Domains, adicione seu domínio e siga as instruções para adicionar um CNAME `track → cname.vercel-dns.com` no seu provedor DNS. Detalhes em [custom-domain.md](../custom-domain.md).

## Diferenças em relação ao Cloudflare Worker

| | Cloudflare | Vercel |
|---|---|---|
| Filtragem de caminhos L0/L1 | ✓ | ✓ |
| Método de detecção L2 | **ASN 8075 nativo** (alta precisão) | **Correspondência de faixas IP** (média) |
| Atualização das faixas IP L2 necessária? | Não | A cada 3-6 meses |
| Proxy reverso L3 | ✓ | ✓ |
| Flexibilidade DNS | DNS hospedado no CF | Qualquer DNS via CNAME |

As faixas IP estão na constante `MICROSOFT_IPV4_RANGES` em [`api/track.js`](api/track.js); atualizar conforme os comentários em [`shared/microsoft-ranges.js`](../shared/microsoft-ranges.js).
