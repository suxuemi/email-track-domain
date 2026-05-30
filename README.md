<div align="center">

# Email Tracking Domain

**邮件追踪域名一键部署 — 专属域名下的打开 / 点击 / 附件追踪反代**

[![release](https://img.shields.io/github/v/release/suxuemi/email-track-domain?style=flat-square&color=purple&label=release)](https://github.com/suxuemi/email-track-domain/releases/latest)
![platforms](https://img.shields.io/badge/platforms-Cloudflare%20%7C%20Vercel%20%7C%20Netlify%20%7C%20Deno-orange?style=flat-square)
![license](https://img.shields.io/badge/license-MIT-green?style=flat-square)
![i18n](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/suxuemi/email-track-domain/main/.github/badges/i18n.json&style=flat-square)
![stars](https://img.shields.io/github/stars/suxuemi/email-track-domain?style=flat-square&logo=github)

🌐 **官方网站**：[laifa.xin](https://laifa.xin)

**简体中文** | [繁體中文](README.zh-TW.md) | [English](README.en.md) | [日本語](README.ja.md) | [Français](README.fr.md) | [Deutsch](README.de.md) | [Español](README.es.md) | [Português](README.pt.md) | [📋 Changelog](CHANGELOG.md)

</div>

---

## ⚡ 三步搞定

### 1️⃣ 点 Deploy 按钮（选一个平台）

| 平台 | 一键部署 | 适合 |
|---|---|---|
| **Cloudflare Workers** | [![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/suxuemi/email-track-domain) | DNS 已经在 Cloudflare |
| **Vercel** | [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/suxuemi/email-track-domain&root-directory=vercel&env=BACKEND_HOST,BACKEND_PROTOCOL,REDIRECT_TARGET&envDescription=Tracking+backend+host) | DNS 不想动，任意服务商 CNAME 接入 |
| **Netlify** | [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/suxuemi/email-track-domain) | 同 Vercel |
| **Deno Deploy** | [→ 部署指南](deno-deploy/README.md) | 喜欢 Deno 生态 |

> 💡 **不知道选哪个？→ 用 Vercel**（任意 DNS + 一键最简）

### 2️⃣ 绑定你自己的域名

部署完后，把你的子域名（如 `track.yourdomain.com`）指向刚部署的项目。

→ **[绑定自定义域名详细步骤](docs/custom-domain.md)**（覆盖四个平台）

### 3️⃣ 在【来发信后台】添加这个域名

进【来发信后台】 → 添加追踪域名 → 填 `track.yourdomain.com` → 点验证 → ✓

验证通过后，你发的所有邮件追踪链接都会换成这个域名 — 看起来更专业，反垃圾邮件得分更高。

---

## 支持的追踪类型

| 类型 | 说明 |
|---|---|
| 📧 邮件打开追踪 | 1×1 透明像素 |
| 🔗 链接点击追踪 | 302 重定向 |
| 📎 附件下载追踪 | 反代文件流 |

三种都开箱即用，零额外配置。

---

## 配置项（一般不用动）

| 变量 | 默认 | 说明 |
|---|---|---|
| `BACKEND_HOST` | `cf-track.laifa.xin` | 追踪后端主机名 |
| `BACKEND_PROTOCOL` | `http:` | 后端协议（带冒号） |
| `REDIRECT_TARGET` | `https://www.google.com` | 拒绝场景的跳转目标 |

部署时各平台 UI 会让你确认或修改这三个值，一般保持默认即可。

---

## License

MIT — 见 [LICENSE](LICENSE)。

---

## 联系作者

- 🌐 官网：[laifa.xin](https://laifa.xin)
- 💬 微信咨询（添加请备注「email track」）：

<img src="https://cos.files.maozhishi.com/data/web/web-files/wx/tony-apan.png" alt="作者微信" width="240">

---

## 🔧 技术细节

四层过滤逻辑、反 Microsoft Defender SafeLinks 扫描原理、IP 段更新流程、本地开发、源码结构等 → **[`docs/architecture.md`](docs/architecture.md)**

## 致谢

源自 [来发信](https://laifa.xin) 的邮件追踪基础设施，公开发布以便用户自部署专属追踪域名。
