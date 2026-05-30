# Deno Deploy デプロイ

**Language**: [简体中文](README.md) · [繁體中文](README.zh-TW.md) · [English](README.en.md) · **日本語** · [Français](README.fr.md) · [Deutsch](README.de.md) · [Español](README.es.md) · [Português](README.pt.md)

Deno Deploy には URL レベルの「ワンクリックデプロイボタン」がありませんが、GitHub 連携によってほぼ同等の体験を実現できます — 一度設定すれば push で自動デプロイ。

## テンプレートリポジトリ URL

以下の URL を Deno Deploy ダッシュボードにコピー:

```
https://github.com/suxuemi/email-track-domain
```

> 💡 コードを変更したい?先に [自分の GitHub アカウントに fork](https://github.com/suxuemi/email-track-domain/fork) してから、Deno Deploy を自分の fork に接続してください。

## デプロイ手順

1. [dash.deno.com/new](https://dash.deno.com/new) を開く
2. サインインして **Deploy from GitHub repository** を選択
3. Deno Deploy に GitHub へのアクセスを許可(初回のみ)
4. リポジトリを選択(上記の URL を貼り付け、または fork したリポジトリを選択)
5. 設定:
   - **Production branch**: `main`
   - **Entry point**: `deno-deploy/main.js`
   - **Install step**: 空欄
   - **Build step**: 空欄
6. **Environment Variables**(任意、デフォルト値あり):
   - `BACKEND_HOST` → `cf-track.laifa.xin`
   - `BACKEND_PROTOCOL` → `http:`
   - `REDIRECT_TARGET` → `https://www.google.com`
7. **Deploy Project** をクリック

デプロイ後 `<project>.deno.dev` ドメインが付与されます。

## カスタムドメイン

Project Settings → Domains → Add Domain で CNAME を追加。詳細は [docs/custom-domain.ja.md](../docs/custom-domain.ja.md#deno-deploy)。

## ローカル開発

```bash
cd deno-deploy
deno run --allow-net --allow-env main.js
```

デフォルトで `http://localhost:8000` で起動。テスト:

```bash
curl -I http://localhost:8000/r/test
curl -I http://localhost:8000/test.php   # 302 が返るはず
```

## 他プラットフォームとの違い

| | Cloudflare | Vercel | Netlify | **Deno Deploy** |
|---|---|---|---|---|
| L2 検出精度 | ASN(高) | IP レンジ(中) | IP レンジ(中) | **IP レンジ(中)** |
| コード構文 | Worker Module | Edge Function | Edge Function | **Deno.serve()** |
| ワンクリックデプロイボタン | 公式 | 公式 | 公式 | **GitHub 連携(1 ステップ手動)** |
| 無料枠 | 100K リクエスト/日 | 100GB 転送量 | 100GB 転送量 | **100 万リクエスト/月** |
| ドメイン柔軟性 | DNS は CF にロック | 任意の DNS で CNAME | 任意の DNS で CNAME | **任意の DNS で CNAME** |

Deno Deploy のメリット:
- 構文が**元の Cloudflare Worker に最も近い**(`addEventListener('fetch', ...)` もサポート)
- 無料枠が最も寛大(リクエスト数で計算、転送量ではない)
- グローバルエッジロケーションが最も多い
