# Cloudflare Workers デプロイ

4 つのプラットフォームの中で **L2 スキャナ対策の精度が最も高い**選択肢（ASN 8075 ネイティブ検出で Microsoft Defender SafeLinks スキャナを識別）。

## ワンクリックデプロイ

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/suxuemi/email-track-domain)

または、このテンプレートリポジトリ URL を Cloudflare コンソールに貼り付け:

```
https://github.com/suxuemi/email-track-domain
```

## 設定項目

| 変数 | デフォルト | 説明 |
|---|---|---|
| `BACKEND_HOST` | `cf-track.laifa.xin` | 追跡バックエンドのホスト名 |
| `BACKEND_PROTOCOL` | `http:` | バックエンドプロトコル（コロン必須） |
| `REDIRECT_TARGET` | `https://www.google.com` | 拒否時のリダイレクト先 |

デプロイ後 **Workers Dashboard → Settings → Variables** で変更。または [`wrangler.jsonc`](https://github.com/suxuemi/email-track-domain/blob/main/wrangler.jsonc) の `vars` 段を変更して再デプロイ。

## カスタムドメイン

詳細は [カスタムドメインのバインド](/ja/custom-domain#cloudflare-worker)。

## 他プラットフォームとの違い

| | Cloudflare | Vercel / Netlify / Deno |
|---|---|---|
| L2 検出方法 | **ネイティブ ASN 8075**（高精度） | IP レンジマッチング（中精度） |
| L2 IP レンジ更新必要? | 不要 | 3〜6 ヶ月ごと |
| ドメイン柔軟性 | DNS を CF にホスト必要 | 任意の DNS で CNAME |
| 無料枠 | 10 万リクエスト/日 | 100GB 転送量/月（V、N）または 100 万リクエスト/月（Deno） |
| Runtime | V8 isolate | V8 isolate / Deno |

**適した場面**: DNS が Cloudflare 上、最高精度のスキャナ対策が必要（高単価 B2B メールマーケティングなど）。

**不適な場面**: DNS を移動したくない → Vercel / Netlify を選択。
