# Vercel 部署（降级版）

⚠️ **此版本相比 Cloudflare Worker 版缺少 L2 反 Microsoft 扫描器能力**。原因：Vercel Edge Runtime 不暴露请求 ASN，无法识别微软 SafeLinks 扫描指纹。

如果不在意这一层（你的邮件主要发给 Gmail / 私人邮箱），Vercel 版完全够用。如果发 Outlook / 企业邮箱（Defender 防护）较多，**建议用 Cloudflare 版**。

## 一键部署

部署按钮见仓库根目录 [README.md](../README.md)。

## 配置项（部署时填）

| 变量 | 默认 | 说明 |
|---|---|---|
| `BACKEND_HOST` | `cf-track.laifa.xin` | 追踪后端主机名 |
| `BACKEND_PROTOCOL` | `http:` | 后端协议（注意要带冒号，`http:` 或 `https:`） |
| `REDIRECT_TARGET` | `https://www.google.com` | 拒绝场景的跳转目标 |

部署后可在 Vercel Dashboard → Project → Settings → Environment Variables 修改。

## 自定义域名

部署后在 Vercel Dashboard → Project → Settings → Domains 添加你的域名，配置 CNAME 即可。详见 [docs/custom-domain.md](../docs/custom-domain.md)。
