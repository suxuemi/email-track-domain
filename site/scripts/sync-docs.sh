#!/usr/bin/env bash
# Sync .lang.md files from repo root into site/ structure for VitePress.
# Default locale (zh-CN) → site/ root
# Other locales → site/<lang>/
#
# Source files are NOT modified. Only site/ generated files are touched.
# Generated files are gitignored.

set -e

SITE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
REPO_DIR="$( cd "$SITE_DIR/.." && pwd )"

# Process a copied file: strip language switchers + rewrite cross-doc links for VitePress
# Note: use # as sed delimiter to avoid conflict with | in alternation patterns
process_file() {
  local f="$1"
  # 1. Remove old-style language switcher (subdocs): line starting with "**Language**:"
  sed -i.bak '/^\*\*Language\*\*:/d' "$f"
  # 2. Remove new-style language switcher (main README): line containing 📋 Changelog
  sed -i.bak '/📋 Changelog/d' "$f"
  # 3. Rewrite doc links to flat structure
  #    docs/architecture.md → architecture.md (and .lang. variants)
  sed -i.bak -E 's#docs/architecture(\.[a-z][a-zA-Z-]+)?\.md#architecture.md#g' "$f"
  #    docs/custom-domain.md → custom-domain.md
  sed -i.bak -E 's#docs/custom-domain(\.[a-z][a-zA-Z-]+)?\.md#custom-domain.md#g' "$f"
  #    vercel/README.md → vercel.md
  sed -i.bak -E 's#vercel/README(\.[a-z][a-zA-Z-]+)?\.md#vercel.md#g' "$f"
  #    deno-deploy/README.md → deno-deploy.md
  sed -i.bak -E 's#deno-deploy/README(\.[a-z][a-zA-Z-]+)?\.md#deno-deploy.md#g' "$f"
  #    README.<lang>.md or README.md (cross-language) → index.md
  sed -i.bak -E 's#README(\.[a-z][a-zA-Z-]+)?\.md#index.md#g' "$f"
  rm -f "$f.bak"
}

LANGS=(zh-TW en ja fr de es pt)

# Clean previously generated files
echo "==> Cleaning previously generated files in $SITE_DIR"
for path in "$SITE_DIR/index.md" "$SITE_DIR/architecture.md" "$SITE_DIR/custom-domain.md" \
            "$SITE_DIR/vercel.md" "$SITE_DIR/deno-deploy.md"; do
  rm -f "$path"
done
for lang in "${LANGS[@]}"; do
  rm -rf "$SITE_DIR/$lang"
done

# Default locale (zh-CN) at site root
echo "==> Sync default locale (zh-CN)"
cp "$REPO_DIR/README.md"                       "$SITE_DIR/index.md"
cp "$REPO_DIR/docs/architecture.md"            "$SITE_DIR/architecture.md"
cp "$REPO_DIR/docs/custom-domain.md"           "$SITE_DIR/custom-domain.md"
cp "$REPO_DIR/vercel/README.md"                "$SITE_DIR/vercel.md"
cp "$REPO_DIR/deno-deploy/README.md"           "$SITE_DIR/deno-deploy.md"
for f in "$SITE_DIR/index.md" "$SITE_DIR/architecture.md" "$SITE_DIR/custom-domain.md" \
         "$SITE_DIR/vercel.md" "$SITE_DIR/deno-deploy.md"; do
  process_file "$f"
done

# Other locales → subdirectories
for lang in "${LANGS[@]}"; do
  echo "==> Sync locale: $lang"
  mkdir -p "$SITE_DIR/$lang"
  cp "$REPO_DIR/README.$lang.md"                 "$SITE_DIR/$lang/index.md"
  cp "$REPO_DIR/docs/architecture.$lang.md"      "$SITE_DIR/$lang/architecture.md"
  cp "$REPO_DIR/docs/custom-domain.$lang.md"     "$SITE_DIR/$lang/custom-domain.md"
  cp "$REPO_DIR/vercel/README.$lang.md"          "$SITE_DIR/$lang/vercel.md"
  cp "$REPO_DIR/deno-deploy/README.$lang.md"     "$SITE_DIR/$lang/deno-deploy.md"
  for f in "$SITE_DIR/$lang/index.md" "$SITE_DIR/$lang/architecture.md" "$SITE_DIR/$lang/custom-domain.md" \
           "$SITE_DIR/$lang/vercel.md" "$SITE_DIR/$lang/deno-deploy.md"; do
    process_file "$f"
  done
done

echo "✓ Sync complete. VitePress can build from $SITE_DIR"
