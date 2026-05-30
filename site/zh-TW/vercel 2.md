# Vercel 部署


四層過濾完整。L2 反 Microsoft Defender SafeLinks 掃描器用 IP 段比對代替 CF 原生 ASN 檢測——精準度略低(IP 段每隔幾個月要更新一次),但夠用。

## 一鍵部署

按鈕見倉庫根目錄 [quick-start.md](../quick-start.md)。

## 設定項

| 變數 | 預設值 | 說明 |
|---|---|---|
| `BACKEND_HOST` | `cf-track.laifa.xin` | 追蹤後端主機名 |
| `BACKEND_PROTOCOL` | `http:` | 後端協定,注意帶冒號(`http:` 或 `https:`) |
| `REDIRECT_TARGET` | `https://www.google.com` | 拒絕場景的跳轉目標 |

部署後在 Vercel Dashboard → Project → Settings → Environment Variables 修改。

## 自訂網域

部署後在 Vercel Dashboard → Project → Settings → Domains 加入你的網域,按提示在 DNS 服務商配 CNAME `track → cname.vercel-dns.com`。詳見 [custom-domain.md](../custom-domain.md)。

## 與 Cloudflare Worker 版的差異

| | Cloudflare | Vercel |
|---|---|---|
| L0/L1 路徑過濾 | ✓ | ✓ |
| L2 檢測方式 | **ASN 8075 原生**(精準度高) | **IP 段比對**(精準度中) |
| L2 IP 段需更新 | 否 | 每 3-6 個月 |
| L3 反向代理 | ✓ | ✓ |
| 網域靈活度 | NS 必須託管 CF | 任意 DNS CNAME |

IP 段在 [`api/track.js`](api/track.js) 的 `MICROSOFT_IPV4_RANGES` 常數,更新參考 [`shared/microsoft-ranges.js`](../shared/microsoft-ranges.js) 的註解。
