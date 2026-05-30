# 架構與技術參考


> 本文件面向開發者 / 技術好奇者。如果你只想部署使用,看主 [README](../quick-start.md) 的「3 步搞定」即可。

---

## 這是幹嘛的

你的郵件行銷/通知系統會在郵件裡塞**追蹤像素**和**帶跳轉 ID 的連結**,統計「誰開信了」「誰點擊了」。這些連結背後是一個追蹤後端(如 `cf-track.laifa.xin`)。

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
| **L1** | 路徑白名單 — 只放行追蹤用路徑(`/r/`、`/track/`、`/img/`、`/att/`、`/attachment/` 等)和根目錄常見靜態檔案(`.png/.ico` 等) | 不命中 → 302 |
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
│   └── quick-start.md
├── netlify.toml                       # Netlify 設定
├── netlify/edge-functions/track.js    # Netlify Edge Function(IP 檢)
├── deno-deploy/
│   ├── main.js                        # Deno Deploy(IP 檢)
│   └── quick-start.md
├── shared/microsoft-ranges.js         # Microsoft IP 段 source of truth
├── public/index.html                  # Netlify publish 目錄佔位
├── docs/
│   ├── custom-domain.md               # 自訂網域教學(四平台涵蓋)
│   └── architecture.md                # 本文件
├── CHANGELOG.md                       # 版本歷史(英文)
├── quick-start.md                          # 主 README(精簡版)
└── LICENSE                            # MIT
```

---

## 本地開發

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

## 路徑白名單怎麼改

要擴充或修改 `ALLOWED_PATH_PREFIXES`,需要同步改 **四個** 平台原始碼:

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

## 平台對比

| 平台 | L2 反掃描 | 網域靈活度 | 免費額度 |
|---|---|---|---|
| **Cloudflare Workers** | ASN 原生(最準) | 需 NS 託管 CF | 10 萬次/天 |
| **Vercel** | IP 段比對 | CNAME 任意 DNS | 100GB 流量/月 |
| **Netlify** | IP 段比對 | CNAME 任意 DNS | 100GB 流量/月 |
| **Deno Deploy** | IP 段比對 | CNAME 任意 DNS | 100 萬次/月 |

---

## 注意事項

1. **後端預設是 `cf-track.laifa.xin`** — 這是範本作者的追蹤後端。你可以:
   - **保留預設**:你的流量會經過原作者的後端(預設協定是 HTTP,不加密)
   - **改成你自己的**:把 `BACKEND_HOST` 改成你的追蹤後端網址
2. **HTTP 後端**:預設 `BACKEND_PROTOCOL=http:` 是因為原作者後端走 HTTP。後端是 HTTPS 記得改 `https:`
3. **不要把這個網域掛在做正常 web 服務的網域上** — 路徑白名單非常窄,正常 web 請求都會被 302 走

---

## CI 自動化(倉庫內部)

- `.github/workflows/update-i18n-badge.yml`:push README*.md 後自動重算 i18n 徽章 JSON
- 主 README `release` 徽章:從 GitHub Releases API 即時讀最新 tag
- 主 README `i18n` 徽章:endpoint 模式讀 `.github/badges/i18n.json`
