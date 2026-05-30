---
layout: home

hero:
  name: "Email Tracking Domain"
  text: "One-click email tracking domain"
  tagline: "Reverse proxy for opens / clicks / attachments on your own domain"
  actions:
    - theme: brand
      text: One-click Deploy →
      link: /en/quick-start
    - theme: alt
      text: Custom Domain
      link: /en/custom-domain

features:
  - icon: ⚡
    title: One-click deploy
    details: Cloudflare Workers / Vercel / Netlify / Deno Deploy — pick one, click Deploy.
  - icon: 🛡️
    title: Anti-scanner built in
    details: Auto-detects Microsoft Defender SafeLinks scanner to keep open / click stats accurate.
  - icon: 📎
    title: Three tracking types out of the box
    details: Email opens + link clicks + attachment downloads, zero extra config.
  - icon: 🚀
    title: Global edge CDN
    details: All 4 platforms run on global edge networks — millisecond response, no email pixel loading lag.
  - icon: 🌐
    title: Your own domain
    details: Use track.yourdomain.com instead of a shared one — better anti-spam reputation.
  - icon: 🔓
    title: MIT open source
    details: Fully open source. Modify, self-host, use commercially.
---

<div style="text-align: center; margin: 64px 0 32px;">

## 🚀 One-click deploy to your favorite platform

</div>

<div style="text-align: center;">

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/suxuemi/email-track-domain)
&nbsp;&nbsp;
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/suxuemi/email-track-domain&root-directory=vercel&env=BACKEND_HOST,BACKEND_PROTOCOL,REDIRECT_TARGET&envDescription=Tracking+backend+host)
&nbsp;&nbsp;
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/suxuemi/email-track-domain)

</div>

Or copy the template repo URL into any platform console (including Deno Deploy):

```
https://github.com/suxuemi/email-track-domain
```
