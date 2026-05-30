---
layout: home

hero:
  name: "Email Tracking Domain"
  text: "郵件追蹤網域一鍵部署"
  tagline: "在你專屬網域下提供郵件開信 / 點擊 / 附件追蹤反向代理"
  actions:
    - theme: brand
      text: 一鍵部署 →
      link: /zh-TW/quick-start
    - theme: alt
      text: 綁定網域
      link: /zh-TW/custom-domain

features:
  - icon: ⚡
    title: 一鍵部署
    details: Cloudflare Workers / Vercel / Netlify / Deno Deploy 四平台任選,點 Deploy 按鈕即可。
  - icon: 🛡️
    title: 反掃描內建
    details: 自動識別 Microsoft Defender SafeLinks 郵件掃描器,確保開信率 / 點擊率統計準確。
  - icon: 📎
    title: 三種追蹤開箱即用
    details: 郵件開信 + 連結點擊 + 附件下載,零額外設定。
  - icon: 🚀
    title: 全球邊緣加速
    details: 4 個平台都是全球邊緣 CDN,毫秒級響應,不拖慢郵件像素載入。
  - icon: 🌐
    title: 專屬網域
    details: 用 track.yourdomain.com 替代共享網域,反垃圾郵件得分更高。
  - icon: 🔓
    title: MIT 開源
    details: 原始碼完全開放,可改、可自部署、可商用。
---

<div style="text-align: center; margin: 64px 0 32px;">

## 🚀 一鍵部署到你喜歡的平台

</div>

<div style="text-align: center;">

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/suxuemi/email-track-domain)
&nbsp;&nbsp;
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/suxuemi/email-track-domain&root-directory=vercel&env=BACKEND_HOST,BACKEND_PROTOCOL,REDIRECT_TARGET&envDescription=Tracking+backend+host)
&nbsp;&nbsp;
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/suxuemi/email-track-domain)

</div>

或複製本範本倉庫 URL 到任意平台主控台(含 Deno Deploy):

```
https://github.com/suxuemi/email-track-domain
```
