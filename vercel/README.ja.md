# Vercel デプロイ

**Language**: [简体中文](README.md) · [繁體中文](README.zh-TW.md) · [English](README.en.md) · **日本語** · [Français](README.fr.md) · [Deutsch](README.de.md) · [Español](README.es.md) · [Português](README.pt.md)

4 段階フィルタリング完備。L2 反 Microsoft Defender SafeLinks スキャナは CF ネイティブの ASN 検出の代わりに IP レンジマッチングを使用 — 精度はやや低く(IP レンジは数ヶ月ごとに更新が必要)、ただし実用上は十分。

## ワンクリックデプロイ

ボタンはリポジトリルートの [README.ja.md](../README.ja.md) を参照。

## 設定項目

| 変数 | デフォルト | 説明 |
|---|---|---|
| `BACKEND_HOST` | `cf-track.laifa.xin` | 追跡バックエンドのホスト名 |
| `BACKEND_PROTOCOL` | `http:` | バックエンドプロトコル、コロン必須(`http:` または `https:`) |
| `REDIRECT_TARGET` | `https://www.google.com` | 拒否時のリダイレクト先 |

デプロイ後 Vercel Dashboard → Project → Settings → Environment Variables で変更可能。

## カスタムドメイン

デプロイ後 Vercel Dashboard → Project → Settings → Domains でドメインを追加し、DNS プロバイダで CNAME `track → cname.vercel-dns.com` を設定。詳細は [docs/custom-domain.ja.md](../docs/custom-domain.ja.md)。

## Cloudflare Worker 版との違い

| | Cloudflare | Vercel |
|---|---|---|
| L0/L1 パスフィルタ | ✓ | ✓ |
| L2 検出方式 | **ネイティブ ASN 8075**(高精度) | **IP レンジマッチング**(中精度) |
| L2 IP レンジ更新が必要? | 不要 | 3〜6 ヶ月ごと |
| L3 リバースプロキシ | ✓ | ✓ |
| ドメイン柔軟性 | DNS を CF にホスト必要 | 任意の DNS で CNAME |

IP レンジは [`api/track.js`](api/track.js) の `MICROSOFT_IPV4_RANGES` 定数にあります。更新方法は [`shared/microsoft-ranges.js`](../shared/microsoft-ranges.js) のコメントを参照。
