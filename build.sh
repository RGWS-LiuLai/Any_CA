#!/bin/sh
# ============================================================
#  AnyKeybox - module :: build.sh
#  Packages module/ into a flashable ZIP: AnyKeybox_module-v<ver>.zip
#  Usage: sh build.sh   (run from the repo root or anywhere)
# ============================================================
set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
SRC="$ROOT/module"
OUT="$ROOT/release"

VERSION="$(grep -m1 '^version=' "$SRC/module.prop" | cut -d= -f2-)"
[ -n "$VERSION" ] || VERSION="1.0.0"
ZIP="$OUT/AnyKeybox_module-v$VERSION.zip"

command -v zip >/dev/null 2>&1 || { echo "error: 'zip' not found"; exit 1; }
[ -f "$SRC/module.prop" ] || { echo "error: module/module.prop missing"; exit 1; }

mkdir -p "$OUT"
rm -f "$ZIP"

# NOTE: zip stores the module root as the archive root (module.prop at top level)
cd "$SRC"
zip -r -X -9 "$ZIP" module.prop customize.sh service.sh uninstall.sh scripts webroot

echo
echo "=== build ok ==="
echo "output: $ZIP"
ls -la "$ZIP"
