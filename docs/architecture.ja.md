# アーキテクチャと技術リファレンス

**Language**: [简体中文](architecture.md) · [繁體中文](architecture.zh-TW.md) · [English](architecture.en.md) · **日本語** · [Français](architecture.fr.md) · [Deutsch](architecture.de.md) · [Español](architecture.es.md) · [Português](architecture.pt.md)

> 本ドキュメントは開発者 / 技術に興味のある方向けです。デプロイして使うだけなら、メイン [README](../README.ja.md) の「3 ステップで完了」を参照してください。

---

## これは何をするものか

メールマーケティング/通知システムは、メールに**追跡ピクセル**と**クリック ID 付きリダイレクトリンク**を埋め込み、開封率とクリック率を計測します。これらのリンクの背後には追跡バックエンド（例: `cf-track.laifa.xin`）があります。

**問題点**:
- バックエンドのドメインを直接使用 → 大量送信 → 迷惑メールフィルタによりブラックリスト化
- 共有追跡ドメイン → 他のユーザーの行動が自分のドメイン評価を汚染
- Microsoft Defender / Outlook がメール内のリンクを自動 GET して事前スキャン → 開封/クリック統計を汚染

**この Worker による解決**:

**自分のドメイン**をリバースプロキシ層として使い、4 段階フィルタリングを実装:

```
受信者がクリック → 自分のドメイン (track.yourdomain.com)
                    ↓
         ┌──────────────────────┐
         │  Worker / Edge Func  │
         │                      │
         │  L0 .php/.aspx 拒否  │ → 302 google.com
         │  L1 パス許可リスト    │ → 302 google.com
         │  L2 MS スキャナ対策  │ → 302 google.com
         │  L3 リバースプロキシ │
         └──────────────────────┘
                    ↓
         実際の追跡バックエンド (cf-track.laifa.xin または独自)
                    ↓
         開封/クリック記録 + ピクセル/リダイレクト返却
```

受信者には**自分のドメイン**が見えますが、データは引き続き元の追跡バックエンドに流れます。

---

## 4 段階フィルタリングの詳細

| 段階 | 役割 | 動作 |
|---|---|---|
| **L0** | 拡張子ブロックリスト — `.php` / `.aspx` は一般的なスキャナの特徴 | 302 → google.com |
| **L1** | パス許可リスト — 追跡用パス（`/r/`、`/track/`、`/img/`、`/att/`、`/attachment/` など）とルート直下の静的ファイル（`.png/.ico` など）のみ許可 | 不一致 → 302 |
| **L2** | Microsoft Defender SafeLinks スキャナ指紋検知（ヘッダ + ASN/IP レンジ） | 302 → google.com |
| **L3** | `BACKEND_HOST` へのリバースプロキシ、元のパス/パラメータをそのまま転送 | — |

### L2 の 2 つの実装

```
ヘッダ指紋（全プラットフォーム共通）   Referer 空 + Sec-CH-UA-Model="Surface Pro"
ネットワーク指紋（プラットフォーム別）
  ├─ Cloudflare Worker              ネイティブ ASN 8075 (MICROSOFT-CORP-MSN-AS-BLOCK)
  └─ Vercel/Netlify/Deno            IP レンジマッチング（フォールバック）
```

**IP レンジフォールバックについて**: Vercel/Netlify/Deno は ASN にアクセスできないため、Microsoft IP レンジ（EOP outbound + Microsoft 365 services + MS Corp 歴史レンジ）をハードコードして照合します。ASN より若干精度は劣り、3〜6 ヶ月ごとに更新が必要です。

---

## リポジトリ構成

```
.
├── src/index.js                       # Cloudflare Worker（ASN + IP デュアル検査）
├── wrangler.jsonc                     # Cloudflare 設定
├── vercel/
│   ├── api/track.js                   # Vercel Edge Function（IP 検査）
│   ├── vercel.json
│   ├── package.json
│   └── README.md
├── netlify.toml                       # Netlify 設定
├── netlify/edge-functions/track.js    # Netlify Edge Function（IP 検査）
├── deno-deploy/
│   ├── main.js                        # Deno Deploy（IP 検査）
│   └── README.md
├── shared/microsoft-ranges.js         # Microsoft IP レンジの source of truth
├── public/index.html                  # Netlify publish ディレクトリのプレースホルダ
├── docs/
│   ├── custom-domain.md               # カスタムドメインガイド（4 プラットフォーム）
│   └── architecture.md                # このドキュメント
├── CHANGELOG.md                       # バージョン履歴（英語）
├── README.md                          # メイン README（簡潔版）
└── LICENSE                            # MIT
```

---

## ローカル開発

### Cloudflare
```bash
npm install -g wrangler
wrangler login
wrangler dev      # ローカル起動
wrangler deploy   # デプロイ
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
deno run --allow-net --allow-env main.js   # :8000 で起動
# デプロイは GitHub 連携 (dash.deno.com/new) 経由、CLI 不要
```

---

## パス許可リストの変更方法

`ALLOWED_PATH_PREFIXES` を拡張・変更するには、**4 つの** プラットフォームソースの定数を同期する必要があります:

- `src/index.js`（CF）
- `vercel/api/track.js`
- `netlify/edge-functions/track.js`
- `deno-deploy/main.js`

編集後 push すれば各プラットフォームが自動再デプロイ（CF は手動で `wrangler deploy`）。

---

## Microsoft IP レンジの更新

`shared/microsoft-ranges.js` が source of truth です。同期手順:

1. [endpoints.office.com](https://endpoints.office.com/endpoints/worldwide) または [bgpview.io/asn/8075](https://bgpview.io/asn/8075) から最新データを取得
2. `shared/microsoft-ranges.js` の `MICROSOFT_IPV4_RANGES` を更新
3. 4 プラットフォームの `MICROSOFT_IPV4_RANGES` 定数に同期
4. Commit + push

3〜6 ヶ月ごとの更新を推奨。CF の ASN 検出には影響しませんが、残り 3 プラットフォームには影響します。

---

## プラットフォーム比較

| プラットフォーム | L2 スキャナ対策 | ドメイン柔軟性 | 無料枠 |
|---|---|---|---|
| **Cloudflare Workers** | ネイティブ ASN（最高精度） | DNS を CF にホスト必要 | 10 万リクエスト/日 |
| **Vercel** | IP レンジマッチング | 任意の DNS で CNAME | 100GB 転送量/月 |
| **Netlify** | IP レンジマッチング | 任意の DNS で CNAME | 100GB 転送量/月 |
| **Deno Deploy** | IP レンジマッチング | 任意の DNS で CNAME | 100 万リクエスト/月 |

---

## 注意事項

1. **デフォルトのバックエンドは `cf-track.laifa.xin`** — これはテンプレート作者の追跡バックエンドです。選択肢:
   - **デフォルトを維持**: トラフィックは作者のバックエンドを経由（デフォルトプロトコルは HTTP、非暗号化）
   - **独自に変更**: `BACKEND_HOST` を自分の追跡バックエンドアドレスに変更
2. **HTTP バックエンド**: デフォルトの `BACKEND_PROTOCOL=http:` は作者のバックエンドが HTTP のため。HTTPS の場合は `https:` に変更
3. **通常の Web サービスを提供するドメインに設置しないこと** — パス許可リストが非常に狭いため、通常の Web リクエストは 302 されます

---

## CI 自動化（リポジトリ内部）

- `.github/workflows/update-i18n-badge.yml`: README*.md の push 後、i18n バッジ JSON を自動再計算
- メイン README `release` バッジ: GitHub Releases API から最新タグをリアルタイム読み込み
- メイン README `i18n` バッジ: endpoint モードで `.github/badges/i18n.json` を読み込み
