# Vercel 部署

**Language**: **简体中文** · [繁體中文](README.zh-TW.md) · [English](README.en.md) · [日本語](README.ja.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Español](README.es.md) · [Português](README.pt.md)

四层过滤完整。L2 反 Microsoft Defender SafeLinks 扫描器用 IP 段匹配代替 CF 原生 ASN 检测——精度略低（IP 段每隔几个月要更新一次），但够用。

## 一键部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/suxuemi/email-track-domain&root-directory=vercel&env=BACKEND_HOST,BACKEND_PROTOCOL,REDIRECT_TARGET&envDescription=Tracking+backend+host)

或复制本模板仓库 URL 到 Vercel：

```
https://github.com/suxuemi/email-track-domain
```

## 配置项

| 变量 | 默认 | 说明 |
|---|---|---|
| `BACKEND_HOST` | `cf-track.laifa.xin` | 追踪后端主机名 |
| `BACKEND_PROTOCOL` | `http:` | 后端协议，注意带冒号（`http:` 或 `https:`） |
| `REDIRECT_TARGET` | `https://www.google.com` | 拒绝场景的跳转目标 |

部署后在 Vercel Dashboard → Project → Settings → Environment Variables 修改。

## 自定义域名

部署后在 Vercel Dashboard → Project → Settings → Domains 添加你的域名，按提示在 DNS 服务商配 CNAME `track → cname.vercel-dns.com`。详见 [docs/custom-domain.md](../docs/custom-domain.md)。

## 与 Cloudflare Worker 版的差异

| | Cloudflare | Vercel |
|---|---|---|
| L0/L1 路径过滤 | ✓ | ✓ |
| L2 检测方式 | **ASN 8075 原生**（精度高） | **IP 段匹配**（精度中） |
| L2 IP 段需更新 | 否 | 每 3-6 个月 |
| L3 反向代理 | ✓ | ✓ |
| 域名灵活度 | NS 必须托管 CF | 任意 DNS CNAME |

IP 段在 [`api/track.js`](api/track.js) 的 `MICROSOFT_IPV4_RANGES` 常量，更新参考 [`shared/microsoft-ranges.js`](../shared/microsoft-ranges.js) 的注释。
