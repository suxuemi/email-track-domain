## ⚡ 3 ステップで完了

### 1️⃣ Deploy ボタンを押す（プラットフォーム 1 つ選択）

| プラットフォーム | ワンクリックデプロイ | 適した利用者 |
|---|---|---|
| **Cloudflare Workers** | [![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/suxuemi/email-track-domain) | DNS がすでに Cloudflare 上 |
| **Vercel** | [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/suxuemi/email-track-domain&root-directory=vercel&env=BACKEND_HOST,BACKEND_PROTOCOL,REDIRECT_TARGET&envDescription=Tracking+backend+host) | DNS を移したくない、任意のプロバイダから CNAME 接続 |
| **Netlify** | [![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/suxuemi/email-track-domain) | Vercel と同じ |
| **Deno Deploy** | [→ セットアップガイド](deno-deploy.md) | Deno エコシステムを好む |

> 💡 **どれを選ぶか迷ったら → Vercel**（任意の DNS + 最も簡単なワンクリック）

### 2️⃣ 自分のドメインをバインド

デプロイ後、サブドメイン（例：`track.yourdomain.com`）をデプロイしたプロジェクトに向けます。

→ **[カスタムドメイン設定手順](custom-domain.ja.md)**（4 プラットフォーム対応）

### 3️⃣ **【laifa.xin ダッシュボード】** でドメインを追加

**【laifa.xin ダッシュボード】** を開く → 追跡ドメイン追加 → `track.yourdomain.com` を入力 → 検証ボタンをクリック → ✓

検証成功後、送信するすべてのメール追跡リンクがこのドメインに切り替わります — よりプロフェッショナルで、迷惑メール対策スコアも向上します。

---

## サポートされる追跡タイプ

| タイプ | 仕組み |
|---|---|
| 📧 メール開封追跡 | 1×1 透明ピクセル |
| 🔗 リンククリック追跡 | 302 リダイレクト |
| 📎 添付ファイルダウンロード追跡 | ファイルストリームをリバースプロキシ |

3 種類とも追加設定なしで動作します。

---

## 設定項目（通常は変更不要）

| 変数 | デフォルト | 説明 |
|---|---|---|
| `BACKEND_HOST` | `cf-track.laifa.xin` | 追跡バックエンドのホスト名 |
| `BACKEND_PROTOCOL` | `http:` | バックエンドプロトコル（コロン必須） |
| `REDIRECT_TARGET` | `https://www.google.com` | 拒否時のリダイレクト先 |

各プラットフォームのデプロイ UI で確認・変更できます。通常はデフォルトのままで OK。

---

## License

MIT — [LICENSE](LICENSE) を参照。

---

## 作者への連絡

- 🌐 公式サイト: [laifa.xin](https://laifa.xin)
- 💬 WeChat（追加時は「email track」と備考にお願いします）:

<img src="https://cos.files.maozhishi.com/data/web/web-files/wx/tony-apan.png" alt="作者の WeChat" width="240">

---

## 🔧 技術詳細

4 段階フィルタリングロジック、Microsoft Defender SafeLinks スキャナ対策の仕組み、IP レンジ更新フロー、ローカル開発、ソースコード構成など → **[`architecture.md`](architecture.md)**

## クレジット

[laifa.xin](https://laifa.xin) のメール追跡インフラから派生し、ユーザーが自分専用の追跡ドメインをデプロイできるようオープンソース化しました。
