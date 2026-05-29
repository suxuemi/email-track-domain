# Vincular um domínio personalizado

**Language**: [简体中文](custom-domain.md) · [繁體中文](custom-domain.zh-TW.md) · [English](custom-domain.en.md) · [日本語](custom-domain.ja.md) · [Français](custom-domain.fr.md) · [Deutsch](custom-domain.de.md) · [Español](custom-domain.es.md) · **Português**

Após a implantação, você precisa apontar seu próprio domínio para a plataforma de implantação para que os links de rastreamento de email usem seu próprio domínio.

Flexibilidade DNS das quatro plataformas:

| Plataforma | Requisito DNS | Método de conexão |
|---|---|---|
| Cloudflare Workers | Toda a zona DNS deve estar hospedada no CF | Nível NS |
| Vercel | Qualquer provedor DNS | CNAME |
| Netlify | Qualquer provedor DNS | CNAME |
| Deno Deploy | Qualquer provedor DNS | CNAME |

---

## Cloudflare Worker

> Pré-requisito: seu domínio já está hospedado no Cloudflare (DNS no Cloudflare).

### Opção A: Workers Routes (recomendado — assume o subdomínio inteiro)

Adequado para: dedicar um subdomínio (por exemplo `track.yourdomain.com`) ao rastreamento.

1. Abrir Cloudflare Dashboard → selecionar seu domínio
2. Barra lateral esquerda **DNS** → **Records** → Add record
   - Type: `AAAA`
   - Name: `track` (ou qualquer subdomínio que desejar)
   - IPv6 address: `100::` (endereço placeholder, o Worker lida com todas as requisições)
   - Proxy status: **Proxied** (a nuvem laranja deve estar ativada)
3. Barra lateral esquerda **Workers Routes** → Add route
   - Route: `track.yourdomain.com/*`
   - Worker: selecionar o `email-track-domain` recém-implantado
4. Efeito em minutos. Visite `https://track.yourdomain.com/r/test` para verificar se chega ao seu backend.

### Opção B: Worker Custom Domain (mais simples)

Adequado para: vincular um projeto Workers diretamente a um domínio (Cloudflare gerencia DNS e SSL automaticamente).

1. Abrir Workers Dashboard → selecionar o Worker `email-track-domain`
2. **Settings** → **Triggers** → **Custom Domains** → Add Custom Domain
3. Inserir `track.yourdomain.com`, confirmar
4. Cloudflare cria automaticamente os registros DNS e emite um certificado SSL

Diferença: a Opção A é flexível (pode rotear caminhos específicos), a Opção B vincula o domínio inteiro (mais simples). A maioria dos usuários deve escolher B.

---

## Vercel

1. Abrir Vercel Dashboard → selecionar projeto → **Settings** → **Domains**
2. Inserir `track.yourdomain.com`, Add
3. Vercel mostrará o registro DNS que você precisa adicionar no seu provedor DNS, similar a:
   ```
   Type: CNAME
   Name: track
   Value: cname.vercel-dns.com
   ```
4. Após adicionar o DNS, aguardar alguns minutos para que o Vercel emita automaticamente o certificado SSL

---

## Netlify

1. Abrir Netlify Dashboard → selecionar site → **Domain management** → **Custom domains** → **Add a domain**
2. Inserir `track.yourdomain.com` → **Verify** → **Yes, add domain**
3. Netlify mostra os registros DNS a adicionar no seu provedor DNS:
   ```
   Type: CNAME
   Name: track
   Value: <your-site>.netlify.app
   ```
4. Aguardar a emissão do SSL (minutos a 24 horas)

---

## Deno Deploy <a id="deno-deploy"></a>

1. Abrir [dash.deno.com](https://dash.deno.com) → selecionar projeto → **Settings** → **Domains** → **Add Domain**
2. Inserir `track.yourdomain.com`, Deno Deploy fornece dois registros:
   ```
   Type: A      Name: track  Value: <your-IPv4>   (exemplo, usar o valor real)
   Type: AAAA   Name: track  Value: ...           (IPv6)
   ```
   Ou usar CNAME:
   ```
   Type: CNAME  Name: track  Value: <project>.deno.dev
   ```
3. Adicionar os registros DNS, depois voltar ao Deno Deploy e clicar em **Verify**
4. SSL emitido automaticamente

---

## Verificação

Após implantação + vinculação, visitar no navegador:

| URL | Comportamento esperado |
|---|---|
| `https://track.yourdomain.com/` | Redirecionamento 302 para google.com (raiz não na lista branca) |
| `https://track.yourdomain.com/test.php` | Redirecionamento 302 para google.com (extensão bloqueada) |
| `https://track.yourdomain.com/r/abc123` | Encaminhado para o seu backend (caminho permitido) |
| `https://track.yourdomain.com/favicon.ico` | Encaminhado para o seu backend (arquivo raiz permitido) |

Se a terceira retornar 502 "Backend fetch failed", `BACKEND_HOST` está mal configurado ou o backend está inacessível.

---

## Uso em emails

Substituir todos os links de rastreamento em seus emails que apontavam para `cf-track.laifa.xin` por `track.yourdomain.com`. Por exemplo:

```
Antes: http://cf-track.laifa.xin/r/abc123
Depois: https://track.yourdomain.com/r/abc123
```

As estatísticas de abertura/clique continuam fluindo para o seu backend original, mas os destinatários veem seu próprio domínio — mais profissional e melhora seu escore anti-spam.
