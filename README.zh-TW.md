<div align="center">

# Email Tracking Domain

**郵件追蹤網域一鍵部署 — 專屬網域下的開信 / 點擊 / 附件追蹤反向代理**

[![release](https://img.shields.io/github/v/release/suxuemi/email-track-domain?style=flat-square&color=purple&label=release)](https://github.com/suxuemi/email-track-domain/releases/latest)
![platforms](https://img.shields.io/badge/platforms-Cloudflare%20%7C%20Vercel%20%7C%20Netlify%20%7C%20Deno-orange?style=flat-square)
![license](https://img.shields.io/badge/license-MIT-green?style=flat-square)
![i18n](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/suxuemi/email-track-domain/main/.github/badges/i18n.json&style=flat-square)
![stars](https://img.shields.io/github/stars/suxuemi/email-track-domain?style=flat-square&logo=github)

🌐 **官方網站**：[laifa.xin](https://laifa.xin)

[简体中文](README.md) | **繁體中文** | [English](README.en.md) | [日本語](README.ja.md) | [Français](README.fr.md) | [Deutsch](README.de.md) | [Español](README.es.md) | [Português](README.pt.md) | [📋 Changelog](CHANGELOG.md)

</div>

---

## ⚡ 三步搞定

### 1️⃣ 點 Deploy 按鈕(選一個平台)

| 平台 | 一鍵部署 | 適合 |
|---|---|---|
| **Cloudflare Workers** | [![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/suxuemi/email-track-domain) | DNS 已經在 Cloudflare |
| **Vercel** | [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/suxuemi/email-track-domain&root-directory=vercel&env=BACKEND_HOST,BACKEND_PROTOCOL,REDIRECT_TARGET&envDescription=Tracking+backend+host) | DNS 不想動,任意服務商 CNAME 接入 |
| **Netlify** | [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/suxuemi/email-track-domain) | 同 Vercel |
| **Deno Deploy** | [→ 部署指南](deno-deploy/README.zh-TW.md) | 喜歡 Deno 生態 |

> 💡 **不知道選哪個?→ 用 Vercel**(任意 DNS + 一鍵最簡)

### 2️⃣ 綁定你自己的網域

部署完後,把你的子網域(如 `track.yourdomain.com`)指向剛部署的專案。

→ **[綁定自訂網域詳細步驟](custom-domain.zh-TW.md)**(涵蓋四個平台)

### 3️⃣ 在【來發信後台】新增這個網域

進【來發信後台】 → 新增追蹤網域 → 填 `track.yourdomain.com` → 點驗證 → ✓

驗證通過後,你發的所有郵件追蹤連結都會換成這個網域 — 看起來更專業,反垃圾郵件得分更高。

---

## 支援的追蹤類型

| 類型 | 說明 |
|---|---|
| 📧 郵件開信追蹤 | 1×1 透明像素 |
| 🔗 連結點擊追蹤 | 302 重新導向 |
| 📎 附件下載追蹤 | 反代檔案串流 |

三種都開箱即用,零額外設定。

---

## 設定項(一般不用動)

| 變數 | 預設 | 說明 |
|---|---|---|
| `BACKEND_HOST` | `cf-track.laifa.xin` | 追蹤後端主機名 |
| `BACKEND_PROTOCOL` | `http:` | 後端協定(帶冒號) |
| `REDIRECT_TARGET` | `https://www.google.com` | 拒絕場景的跳轉目標 |

部署時各平台 UI 會讓你確認或修改這三個值,一般保持預設即可。

---

## License

MIT — 見 [LICENSE](LICENSE)。

---

## 聯絡作者

- 🌐 官網:[laifa.xin](https://laifa.xin)
- 💬 微信諮詢(添加請備註「email track」):

<img src="https://cos.files.maozhishi.com/data/web/web-files/wx/tony-apan.png" alt="作者微信" width="240">

---

## 🔧 技術細節

四層過濾邏輯、反 Microsoft Defender SafeLinks 掃描原理、IP 段更新流程、本地開發、原始碼結構等 → **[`docs/architecture.zh-TW.md`](docs/architecture.zh-TW.md)**

## 致謝

源自 [來發信](https://laifa.xin) 的郵件追蹤基礎設施,公開發布以便使用者自部署專屬追蹤網域。
