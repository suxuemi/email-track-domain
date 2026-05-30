# Cloudflare Workers 部署

四个平台中 **L2 反扫描精度最高**的选项（用 ASN 8075 原生检测识别 Microsoft Defender SafeLinks 扫描器）。

## 一键部署

按钮见首页 [快速开始 →](/quick-start#_1-点-deploy-按钮-选一个平台)

## 配置项

| 变量 | 默认 | 说明 |
|---|---|---|
| `BACKEND_HOST` | `cf-track.laifa.xin` | 追踪后端主机名 |
| `BACKEND_PROTOCOL` | `http:` | 后端协议（带冒号） |
| `REDIRECT_TARGET` | `https://www.google.com` | 拒绝跳转目标 |

部署后在 **Workers Dashboard → Settings → Variables** 修改。或改 [`wrangler.jsonc`](https://github.com/suxuemi/email-track-domain/blob/main/wrangler.jsonc) 的 `vars` 段后重新部署。

## 自定义域名

详见 [绑定自定义域名](/custom-domain#cloudflare-worker)。

## 与其他平台的差异

| | Cloudflare | Vercel / Netlify / Deno |
|---|---|---|
| L2 检测方式 | **ASN 8075 原生**（精度高） | IP 段匹配（精度中） |
| L2 IP 段需定期更新 | 否 | 每 3-6 个月 |
| 域名灵活度 | NS 必须托管 CF | 任意 DNS CNAME 接入 |
| 免费额度 | 10 万次/天 | 100GB 流量/月（V、N）或 100 万次/月（Deno） |
| Runtime | V8 isolate | V8 isolate / Deno |

**适合场景**：DNS 已经在 Cloudflare 上、对反扫描精度要求最高（如 B2B 高客单价邮件营销）。

**不适合场景**：DNS 在其他服务商不想动 → 选 Vercel / Netlify。
