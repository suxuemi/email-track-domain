# 綁定自訂網域

**Language**: [简体中文](custom-domain.md) · **繁體中文** · [English](custom-domain.en.md) · [日本語](custom-domain.ja.md) · [Français](custom-domain.fr.md) · [Deutsch](custom-domain.de.md) · [Español](custom-domain.es.md) · [Português](custom-domain.pt.md)

部署完成後,需要把你的網域指向部署平台,郵件追蹤連結才會用你自己的網域。

四個平台的網域靈活度:

| 平台 | DNS 要求 | 接入方式 |
|---|---|---|
| Cloudflare Workers | 整域 DNS 必須託管在 CF | NS 接入 |
| Vercel | 任意 DNS 服務商 | CNAME 接入 |
| Netlify | 任意 DNS 服務商 | CNAME 接入 |
| Deno Deploy | 任意 DNS 服務商 | CNAME 接入 |

---

## Cloudflare Worker

> 前提:你的網域已經在 Cloudflare 上託管(DNS 在 Cloudflare)。

### 方式 A:Workers Routes(推薦 — 子網域整體接管)

適合:用一個子網域(如 `track.yourdomain.com`)專門給追蹤用。

1. 進 Cloudflare Dashboard → 選你的網域
2. 左側 **DNS** → **Records** → Add record
   - Type: `AAAA`
   - Name: `track`(或你想要的子網域)
   - IPv6 address: `100::`(佔位地址,Worker 會接管所有請求)
   - Proxy status: **Proxied**(橘色雲朵必須開)
3. 左側 **Workers Routes** → Add route
   - Route: `track.yourdomain.com/*`
   - Worker: 選擇剛部署的 `email-track-domain`
4. 幾分鐘內生效。存取 `https://track.yourdomain.com/r/test` 測試是否打到你的後端。

### 方式 B:Worker Custom Domain(更簡單)

適合:Workers 專案直接綁定網域(Cloudflare 自動配 DNS 和 SSL)。

1. 進 Workers Dashboard → 選 `email-track-domain` Worker
2. **Settings** → **Triggers** → **Custom Domains** → Add Custom Domain
3. 輸入 `track.yourdomain.com`,確認
4. Cloudflare 會自動建 DNS 記錄 + 簽 SSL 證書

差異:方式 A 靈活(可以路由部分路徑),方式 B 直接綁網域(更省事)。一般使用者用 B。

---

## Vercel

1. 進 Vercel Dashboard → 選專案 → **Settings** → **Domains**
2. 輸入 `track.yourdomain.com`,Add
3. Vercel 會告訴你需要在 DNS 服務商處加一條 CNAME 記錄,類似:
   ```
   Type: CNAME
   Name: track
   Value: cname.vercel-dns.com
   ```
4. 加完 DNS 等幾分鐘,Vercel 自動簽 SSL 證書

---

## Netlify

1. 進 Netlify Dashboard → 選站點 → **Domain management** → **Custom domains** → **Add a domain**
2. 輸入 `track.yourdomain.com` → **Verify** → **Yes, add domain**
3. Netlify 顯示需要加的 DNS 記錄,去 DNS 服務商配置:
   ```
   Type: CNAME
   Name: track
   Value: <your-site>.netlify.app
   ```
4. 等 SSL 自動簽發(幾分鐘到 24 小時)

---

## Deno Deploy <a id="deno-deploy"></a>

1. 進 [dash.deno.com](https://dash.deno.com) → 選專案 → **Settings** → **Domains** → **Add Domain**
2. 輸入 `track.yourdomain.com`,Deno Deploy 給出兩條記錄:
   ```
   Type: A      Name: track  Value: 34.120.54.55   (範例,以實際為準)
   Type: AAAA   Name: track  Value: ...           (IPv6)
   ```
   或者用 CNAME:
   ```
   Type: CNAME  Name: track  Value: <project>.deno.dev
   ```
3. 去 DNS 服務商加完後回 Deno Deploy 點 **Verify**
4. 自動簽 SSL

---

## 驗證

部署 + 綁定完成後,瀏覽器存取:

| URL | 期望行為 |
|---|---|
| `https://track.yourdomain.com/` | 302 跳轉到 google.com(根目錄不在白名單) |
| `https://track.yourdomain.com/test.php` | 302 跳轉到 google.com(黑名單副檔名) |
| `https://track.yourdomain.com/r/abc123` | 轉發到你的後端(白名單路徑) |
| `https://track.yourdomain.com/favicon.ico` | 轉發到你的後端(白名單根檔案) |

如果第三條傳回 502 "Backend fetch failed",說明你的後端 `BACKEND_HOST` 設定不對或後端不通。

---

## 在郵件中使用

把郵件裡原本指向 `cf-track.laifa.xin` 的追蹤連結全部替換成 `track.yourdomain.com` 即可。例如:

```
原:http://cf-track.laifa.xin/r/abc123
改:https://track.yourdomain.com/r/abc123
```

開信率/點擊率統計依然走你原來的後端,但收件人看到的是你自己的網域 — 更專業,反垃圾郵件得分也更高。
