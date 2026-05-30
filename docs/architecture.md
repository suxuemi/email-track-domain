# 架构与技术参考

**Language**: **简体中文** · [繁體中文](architecture.zh-TW.md) · [English](architecture.en.md) · [日本語](architecture.ja.md) · [Français](architecture.fr.md) · [Deutsch](architecture.de.md) · [Español](architecture.es.md) · [Português](architecture.pt.md)

> 本文档面向开发者 / 技术好奇者。如果你只想部署使用，看主 [README](../README.md) 的「3 步搞定」即可。

---

## 这是干嘛的

你的邮件营销/通知系统会在邮件里塞**追踪像素**和**带跳转 ID 的链接**，统计「谁打开了」「谁点击了」。这些链接背后是一个追踪后端（如 `cf-track.laifa.xin`）。

**问题**：
- 直接用追踪后端的域名 → 大量发件 → 域名被反垃圾系统列入黑名单
- 共享追踪域名 → 其他用户行为污染你的域名声誉
- Microsoft Defender / Outlook 会自动 GET 邮件里的链接预扫描 → 污染你的打开率/点击率统计

**这个 Worker 怎么解决**：

用你**自己的域名**做一个反向代理层，加四层过滤：

```
邮件收件人点击 → 你的域名（track.yourdomain.com）
                    ↓
         ┌──────────────────────┐
         │  Worker / Edge Func  │
         │                      │
         │  L0 .php/.aspx 黑名单 │ → 302 google.com
         │  L1 路径白名单         │ → 302 google.com
         │  L2 反 MS 扫描指纹    │ → 302 google.com
         │  L3 反向代理          │
         └──────────────────────┘
                    ↓
         真实追踪后端（cf-track.laifa.xin 或你自己的）
                    ↓
         记录打开/点击 + 返回像素/重定向
```

收件人看到的是**你自己的域名**，但数据依然走原追踪后端。

---

## 四层过滤详解

| 层 | 作用 | 命中后果 |
|---|---|---|
| **L0** | 扩展名黑名单 — `.php` / `.aspx` 是常见扫描器特征 | 302 → google.com |
| **L1** | 路径白名单 — 只放行追踪用路径（`/r/`、`/track/`、`/img/`、`/att/`、`/attachment/` 等）和根目录常见静态文件（`.png/.ico` 等） | 不命中 → 302 |
| **L2** | 反 Microsoft Defender SafeLinks 扫描指纹（头部 + ASN/IP 段）| 302 → google.com |
| **L3** | 反向代理到 `BACKEND_HOST`，原路径/参数原封转发 | — |

### 关于 L2 的两种实现

```
头部指纹（所有平台一致）        Referer 空 + Sec-CH-UA-Model="Surface Pro"
网络指纹（按平台分两路）
  ├─ Cloudflare Worker        ASN 8075（MICROSOFT-CORP-MSN-AS-BLOCK）原生精准
  └─ Vercel/Netlify/Deno      IP 段匹配（兜底方案）
```

**关于 IP 段兜底**：Vercel/Netlify/Deno 拿不到 ASN，所以用硬编码的 Microsoft IP 段（EOP outbound + Microsoft 365 services + MS Corp 历史段）做匹配。精度比 ASN 略低，IP 段每 3-6 个月需同步一次。

---

## 仓库结构

```
.
├── src/index.js                       # Cloudflare Worker（ASN + IP 双检）
├── wrangler.jsonc                     # Cloudflare 配置
├── vercel/
│   ├── api/track.js                   # Vercel Edge Function（IP 检）
│   ├── vercel.json
│   ├── package.json
│   └── README.md
├── netlify.toml                       # Netlify 配置
├── netlify/edge-functions/track.js    # Netlify Edge Function（IP 检）
├── deno-deploy/
│   ├── main.js                        # Deno Deploy（IP 检）
│   └── README.md
├── shared/microsoft-ranges.js         # Microsoft IP 段 source of truth
├── public/index.html                  # Netlify publish 目录占位
├── docs/
│   ├── custom-domain.md               # 自定义域名教程（四平台覆盖）
│   └── architecture.md                # 本文档
├── CHANGELOG.md                       # 版本历史（英文）
├── README.md                          # 主 README（精简版）
└── LICENSE                            # MIT
```

---

## 本地开发

### Cloudflare
```bash
npm install -g wrangler
wrangler login
wrangler dev      # 本地起
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
deno run --allow-net --allow-env main.js   # 本地起在 :8000
# 部署走 GitHub 集成（dash.deno.com/new），不用 CLI
```

---

## 路径白名单怎么改

要扩展或修改 `ALLOWED_PATH_PREFIXES`，需要同步改 **四个**平台源码：

- `src/index.js`（CF）
- `vercel/api/track.js`
- `netlify/edge-functions/track.js`
- `deno-deploy/main.js`

改完 push 即可，各平台会自动重新部署（CF 需手动 `wrangler deploy`）。

---

## 更新 Microsoft IP 段

`shared/microsoft-ranges.js` 是 source of truth。同步流程：

1. 从 [endpoints.office.com](https://endpoints.office.com/endpoints/worldwide) 或 [bgpview.io/asn/8075](https://bgpview.io/asn/8075) 拉最新数据
2. 更新 `shared/microsoft-ranges.js` 的 `MICROSOFT_IPV4_RANGES`
3. 同步到四个平台的 `MICROSOFT_IPV4_RANGES` 常量
4. Commit + push

建议每 3-6 个月同步一次。CF 用 ASN 检测不受影响，其余三家会受影响。

---

## 平台对比

| 平台 | L2 反扫描 | 域名灵活度 | 免费额度 |
|---|---|---|---|
| **Cloudflare Workers** | ASN 原生（最准） | 需 NS 托管 CF | 10 万次/天 |
| **Vercel** | IP 段匹配 | CNAME 任意 DNS | 100GB 流量/月 |
| **Netlify** | IP 段匹配 | CNAME 任意 DNS | 100GB 流量/月 |
| **Deno Deploy** | IP 段匹配 | CNAME 任意 DNS | 100 万次/月 |

---

## 注意事项

1. **后端默认是 `cf-track.laifa.xin`** — 这是模板作者的追踪后端。你可以：
   - **保留默认**：你的流量会经过原作者的后端（默认协议是 HTTP，不加密）
   - **改成你自己的**：把 `BACKEND_HOST` 改成你的追踪后端地址
2. **HTTP 后端**：默认 `BACKEND_PROTOCOL=http:` 是因为原作者后端走 HTTP。后端是 HTTPS 记得改 `https:`
3. **不要把这个域名挂在做正常 web 服务的域名上** — 路径白名单非常窄，正常 web 请求都会被 302 走

---

## CI 自动化（仓库内部）

- `.github/workflows/update-i18n-badge.yml`：push README*.md 后自动重算 i18n 徽章 JSON
- 主 README `release` 徽章：从 GitHub Releases API 实时读最新 tag
- 主 README `i18n` 徽章：endpoint 模式读 `.github/badges/i18n.json`
