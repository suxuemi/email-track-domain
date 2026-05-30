# site/ — VitePress docs site

Generates a public documentation site for [`email-track-domain`](https://github.com/suxuemi/email-track-domain) at **track.laifa.xin** (EdgeOne Pages, 中国国内备案域名加速).

## Architecture

Source files live at the **repo root** as `.lang.md` (e.g., `../README.md`, `../README.en.md`, `../docs/architecture.zh-TW.md`). This site **does not duplicate them**.

`scripts/sync-docs.sh` copies the source files into VitePress's expected structure under `site/`:

```
site/
├── .vitepress/config.ts    # 8-locale config, sidebar, nav
├── scripts/sync-docs.sh    # source-of-truth → VitePress structure
├── package.json
├── .gitignore              # ignores all generated .md and locale subdirs
│
├── index.md                # ← ../README.md (zh-CN, default locale)
├── architecture.md         # ← ../docs/architecture.md
├── custom-domain.md        # ← ../docs/custom-domain.md
├── vercel.md               # ← ../vercel/README.md
├── deno-deploy.md          # ← ../deno-deploy/README.md
│
├── zh-TW/...               # ← ../README.zh-TW.md + ../docs/*.zh-TW.md + ...
├── en/...                  # ← ../README.en.md + ...
├── ja/...
├── fr/...
├── de/...
├── es/...
└── pt/...
```

The sync script also strips language switchers (VitePress provides one in the navbar) and rewrites cross-doc links to the flat VitePress structure.

## Local development

```bash
cd site
npm install
npm run docs:dev      # http://localhost:5173
```

## Build

```bash
npm run docs:build    # output to .vitepress/dist/
npm run docs:preview  # preview the built site
```

## EdgeOne Pages deploy config

| Setting | Value |
|---|---|
| Root Directory | `site/` |
| Install command | `npm install` |
| Build command | `npm run docs:build` |
| Output directory | `.vitepress/dist` |

Bind the custom domain `track.laifa.xin` in EdgeOne Pages → 自定义域名 → 添加。Add the CNAME record EdgeOne shows you at your DNS provider.
