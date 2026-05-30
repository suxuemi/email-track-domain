# Netlify 部署

任意 DNS 接入 + Deno runtime Edge Function。和 Vercel 同檔次,看你團隊偏好哪家。

## 一鍵部署

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/suxuemi/email-track-domain)

或複製本範本倉庫 URL 到 Netlify 主控台:

```
https://github.com/suxuemi/email-track-domain
```

> 💡 想自己改程式碼?先 [fork 到你的帳號](https://github.com/suxuemi/email-track-domain/fork),再用你 fork 後的倉庫 URL。

## 設定項

| 變數 | 預設 | 說明 |
|---|---|---|
| `BACKEND_HOST` | `cf-track.laifa.xin` | 追蹤後端主機名 |
| `BACKEND_PROTOCOL` | `http:` | 後端協定(帶冒號) |
| `REDIRECT_TARGET` | `https://www.google.com` | 拒絕跳轉目標 |

部署後在 **Netlify Dashboard → Site Settings → Environment Variables** 修改。

## 自訂網域

詳見 [綁定自訂網域](/zh-TW/custom-domain#netlify)。

## 與 Cloudflare 的差異

| | Cloudflare | Netlify |
|---|---|---|
| L0/L1 路徑過濾 | ✓ | ✓ |
| L2 檢測方式 | **ASN 8075 原生**(精準度高) | **IP 段比對**(精準度中) |
| L2 IP 段需定期更新 | 否 | 每 3-6 個月 |
| L3 反向代理 | ✓ | ✓ |
| 網域靈活度 | NS 必須託管 CF | **任意 DNS CNAME 接入** |
| Runtime | V8 isolate | Deno |

**適合場景**:DNS 不在 Cloudflare、不想遷移、想要 CNAME 即用即接。

**和 Vercel 選哪個**:功能幾乎對等,看你團隊習慣哪家管理面板。

IP 段在 [`netlify/edge-functions/track.js`](https://github.com/suxuemi/email-track-domain/blob/main/netlify/edge-functions/track.js) 的 `MICROSOFT_IPV4_RANGES` 常數,更新參考 [`shared/microsoft-ranges.js`](https://github.com/suxuemi/email-track-domain/blob/main/shared/microsoft-ranges.js)。
