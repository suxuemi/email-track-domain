# Email Tracking Domain（邮件追踪域名一键部署）

> 一键部署你专属的邮件追踪域名反代。在自己的域名下提供邮件打开/点击追踪能力，避免共享域名被反垃圾系统识别。

## 一键部署

### 🟧 Cloudflare Worker（推荐 — 完整四层过滤）

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/suxuemi/email-track-domain)

部署后：
1. 在 Cloudflare Dashboard → Workers → 选 `email-track-domain` Worker → Settings → Variables，确认 `BACKEND_HOST` 等变量
2. 绑定你的子域名 → 见 [docs/custom-domain.md](docs/custom-domain.md)

### ⚫ Vercel Edge Function（降级版 — 缺 L2 反扫描）

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/suxuemi/email-track-domain&root-directory=vercel&env=BACKEND_HOST,BACKEND_PROTOCOL,REDIRECT_TARGET&envDescription=BACKEND_HOST%3D%E4%BD%A0%E7%9A%84%E8%BF%BD%E8%B8%AA%E5%90%8E%E7%AB%AF%E5%9F%9F%E5%90%8D)

> ⚠️ Vercel 版相比 Cloudflare 版缺一层反 Microsoft Defender SafeLinks 扫描器的能力（Vercel 不暴露 ASN）。详见 [vercel/README.md](vercel/README.md)。

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
         │  Cloudflare Worker   │
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
| **L2** | 反 Microsoft Defender SafeLinks 扫描指纹（ASN=8075 + Surface Pro + 空 Referer）| 302 → google.com |
| **L3** | 反向代理到 `BACKEND_HOST`，原路径/参数原封转发 | — |

**关于 L2**：ASN 8075 是 MICROSOFT-CORP-MSN-AS-BLOCK（不是 Google，原源码注释有误）。微软的反钓鱼系统会自动用 Surface Pro 客户端指纹扫描邮件链接，命中后追踪后端会看到这些扫描请求，污染统计。L2 把这类请求引到 google.com 不留痕迹。

---

## 配置项

| 变量 | 默认 | 说明 |
|---|---|---|
| `BACKEND_HOST` | `cf-track.laifa.xin` | 真实追踪后端的主机名 |
| `BACKEND_PROTOCOL` | `http:` | 后端协议，注意要带冒号（`http:` 或 `https:`） |
| `REDIRECT_TARGET` | `https://www.google.com` | 拒绝场景的跳转目标 |

修改方式：
- **Cloudflare**：Workers Dashboard → Settings → Variables（推荐）；或改 `wrangler.jsonc` 的 `vars` 段重新部署
- **Vercel**：Project → Settings → Environment Variables

---

## 自定义域名绑定

部署后必须绑定你自己的子域名才有意义。详见 **[docs/custom-domain.md](docs/custom-domain.md)**。

---

## 本地开发（可选）

如果你想改源码：

### Cloudflare

```bash
npm install -g wrangler
wrangler login
wrangler dev          # 本地起 worker
wrangler deploy       # 部署
```

### Vercel

```bash
cd vercel
npm install -g vercel
vercel dev            # 本地起
vercel --prod         # 部署
```

---

## 仓库结构

```
.
├── src/index.js           # Cloudflare Worker 源码（完整四层）
├── wrangler.jsonc         # Cloudflare Worker 配置
├── vercel/
│   ├── api/track.js       # Vercel Edge Function 源码（无 L2）
│   ├── vercel.json
│   ├── package.json
│   └── README.md
├── docs/
│   └── custom-domain.md   # 自定义域名绑定教程
├── README.md              # 你在看的这个
└── LICENSE                # MIT
```

---

## 路径白名单怎么改

打开 [`src/index.js`](src/index.js)，编辑：

```js
const ALLOWED_PATH_PREFIXES = [
  '/center/', '/r/', '/l/', '/a/',
  '/att/', '/attachment/', '/id/', '/img/',
  '/link/', '/s-tj/', '/test/', '/track/',
];
```

加你自己后端用到的路径前缀。改完 `wrangler deploy`（Cloudflare）或 push 后 Vercel 自动构建。

---

## 注意事项

1. **后端默认是 `cf-track.laifa.xin`** — 这是模板作者的追踪后端。你可以：
   - **保留默认**：你的流量会经过原作者的后端（默认协议是 HTTP，不加密）
   - **改成你自己的**：把 `BACKEND_HOST` 改成你的追踪后端地址
2. **HTTP 后端**：默认 `BACKEND_PROTOCOL=http:` 是因为原作者后端走 HTTP。如果你的后端是 HTTPS，记得改 `https:`
3. **不要把这个域名挂在做正常 web 服务的域名上** — 路径白名单非常窄，正常 web 请求都会被 302 走
4. **Cloudflare Worker 免费版**：每天 10 万次请求免费。追踪用足够；超大体量考虑 Workers Paid（$5/月 1000 万次）

---

## License

MIT — 见 [LICENSE](LICENSE)。

## 致谢

源自 [来发信谷歌地图数据采集专业版](https://github.com/) 项目的邮件追踪基础设施，公开发布以便用户自部署专属追踪域名。
