# Email Tracking Domain（メール追跡ドメインのワンクリックデプロイ）

> 専用のメール追跡ドメインリバースプロキシをワンクリックでデプロイ。自分のドメイン配下で開封/クリック追跡を提供し、共有追跡ドメインが迷惑メール判定されるリスクを回避します。

**Language**: [简体中文](README.md) · [繁體中文](README.zh-TW.md) · [English](README.en.md) · **日本語** · [Français](README.fr.md) · [Deutsch](README.de.md) · [Español](README.es.md) · [Português](README.pt.md)

## ワンクリックデプロイ（4 つのプラットフォームから選択）

| プラットフォーム | ボタン | L2 スキャナ対策 | ドメイン柔軟性 |
|---|---|---|---|
| **Cloudflare Workers** | [![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/suxuemi/email-track-domain) | ネイティブ ASN（最高精度） | DNS を CF にホストする必要あり |
| **Vercel** | [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/suxuemi/email-track-domain&root-directory=vercel&env=BACKEND_HOST,BACKEND_PROTOCOL,REDIRECT_TARGET&envDescription=Tracking+backend+host) | IP レンジ（中） | 任意の DNS で CNAME |
| **Netlify** | [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/suxuemi/email-track-domain) | IP レンジ（中） | 任意の DNS で CNAME |
| **Deno Deploy** | [→ セットアップガイド](deno-deploy/README.ja.md) | IP レンジ（中） | 任意の DNS で CNAME |

> **どれを選ぶ？**
> - DNS がすでに Cloudflare 上 → **CF Worker**（最高精度のスキャナ対策）
> - DNS を移動したくない → **Vercel** または **Netlify**（任意の DNS プロバイダから CNAME）
> - Deno を好む / Service Worker ネイティブ構文を維持したい → **Deno Deploy**

デプロイ後、**カスタムドメインのバインドが必須**です → [docs/custom-domain.md](docs/custom-domain.ja.md)

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
| **L1** | パス許可リスト — 追跡用パス（`/r/`、`/track/`、`/img/` など）とルート直下の静的ファイル（`.png/.ico` など）のみ許可 | 不一致 → 302 |
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

> 歴史的背景: 元のソースコードのコメントは ASN 8075 を Google としていましたが、**これは誤りです**。8075 は実際には MICROSOFT-CORP-MSN-AS-BLOCK であり、Surface Pro は Microsoft のデバイスです。本リポジトリでは修正済みです。

---

## サポートされる追跡タイプ

| タイプ | 実装方法 | パス例 |
|---|---|---|
| メール開封追跡 | 1×1 透明ピクセル | `/img/p.png?id=xxx`、`/track/open.gif` |
| リンククリック追跡 | 元 URL への 302 リダイレクト | `/r/abc123`、`/l/xxx`、`/link/xxx` |
| **添付ファイルダウンロード追跡** | 添付ファイルストリームをリバースプロキシ | `/att/xxx.pdf`、`/attachment/file` |

3 種類とも**同じリバースプロキシロジックを共有**しており、添付ファイル追跡は追加設定なしですぐに使えます — Worker がリクエストをバックエンドに転送し、バックエンドがイベントを記録してファイル/ピクセル/302 を返します。

---

## 設定項目

| 変数 | デフォルト | 説明 |
|---|---|---|
| `BACKEND_HOST` | `cf-track.laifa.xin` | 実際の追跡バックエンドのホスト名 |
| `BACKEND_PROTOCOL` | `http:` | バックエンドプロトコル、コロン必須（`http:` または `https:`） |
| `REDIRECT_TARGET` | `https://www.google.com` | 拒否時のリダイレクト先 |

変更方法:
- **Cloudflare**: Workers Dashboard → Settings → Variables、または `wrangler.jsonc` を編集して再デプロイ
- **Vercel**: Project → Settings → Environment Variables
- **Netlify**: Site Settings → Environment Variables
- **Deno Deploy**: Project Settings → Environment Variables

---

## カスタムドメインのバインド

デプロイ後、自分のサブドメインをバインドしなければ意味がありません。詳細は **[docs/custom-domain.md](docs/custom-domain.ja.md)**（4 プラットフォーム対応）。

---

## ローカル開発（任意）

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
├── docs/custom-domain.md              # カスタムドメインガイド（4 プラットフォーム）
├── README.md                          # このファイル
└── LICENSE                            # MIT
```

---

## パス許可リストの変更方法

パス許可リストを拡張・変更するには、**4 つの** プラットフォームソースの `ALLOWED_PATH_PREFIXES` 定数を同期する必要があります:

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

## 注意事項

1. **デフォルトのバックエンドは `cf-track.laifa.xin`** — これはテンプレート作者の追跡バックエンドです。選択肢:
   - **デフォルトを維持**: トラフィックは作者のバックエンドを経由（デフォルトプロトコルは HTTP、非暗号化）
   - **独自に変更**: `BACKEND_HOST` を自分の追跡バックエンドアドレスに変更
2. **HTTP バックエンド**: デフォルトの `BACKEND_PROTOCOL=http:` は作者のバックエンドが HTTP のため。HTTPS の場合は `https:` に変更
3. **通常の Web サービスを提供するドメインに設置しないこと** — パス許可リストが非常に狭いため、通常の Web リクエストは 302 されます
4. **無料枠**:
   - CF Worker: 10 万リクエスト/日
   - Vercel: 100GB 転送量/月
   - Netlify: 100GB 転送量/月
   - Deno Deploy: 100 万リクエスト/月

---

## License

MIT — [LICENSE](LICENSE) を参照。

---

## 作者への連絡

- 🌐 公式サイト: [laifa.xin](https://laifa.xin)
- 💬 WeChat（追加時は「email track」と備考にお願いします）:

<img src="https://cos.files.maozhishi.com/data/web/web-files/wx/tony-apan.png" alt="作者の WeChat" width="240">

## クレジット

[laifa.xin](https://laifa.xin) のメール追跡インフラから派生し、ユーザーが自分専用の追跡ドメインをデプロイできるようオープンソース化しました。
