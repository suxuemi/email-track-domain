#!/usr/bin/env bash
# Sync .lang.md files from repo root into site/ structure for VitePress.
#
# README.<lang>.md → site/<lang>/quick-start.md (with pre-H2 header stripped)
# docs/architecture.<lang>.md → site/<lang>/architecture.md
# docs/custom-domain.<lang>.md → site/<lang>/custom-domain.md
# vercel/README.<lang>.md → site/<lang>/vercel.md
# deno-deploy/README.<lang>.md → site/<lang>/deno-deploy.md
#
# Hand-written index.md (hero pages) at each locale root are NEVER touched.

set -e

SITE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
REPO_DIR="$( cd "$SITE_DIR/.." && pwd )"

# Process a copied file: strip language switchers + rewrite cross-doc links for VitePress
process_file() {
  local f="$1"
  # 1. Remove old-style language switcher (subdocs): line starting with "**Language**:"
  sed -i.bak '/^\*\*Language\*\*:/d' "$f"
  # 2. Remove new-style language switcher (main README): line containing 📋 Changelog
  sed -i.bak '/📋 Changelog/d' "$f"
  # 3. Rewrite doc links to flat structure (use # delimiter for sed)
  sed -i.bak -E 's#docs/architecture(\.[a-z][a-zA-Z-]+)?\.md#architecture.md#g' "$f"
  sed -i.bak -E 's#docs/custom-domain(\.[a-z][a-zA-Z-]+)?\.md#custom-domain.md#g' "$f"
  sed -i.bak -E 's#vercel/README(\.[a-z][a-zA-Z-]+)?\.md#vercel.md#g' "$f"
  sed -i.bak -E 's#deno-deploy/README(\.[a-z][a-zA-Z-]+)?\.md#deno-deploy.md#g' "$f"
  # README → quick-start (we point to /quick-start instead of /index for main README content)
  sed -i.bak -E 's#README(\.[a-z][a-zA-Z-]+)?\.md#quick-start.md#g' "$f"
  rm -f "$f.bak"
}

# Strip pre-H2 header content (badges, hero text, etc.) from a README copy.
# Keeps only content starting from the first "## " heading.
strip_pre_h2() {
  local f="$1"
  awk '/^## / { found=1 } found { print }' "$f" > "$f.stripped"
  mv "$f.stripped" "$f"
}

LANGS=(zh-TW en ja fr de es pt)

# Clean previously generated files (preserve hand-written index.md files)
echo "==> Cleaning previously generated files in $SITE_DIR"
for path in "$SITE_DIR/quick-start.md" "$SITE_DIR/architecture.md" "$SITE_DIR/custom-domain.md" \
            "$SITE_DIR/vercel.md" "$SITE_DIR/deno-deploy.md"; do
  rm -f "$path"
done
for lang in "${LANGS[@]}"; do
  for path in "$SITE_DIR/$lang/quick-start.md" "$SITE_DIR/$lang/architecture.md" \
              "$SITE_DIR/$lang/custom-domain.md" "$SITE_DIR/$lang/vercel.md" \
              "$SITE_DIR/$lang/deno-deploy.md"; do
    rm -f "$path"
  done
done

# Default locale (zh-CN) at site root — skip index.md (hero, hand-written)
echo "==> Sync default locale (zh-CN)"
cp "$REPO_DIR/README.md"                       "$SITE_DIR/quick-start.md"
cp "$REPO_DIR/docs/architecture.md"            "$SITE_DIR/architecture.md"
cp "$REPO_DIR/docs/custom-domain.md"           "$SITE_DIR/custom-domain.md"
cp "$REPO_DIR/vercel/README.md"                "$SITE_DIR/vercel.md"
cp "$REPO_DIR/deno-deploy/README.md"           "$SITE_DIR/deno-deploy.md"

strip_pre_h2 "$SITE_DIR/quick-start.md"
for f in "$SITE_DIR/quick-start.md" "$SITE_DIR/architecture.md" "$SITE_DIR/custom-domain.md" \
         "$SITE_DIR/vercel.md" "$SITE_DIR/deno-deploy.md"; do
  process_file "$f"
done

# Other locales → subdirectories, skip <lang>/index.md (hero, hand-written)
for lang in "${LANGS[@]}"; do
  echo "==> Sync locale: $lang"
  mkdir -p "$SITE_DIR/$lang"
  cp "$REPO_DIR/README.$lang.md"                 "$SITE_DIR/$lang/quick-start.md"
  cp "$REPO_DIR/docs/architecture.$lang.md"      "$SITE_DIR/$lang/architecture.md"
  cp "$REPO_DIR/docs/custom-domain.$lang.md"     "$SITE_DIR/$lang/custom-domain.md"
  cp "$REPO_DIR/vercel/README.$lang.md"          "$SITE_DIR/$lang/vercel.md"
  cp "$REPO_DIR/deno-deploy/README.$lang.md"     "$SITE_DIR/$lang/deno-deploy.md"

  strip_pre_h2 "$SITE_DIR/$lang/quick-start.md"
  for f in "$SITE_DIR/$lang/quick-start.md" "$SITE_DIR/$lang/architecture.md" \
           "$SITE_DIR/$lang/custom-domain.md" "$SITE_DIR/$lang/vercel.md" \
           "$SITE_DIR/$lang/deno-deploy.md"; do
    process_file "$f"
  done
done

echo "✓ Sync complete. Hand-written index.md hero pages preserved."
