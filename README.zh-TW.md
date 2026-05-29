# Email Tracking Domain（郵件追蹤網域一鍵部署）

> 一鍵部署你專屬的郵件追蹤網域反向代理。在自己的網域下提供郵件開信/點擊追蹤能力，避免共享網域被反垃圾系統識別。

**Language**: [简体中文](README.md) · **繁體中文** · [English](README.en.md) · [日本語](README.ja.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Español](README.es.md) · [Português](README.pt.md)

## 一鍵部署(四個平台任選)

| 平台 | 按鈕 | L2 反掃描 | 網域靈活度 |
|---|---|---|---|
| **Cloudflare Workers** | [![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/suxuemi/email-track-domain) | ASN 原生(最準) | NS 必須託管 CF |
| **Vercel** | [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/suxuemi/email-track-domain&root-directory=vercel&env=BACKEND_HOST,BACKEND_PROTOCOL,REDIRECT_TARGET&envDescription=BACKEND_HOST%3D%E4%BD%A0%E7%9A%84%E8%BF%BD%E8%B8%AA%E5%90%8E%E7%AB%AF%E5%9F%9F%E5%90%8D) | IP 段(中) | CNAME 任意 DNS |
| **Netlify** | [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/suxuemi/email-track-domain) | IP 段(中) | CNAME 任意 DNS |
| **Deno Deploy** | [→ 部署指南](deno-deploy/README.zh-TW.md) | IP 段(中) | CNAME 任意 DNS |

> **挑哪個?**
> - DNS 已經在 Cloudflare → **CF Worker**(最準的反掃描)
> - DNS 在別處不想動 → **Vercel** 或 **Netlify**(任意 DNS CNAME 接入)
> - 喜歡 Deno / 想保留 Service Worker 原生語法 → **Deno Deploy**

部署後**必須綁定自訂網域**才有意義 → [docs/custom-domain.md](docs/custom-domain.zh-TW.md)

---

## 這是幹嘛的

你的郵件行銷/通知系統會在郵件裡塞**追蹤像素**和**帶跳轉 ID 的連結**，統計「誰開信了」「誰點擊了」。這些連結背後是一個追蹤後端(如 `cf-track.laifa.xin`)。

**問題**:
- 直接用追蹤後端的網域 → 大量發信 → 網域被反垃圾系統列入黑名單
- 共享追蹤網域 → 其他使用者行為汙染你的網域信譽
- Microsoft Defender / Outlook 會自動 GET 郵件裡的連結預掃描 → 汙染你的開信率/點擊率統計

**這個 Worker 怎麼解決**:

用你**自己的網域**做一個反向代理層,加四層過濾:

```
郵件收件人點擊 → 你的網域(track.yourdomain.com)
                    ↓
         ┌──────────────────────┐
         │  Worker / Edge Func  │
         │                      │
         │  L0 .php/.aspx 黑名單 │ → 302 google.com
         │  L1 路徑白名單         │ → 302 google.com
         │  L2 反 MS 掃描指紋    │ → 302 google.com
         │  L3 反向代理          │
         └──────────────────────┘
                    ↓
         真實追蹤後端(cf-track.laifa.xin 或你自己的)
                    ↓
         記錄開信/點擊 + 回傳像素/重新導向
```

收件人看到的是**你自己的網域**,但資料依然走原追蹤後端。

---

## 四層過濾詳解

| 層 | 作用 | 命中後果 |
|---|---|---|
| **L0** | 副檔名黑名單 — `.php` / `.aspx` 是常見掃描器特徵 | 302 → google.com |
| **L1** | 路徑白名單 — 只放行追蹤用路徑(`/r/`、`/track/`、`/img/` 等)和根目錄常見靜態檔案(`.png/.ico` 等) | 不命中 → 302 |
| **L2** | 反 Microsoft Defender SafeLinks 掃描指紋(標頭 + ASN/IP 段) | 302 → google.com |
| **L3** | 反向代理到 `BACKEND_HOST`,原路徑/參數原封轉發 | — |

### 關於 L2 的兩種實作

```
標頭指紋(所有平台一致)        Referer 空 + Sec-CH-UA-Model="Surface Pro"
網路指紋(按平台分兩路)
  ├─ Cloudflare Worker        ASN 8075(MICROSOFT-CORP-MSN-AS-BLOCK)原生精準
  └─ Vercel/Netlify/Deno      IP 段比對(備援方案)
```

**關於 IP 段備援**:Vercel/Netlify/Deno 拿不到 ASN,所以用硬編碼的 Microsoft IP 段(EOP outbound + Microsoft 365 services + MS Corp 歷史段)做比對。精準度比 ASN 略低,IP 段每 3-6 個月需同步一次。

> 歷史背景:原始碼註解寫 ASN 8075 是 Google,**這是錯的**。8075 實際是 MICROSOFT-CORP-MSN-AS-BLOCK;Surface Pro 是微軟裝置。本倉庫已修正。

---

## 設定項

| 變數 | 預設值 | 說明 |
|---|---|---|
| `BACKEND_HOST` | `cf-track.laifa.xin` | 真實追蹤後端的主機名 |
| `BACKEND_PROTOCOL` | `http:` | 後端協定,注意要帶冒號(`http:` 或 `https:`) |
| `REDIRECT_TARGET` | `https://www.google.com` | 拒絕場景的跳轉目標 |

修改方式:
- **Cloudflare**:Workers Dashboard → Settings → Variables;或改 `wrangler.jsonc` 重新部署
- **Vercel**:Project → Settings → Environment Variables
- **Netlify**:Site Settings → Environment Variables
- **Deno Deploy**:Project Settings → Environment Variables

---

## 自訂網域綁定

部署後必須綁定你自己的子網域才有意義。詳見 **[docs/custom-domain.md](docs/custom-domain.zh-TW.md)**(已涵蓋四個平台)。

---

## 本地開發(可選)

### Cloudflare
```bash
npm install -g wrangler
wrangler login
wrangler dev      # 本地啟動
wrangler deploy   # 部署
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
deno run --allow-net --allow-env main.js   # 本地啟動於 :8000
# 部署走 GitHub 整合(dash.deno.com/new),不用 CLI
```

---

## 倉庫結構

```
.
├── src/index.js                       # Cloudflare Worker(ASN + IP 雙檢)
├── wrangler.jsonc                     # Cloudflare 設定
├── vercel/
│   ├── api/track.js                   # Vercel Edge Function(IP 檢)
│   ├── vercel.json
│   ├── package.json
│   └── README.md
├── netlify.toml                       # Netlify 設定
├── netlify/edge-functions/track.js    # Netlify Edge Function(IP 檢)
├── deno-deploy/
│   ├── main.js                        # Deno Deploy(IP 檢)
│   └── README.md
├── shared/microsoft-ranges.js         # Microsoft IP 段 source of truth
├── public/index.html                  # Netlify publish 目錄佔位
├── docs/custom-domain.md              # 自訂網域教學(四平台涵蓋)
├── README.md                          # 你在看的這個
└── LICENSE                            # MIT
```

---

## 路徑白名單怎麼改

要擴充或修改路徑白名單,需要同步改 **四個** 平台原始碼的 `ALLOWED_PATH_PREFIXES` 常數:

- `src/index.js`(CF)
- `vercel/api/track.js`
- `netlify/edge-functions/track.js`
- `deno-deploy/main.js`

改完 push 即可,各平台會自動重新部署(CF 需手動 `wrangler deploy`)。

---

## 更新 Microsoft IP 段

`shared/microsoft-ranges.js` 是 source of truth。同步流程:

1. 從 [endpoints.office.com](https://endpoints.office.com/endpoints/worldwide) 或 [bgpview.io/asn/8075](https://bgpview.io/asn/8075) 拉最新資料
2. 更新 `shared/microsoft-ranges.js` 的 `MICROSOFT_IPV4_RANGES`
3. 同步到四個平台的 `MICROSOFT_IPV4_RANGES` 常數
4. Commit + push

建議每 3-6 個月同步一次。CF 用 ASN 檢測不受影響,其餘三家會受影響。

---

## 注意事項

1. **後端預設是 `cf-track.laifa.xin`** — 這是範本作者的追蹤後端。你可以:
   - **保留預設**:你的流量會經過原作者的後端(預設協定是 HTTP,不加密)
   - **改成你自己的**:把 `BACKEND_HOST` 改成你的追蹤後端網址
2. **HTTP 後端**:預設 `BACKEND_PROTOCOL=http:` 是因為原作者後端走 HTTP。後端是 HTTPS 記得改 `https:`
3. **不要把這個網域掛在做正常 web 服務的網域上** — 路徑白名單非常窄,正常 web 請求都會被 302 走
4. **免費額度**:
   - CF Worker:10 萬次/天
   - Vercel:100GB 流量/月
   - Netlify:100GB 流量/月
   - Deno Deploy:100 萬次/月

---

## License

MIT — 見 [LICENSE](LICENSE)。

---

## 聯絡作者

- 🌐 官網:[laifa.xin](https://laifa.xin)
- 💬 微信諮詢(添加請備註「email track」):

<img src="https://cos.files.maozhishi.com/data/web/web-files/wx/tony-apan.png" alt="作者微信" width="240">

## 致謝

源自 [來發信](https://laifa.xin) 的郵件追蹤基礎設施,公開發布以便使用者自部署專屬追蹤網域。
