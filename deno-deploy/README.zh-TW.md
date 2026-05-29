# Deno Deploy 部署

**Language**: [简体中文](README.md) · **繁體中文** · [English](README.en.md) · [日本語](README.ja.md) · [Français](README.fr.md) · [Deutsch](README.de.md)

Deno Deploy 沒有 URL 協定層級的「一鍵部署按鈕」,但 GitHub 整合幾乎等價 — 配一次後 push 自動部署。

## 部署步驟

1. 開啟 [dash.deno.com/new](https://dash.deno.com/new)
2. 登入後選 **Deploy from GitHub repository**
3. 授權 Deno Deploy 存取你的 GitHub(首次)
4. 選倉庫:`suxuemi/email-track-domain`(或你 fork 後的倉庫)
5. 設定:
   - **Production branch**: `main`
   - **Entry point**: `deno-deploy/main.js`
   - **Install step**: 留空
   - **Build step**: 留空
6. **Environment Variables**(可選,有預設值):
   - `BACKEND_HOST` → `cf-track.laifa.xin`
   - `BACKEND_PROTOCOL` → `http:`
   - `REDIRECT_TARGET` → `https://www.google.com`
7. 點 **Deploy Project**

部署後會得到一個 `<project>.deno.dev` 網域。

## 自訂網域

Project Settings → Domains → Add Domain,按提示加 CNAME。詳見 [docs/custom-domain.zh-TW.md](../docs/custom-domain.zh-TW.md#deno-deploy)。

## 本地開發

```bash
cd deno-deploy
deno run --allow-net --allow-env main.js
```

預設在 `http://localhost:8000` 啟動服務。測試:

```bash
curl -I http://localhost:8000/r/test
curl -I http://localhost:8000/test.php   # 應傳回 302
```

## 與其他平台的差異

| | Cloudflare | Vercel | Netlify | **Deno Deploy** |
|---|---|---|---|---|
| L2 檢測精準度 | ASN(高) | IP 段(中) | IP 段(中) | **IP 段(中)** |
| 程式碼語法 | Worker Module | Edge Function | Edge Function | **Deno.serve()** |
| 一鍵部署按鈕 | 官方 | 官方 | 官方 | **GitHub 整合(1 步手動)** |
| 免費額度 | 100K req/天 | 100GB 流量 | 100GB 流量 | **100 萬次/月** |
| 網域靈活度 | NS 鎖 CF | CNAME 任意 | CNAME 任意 | **CNAME 任意** |

Deno Deploy 的優勢:
- 程式碼語法**最接近原始 Cloudflare Worker**(`addEventListener('fetch', ...)` 也支援)
- 免費額度最寬鬆(按請求次數計,不按流量)
- 全球邊緣節點最多
