#!/system/bin/sh
# ============================================================
#  Any - CA :: build.sh
#  Packages module/ into a flashable ZIP.
#
#  Usage: sh build.sh
#  Output: release/Any_CA-v<version>.zip
#
#  Copyright (C) 2026 RGWS-LiuLai (Coolapk: 恋勿思) · GPL-3.0
# ============================================================

set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
SRC="$ROOT/module"
OUT="$ROOT/release"

[ -f "$SRC/module.prop" ] || { echo "error: module/module.prop missing"; exit 1; }

VERSION="$(sed -n 's/^version=//p' "$SRC/module.prop" | head -1 | tr -d '\r')"
[ -n "$VERSION" ] || VERSION="2.0.0"
ZIP="$OUT/Any_CA-v$VERSION.zip"

# keep the generation engine in sync with its canonical copy
if [ -d "$ROOT/module/gen" ]; then
    mkdir -p "$SRC/webroot/gen"
    cp -f "$ROOT/module/gen/"*.js "$SRC/webroot/gen/" 2>/dev/null || true
fi

mkdir -p "$OUT"
rm -f "$ZIP"

cd "$SRC"
# zip must be available (busybox zip is fine on-device; use it when present)
# NOTE: gen/ lives inside webroot/ only — the WebUI loads gen/*.js from there.
if command -v zip >/dev/null 2>&1; then
    zip -r -X -9 "$ZIP" module.prop customize.sh service.sh uninstall.sh \
        post-fs-data.sh skip_mount scripts webroot >/dev/null
else
    echo "error: 'zip' not found"; exit 1
fi

echo "=== build ok ==="
echo "output: $ZIP"
ls -l "$ZIP" 2>/dev/null || true
