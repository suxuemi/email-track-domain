# Cloudflare Workers 部署

四個平台中 **L2 反掃描精準度最高**的選項(用 ASN 8075 原生檢測識別 Microsoft Defender SafeLinks 掃描器)。

## 一鍵部署

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/suxuemi/email-track-domain)

或複製本範本倉庫 URL 到 Cloudflare 主控台:

```
https://github.com/suxuemi/email-track-domain
```

## 設定項

| 變數 | 預設 | 說明 |
|---|---|---|
| `BACKEND_HOST` | `cf-track.laifa.xin` | 追蹤後端主機名 |
| `BACKEND_PROTOCOL` | `http:` | 後端協定(帶冒號) |
| `REDIRECT_TARGET` | `https://www.google.com` | 拒絕跳轉目標 |

部署後在 **Workers Dashboard → Settings → Variables** 修改。或改 [`wrangler.jsonc`](https://github.com/suxuemi/email-track-domain/blob/main/wrangler.jsonc) 的 `vars` 段後重新部署。

## 自訂網域

詳見 [綁定自訂網域](/zh-TW/custom-domain#cloudflare-worker)。

## 與其他平台的差異

| | Cloudflare | Vercel / Netlify / Deno |
|---|---|---|
| L2 檢測方式 | **ASN 8075 原生**(精準度高) | IP 段比對(精準度中) |
| L2 IP 段需定期更新 | 否 | 每 3-6 個月 |
| 網域靈活度 | NS 必須託管 CF | 任意 DNS CNAME 接入 |
| 免費額度 | 10 萬次/天 | 100GB 流量/月(V、N)或 100 萬次/月(Deno) |
| Runtime | V8 isolate | V8 isolate / Deno |

**適合場景**:DNS 已經在 Cloudflare 上、對反掃描精準度要求最高(如 B2B 高客單價郵件行銷)。

**不適合場景**:DNS 在其他服務商不想動 → 選 Vercel / Netlify。
