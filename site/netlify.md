# Netlify 部署

任意 DNS 接入 + Deno runtime Edge Function。和 Vercel 同档次，看你团队偏好哪家。

## 一键部署

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/suxuemi/email-track-domain)

或复制本模板仓库 URL 到 Netlify 控制台：

```
https://github.com/suxuemi/email-track-domain
```

> 💡 想自己改代码？先 [fork 到你的账号](https://github.com/suxuemi/email-track-domain/fork)，再用你 fork 后的仓库 URL。

## 配置项

| 变量 | 默认 | 说明 |
|---|---|---|
| `BACKEND_HOST` | `cf-track.laifa.xin` | 追踪后端主机名 |
| `BACKEND_PROTOCOL` | `http:` | 后端协议（带冒号） |
| `REDIRECT_TARGET` | `https://www.google.com` | 拒绝跳转目标 |

部署后在 **Netlify Dashboard → Site Settings → Environment Variables** 修改。

## 自定义域名

详见 [绑定自定义域名](/custom-domain#netlify)。

## 与 Cloudflare 的差异

| | Cloudflare | Netlify |
|---|---|---|
| L0/L1 路径过滤 | ✓ | ✓ |
| L2 检测方式 | **ASN 8075 原生**（精度高） | **IP 段匹配**（精度中） |
| L2 IP 段需定期更新 | 否 | 每 3-6 个月 |
| L3 反向代理 | ✓ | ✓ |
| 域名灵活度 | NS 必须托管 CF | **任意 DNS CNAME 接入** |
| Runtime | V8 isolate | Deno |

**适合场景**：DNS 不在 Cloudflare、不想迁移、想要 CNAME 即用即接。

**和 Vercel 选哪个**：功能几乎对等，看你团队习惯哪家管理面板。

IP 段在 [`netlify/edge-functions/track.js`](https://github.com/suxuemi/email-track-domain/blob/main/netlify/edge-functions/track.js) 的 `MICROSOFT_IPV4_RANGES` 常量，更新参考 [`shared/microsoft-ranges.js`](https://github.com/suxuemi/email-track-domain/blob/main/shared/microsoft-ranges.js)。
