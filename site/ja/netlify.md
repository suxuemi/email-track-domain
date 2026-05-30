# Netlify デプロイ

任意 DNS + Deno runtime Edge Function。Vercel と同等、チームが好きな管理画面を選択。

## ワンクリックデプロイ

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/suxuemi/email-track-domain)

または、このテンプレートリポジトリ URL を Netlify コンソールに貼り付け:

```
https://github.com/suxuemi/email-track-domain
```

> 💡 コードを変更したい?先に [自分のアカウントに fork](https://github.com/suxuemi/email-track-domain/fork) してから、fork したリポジトリ URL を使用してください。

## 設定項目

| 変数 | デフォルト | 説明 |
|---|---|---|
| `BACKEND_HOST` | `cf-track.laifa.xin` | 追跡バックエンドのホスト名 |
| `BACKEND_PROTOCOL` | `http:` | バックエンドプロトコル（コロン必須） |
| `REDIRECT_TARGET` | `https://www.google.com` | 拒否時のリダイレクト先 |

デプロイ後 **Netlify Dashboard → Site Settings → Environment Variables** で変更。

## カスタムドメイン

詳細は [カスタムドメインのバインド](/ja/custom-domain#netlify)。

## Cloudflare との違い

| | Cloudflare | Netlify |
|---|---|---|
| L0/L1 パスフィルタ | ✓ | ✓ |
| L2 検出方法 | **ネイティブ ASN 8075**（高精度） | **IP レンジマッチング**（中精度） |
| L2 IP レンジ更新必要? | 不要 | 3〜6 ヶ月ごと |
| L3 リバースプロキシ | ✓ | ✓ |
| ドメイン柔軟性 | DNS を CF にホスト必要 | **任意の DNS で CNAME** |
| Runtime | V8 isolate | Deno |

**適した場面**: DNS が Cloudflare 上にない、移行したくない、CNAME ですぐ接続したい。

**Vercel と Netlify どちらを選ぶ?**: 機能はほぼ同等、チームが慣れている管理画面で選択。

IP レンジは [`netlify/edge-functions/track.js`](https://github.com/suxuemi/email-track-domain/blob/main/netlify/edge-functions/track.js) の `MICROSOFT_IPV4_RANGES` 定数。更新は [`shared/microsoft-ranges.js`](https://github.com/suxuemi/email-track-domain/blob/main/shared/microsoft-ranges.js) を参照。
