# Deno Deploy 部署

Deno Deploy 没有 URL 协议级别的"一键部署按钮"，但 GitHub 集成几乎等价 — 配一次后 push 自动部署。

## 部署步骤

1. 打开 [dash.deno.com/new](https://dash.deno.com/new)
2. 登录后选 **Deploy from GitHub repository**
3. 授权 Deno Deploy 访问你的 GitHub（首次）
4. 选仓库：`suxuemi/email-track-domain`（或你 fork 后的仓库）
5. 配置：
   - **Production branch**: `main`
   - **Entry point**: `deno-deploy/main.js`
   - **Install step**: 留空
   - **Build step**: 留空
6. **Environment Variables**（可选，有默认值）：
   - `BACKEND_HOST` → `cf-track.laifa.xin`
   - `BACKEND_PROTOCOL` → `http:`
   - `REDIRECT_TARGET` → `https://www.google.com`
7. 点 **Deploy Project**

部署后会得到一个 `<project>.deno.dev` 域名。

## 自定义域名

Project Settings → Domains → Add Domain，按提示加 CNAME。详见 [docs/custom-domain.md](../docs/custom-domain.md#deno-deploy)。

## 本地开发

```bash
cd deno-deploy
deno run --allow-net --allow-env main.js
```

默认在 `http://localhost:8000` 起服务。测试：

```bash
curl -I http://localhost:8000/r/test
curl -I http://localhost:8000/test.php   # 应返回 302
```

## 与其他平台的差异

| | Cloudflare | Vercel | Netlify | **Deno Deploy** |
|---|---|---|---|---|
| L2 检测精度 | ASN（高） | IP 段（中） | IP 段（中） | **IP 段（中）** |
| 代码语法 | Worker Module | Edge Function | Edge Function | **Deno.serve()** |
| 一键部署按钮 | 官方 | 官方 | 官方 | **GitHub 集成（1 步手动）** |
| 免费额度 | 100K req/天 | 100GB 流量 | 100GB 流量 | **100 万次/月** |
| 域名灵活度 | NS 锁 CF | CNAME 任意 | CNAME 任意 | **CNAME 任意** |

Deno Deploy 的优势：
- 代码语法**最接近原始 Cloudflare Worker**（`addEventListener('fetch', ...)` 也支持）
- 免费额度最宽松（按请求次数计，不按流量）
- 全球边缘节点最多
