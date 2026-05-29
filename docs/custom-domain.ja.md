# カスタムドメインのバインド

**Language**: [简体中文](custom-domain.md) · [繁體中文](custom-domain.zh-TW.md) · [English](custom-domain.en.md) · **日本語** · [Français](custom-domain.fr.md) · [Deutsch](custom-domain.de.md) · [Español](custom-domain.es.md) · [Português](custom-domain.pt.md)

デプロイ後、自分のドメインをデプロイプラットフォームに向ける必要があります。これによりメール追跡リンクで自分のドメインを使えるようになります。

4 つのプラットフォームのドメイン柔軟性:

| プラットフォーム | DNS 要件 | 接続方式 |
|---|---|---|
| Cloudflare Workers | ゾーン全体を CF でホストする必要あり | NS レベル |
| Vercel | 任意の DNS プロバイダ | CNAME |
| Netlify | 任意の DNS プロバイダ | CNAME |
| Deno Deploy | 任意の DNS プロバイダ | CNAME |

---

## Cloudflare Worker

> 前提:ドメインがすでに Cloudflare 上にホストされている(DNS が Cloudflare 上にある)こと。

### 方式 A:Workers Routes(推奨 — サブドメイン全体を引き継ぐ)

適合:特定のサブドメイン(例: `track.yourdomain.com`)を追跡専用にする場合。

1. Cloudflare Dashboard を開き、ドメインを選択
2. 左サイドバー **DNS** → **Records** → Add record
   - Type: `AAAA`
   - Name: `track`(任意のサブドメイン)
   - IPv6 address: `100::`(プレースホルダ、Worker が全リクエストを処理)
   - Proxy status: **Proxied**(オレンジの雲アイコンをオンに)
3. 左サイドバー **Workers Routes** → Add route
   - Route: `track.yourdomain.com/*`
   - Worker: デプロイ済みの `email-track-domain` を選択
4. 数分以内に反映。`https://track.yourdomain.com/r/test` にアクセスしてバックエンドに到達するか確認。

### 方式 B:Worker Custom Domain(より簡単)

適合:Workers プロジェクトに直接ドメインをバインド(Cloudflare が DNS と SSL を自動設定)。

1. Workers Dashboard で `email-track-domain` Worker を選択
2. **Settings** → **Triggers** → **Custom Domains** → Add Custom Domain
3. `track.yourdomain.com` を入力して確認
4. Cloudflare が DNS レコードを自動作成し SSL 証明書を発行

違い:方式 A は柔軟(特定パスのルーティング可)、方式 B はドメイン全体をバインド(より簡単)。一般ユーザーは B を推奨。

---

## Vercel

1. Vercel Dashboard でプロジェクトを選択 → **Settings** → **Domains**
2. `track.yourdomain.com` を入力して Add
3. Vercel が DNS プロバイダで追加すべき CNAME レコードを表示:
   ```
   Type: CNAME
   Name: track
   Value: cname.vercel-dns.com
   ```
4. DNS 追加後、数分待つと Vercel が SSL 証明書を自動発行

---

## Netlify

1. Netlify Dashboard でサイトを選択 → **Domain management** → **Custom domains** → **Add a domain**
2. `track.yourdomain.com` を入力 → **Verify** → **Yes, add domain**
3. Netlify が追加すべき DNS レコードを表示、DNS プロバイダで設定:
   ```
   Type: CNAME
   Name: track
   Value: <your-site>.netlify.app
   ```
4. SSL 発行を待つ(数分〜24 時間)

---

## Deno Deploy <a id="deno-deploy"></a>

1. [dash.deno.com](https://dash.deno.com) でプロジェクトを選択 → **Settings** → **Domains** → **Add Domain**
2. `track.yourdomain.com` を入力。Deno Deploy が 2 つのレコードを表示:
   ```
   Type: A      Name: track  Value: 34.120.54.55   (例、実際の値を使用)
   Type: AAAA   Name: track  Value: ...           (IPv6)
   ```
   または CNAME:
   ```
   Type: CNAME  Name: track  Value: <project>.deno.dev
   ```
3. DNS プロバイダで追加後、Deno Deploy で **Verify** をクリック
4. SSL が自動発行される

---

## 動作確認

デプロイ + バインド完了後、ブラウザでアクセス:

| URL | 期待される動作 |
|---|---|
| `https://track.yourdomain.com/` | 302 リダイレクト google.com(ルートは許可リスト外) |
| `https://track.yourdomain.com/test.php` | 302 リダイレクト google.com(ブロックされた拡張子) |
| `https://track.yourdomain.com/r/abc123` | バックエンドに転送(許可されたパス) |
| `https://track.yourdomain.com/favicon.ico` | バックエンドに転送(許可されたルートファイル) |

3 番目が 502 "Backend fetch failed" を返す場合、`BACKEND_HOST` の設定が間違っているかバックエンドに到達できません。

---

## メールでの使用

メール内の `cf-track.laifa.xin` 向けの追跡リンクをすべて `track.yourdomain.com` に置き換えるだけです。例:

```
旧: http://cf-track.laifa.xin/r/abc123
新: https://track.yourdomain.com/r/abc123
```

開封率/クリック率の統計は引き続き元のバックエンドに流れますが、受信者には自分のドメインが見えます — よりプロフェッショナルで、迷惑メール対策スコアも向上します。
