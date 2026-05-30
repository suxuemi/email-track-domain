---
layout: home

hero:
  name: "Email Tracking Domain"
  text: "メール追跡ドメインのワンクリックデプロイ"
  tagline: "専用ドメインでの開封 / クリック / 添付追跡リバースプロキシ"
  actions:
    - theme: brand
      text: ワンクリックデプロイ →
      link: /ja/quick-start
    - theme: alt
      text: カスタムドメイン
      link: /ja/custom-domain

features:
  - icon: ⚡
    title: ワンクリックデプロイ
    details: Cloudflare Workers / Vercel / Netlify / Deno Deploy の 4 プラットフォームから選び、Deploy ボタンを押すだけ。
  - icon: 🛡️
    title: スキャナ対策内蔵
    details: Microsoft Defender SafeLinks メールスキャナを自動検知し、開封率 / クリック率の統計を正確に保ちます。
  - icon: 📎
    title: 3 つの追跡タイプがすぐ使える
    details: メール開封 + リンククリック + 添付ファイルダウンロード、追加設定なし。
  - icon: 🚀
    title: グローバルエッジ CDN
    details: 4 プラットフォームすべてがグローバルエッジ CDN — ミリ秒レスポンス、メールピクセル読み込み遅延なし。
  - icon: 🌐
    title: 専用ドメイン
    details: track.yourdomain.com で共有ドメインを置き換え、迷惑メール対策スコアが向上。
  - icon: 🔓
    title: MIT オープンソース
    details: ソースコード完全公開。改変・セルフホスト・商用利用すべて可能。
---

<div style="text-align: center; margin: 64px 0 32px;">

## 🚀 お好きなプラットフォームにワンクリックデプロイ

</div>

<div style="text-align: center;">

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/suxuemi/email-track-domain)
&nbsp;&nbsp;
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/suxuemi/email-track-domain&root-directory=vercel&env=BACKEND_HOST,BACKEND_PROTOCOL,REDIRECT_TARGET&envDescription=Tracking+backend+host)
&nbsp;&nbsp;
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/suxuemi/email-track-domain)

</div>

または、テンプレートリポジトリ URL を任意のプラットフォームコンソールにコピー（Deno Deploy 含む）:

```
https://github.com/suxuemi/email-track-domain
```
