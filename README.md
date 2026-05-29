# Email Tracking Domain（邮件追踪域名一键部署）

> 一键部署你专属的邮件追踪域名反代。在自己的域名下提供邮件打开/点击追踪能力，避免共享域名被反垃圾系统识别。

**Language**: **简体中文** · [繁體中文](README.zh-TW.md) · [English](README.en.md) · [日本語](README.ja.md) · [Français](README.fr.md) · [Deutsch](README.de.md) · [Español](README.es.md) · [Português](README.pt.md)

## 一键部署（四个平台任选）

| 平台 | 按钮 | L2 反扫描 | 域名灵活度 |
|---|---|---|---|
| **Cloudflare Workers** | [![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/suxuemi/email-track-domain) | ASN 原生（最准） | NS 必须托管 CF |
| **Vercel** | [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/suxuemi/email-track-domain&root-directory=vercel&env=BACKEND_HOST,BACKEND_PROTOCOL,REDIRECT_TARGET&envDescription=BACKEND_HOST%3D%E4%BD%A0%E7%9A%84%E8%BF%BD%E8%B8%AA%E5%90%8E%E7%AB%AF%E5%9F%9F%E5%90%8D) | IP 段（中） | CNAME 任意 DNS |
| **Netlify** | [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/suxuemi/email-track-domain) | IP 段（中） | CNAME 任意 DNS |
| **Deno Deploy** | [→ 部署指南](deno-deploy/README.md) | IP 段（中） | CNAME 任意 DNS |

> **挑哪个？**
> - DNS 已经在 Cloudflare → **CF Worker**（最准的反扫描）
> - DNS 在别处不想动 → **Vercel** 或 **Netlify**（任意 DNS CNAME 接入）
> - 喜欢 Deno / 想保留 Service Worker 原生语法 → **Deno Deploy**

部署后**必须绑定自定义域名**才有意义 → [docs/custom-domain.md](docs/custom-domain.md)

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
| **L1** | 路径白名单 — 只放行追踪用路径（`/r/`、`/track/`、`/img/` 等）和根目录常见静态文件（`.png/.ico` 等） | 不命中 → 302 |
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

> 历史背景：原源码注释写 ASN 8075 是 Google，**这是错的**。8075 实际是 MICROSOFT-CORP-MSN-AS-BLOCK；Surface Pro 是微软设备。本仓库已修正。

---

## 支持的追踪类型

| 类型 | 实现方式 | 路径示例 |
|---|---|---|
| 邮件打开追踪 | 1×1 透明像素 | `/img/p.png?id=xxx`、`/track/open.gif` |
| 链接点击追踪 | 302 重定向到原链接 | `/r/abc123`、`/l/xxx`、`/link/xxx` |
| **附件下载追踪** | 反向代理附件流 | `/att/xxx.pdf`、`/attachment/file` |

三种类型**共用同一套反向代理逻辑**，附件追踪开箱即用、零额外配置 — Worker 透传请求到你的后端，后端记录事件后回传文件/像素/302。

---

## 配置项

| 变量 | 默认 | 说明 |
|---|---|---|
| `BACKEND_HOST` | `cf-track.laifa.xin` | 真实追踪后端的主机名 |
| `BACKEND_PROTOCOL` | `http:` | 后端协议，注意要带冒号（`http:` 或 `https:`） |
| `REDIRECT_TARGET` | `https://www.google.com` | 拒绝场景的跳转目标 |

修改方式：
- **Cloudflare**：Workers Dashboard → Settings → Variables；或改 `wrangler.jsonc` 重新部署
- **Vercel**：Project → Settings → Environment Variables
- **Netlify**：Site Settings → Environment Variables
- **Deno Deploy**：Project Settings → Environment Variables

---

## 自定义域名绑定

部署后必须绑定你自己的子域名才有意义。详见 **[docs/custom-domain.md](docs/custom-domain.md)**（已覆盖四个平台）。

---

## 本地开发（可选）

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
├── docs/custom-domain.md              # 自定义域名教程（四平台覆盖）
├── README.md                          # 你在看的这个
└── LICENSE                            # MIT
```

---

## 路径白名单怎么改

要扩展或修改路径白名单，需要同步改 **四个**平台源码的 `ALLOWED_PATH_PREFIXES` 常量：

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

## 注意事项

1. **后端默认是 `cf-track.laifa.xin`** — 这是模板作者的追踪后端。你可以：
   - **保留默认**：你的流量会经过原作者的后端（默认协议是 HTTP，不加密）
   - **改成你自己的**：把 `BACKEND_HOST` 改成你的追踪后端地址
2. **HTTP 后端**：默认 `BACKEND_PROTOCOL=http:` 是因为原作者后端走 HTTP。后端是 HTTPS 记得改 `https:`
3. **不要把这个域名挂在做正常 web 服务的域名上** — 路径白名单非常窄，正常 web 请求都会被 302 走
4. **免费额度**：
   - CF Worker：10 万次/天
   - Vercel：100GB 流量/月
   - Netlify：100GB 流量/月
   - Deno Deploy：100 万次/月

---

## License

MIT — 见 [LICENSE](LICENSE)。

---

## 联系作者

- 🌐 官网：[laifa.xin](https://laifa.xin)
- 💬 微信咨询（添加请备注「email track」）：

<img src="https://cos.files.maozhishi.com/data/web/web-files/wx/tony-apan.png" alt="作者微信" width="240">

## 致谢

源自 [来发信](https://laifa.xin) 的邮件追踪基础设施，公开发布以便用户自部署专属追踪域名。
