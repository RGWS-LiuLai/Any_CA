#!/system/bin/sh
# ============================================================
#  Any - CA  ::  scripts/common.sh
#  Shared constants and helpers for every shell component.
#
#  Copyright (C) 2026 RGWS-LiuLai (Coolapk: 恋勿思)
#  License: GPL-3.0 — https://github.com/RGWS-LiuLai/Any_CA
# ============================================================

# ---- module paths ----
# Resolve the module root absolutely, never relative to the caller's cwd.
MODID="Any_CA"
if [ -d "/data/adb/modules/$MODID" ]; then
    MODPATH="/data/adb/modules/$MODID"
else
    # Fall back to the tree this script lives in (installation preview).
    case "$0" in
        */*) MODPATH="$(cd "${0%/*}/.." 2>/dev/null && pwd)" ;;
        *)   MODPATH="$(pwd)" ;;
    esac
fi
SCRIPTS="$MODPATH/scripts"
DATA="$MODPATH/data"
ITEMS="$DATA/items"
BACKUPS="$DATA/backups"
STATE="$DATA/state.conf"
LOG="$DATA/anyca.log"

# ---- system trust store targets (APEX preferred, then legacy) ----
APEX_CACERTS="/apex/com.android.conscrypt/cacerts"
SYS_CACERTS="/system/etc/security/cacerts"

# ---- TEE module roots (probed, never assumed) ----
TEESIM_DIR="/data/adb/teesim"
TRICKY_DIR="/data/adb/tricky_store"
OMK_DIR="/data/misc/keystore/omk"

# ---- misc ----
STATE_TMP="$DATA/.state.tmp"

mkdir -p "$DATA" "$ITEMS" "$BACKUPS" 2>/dev/null

# ------------------------------------------------------------
#  log <level> <message>
# ------------------------------------------------------------
log() {
    _lvl="$1"; shift
    printf '[%s] %s\n' "$_lvl" "$*" >> "$LOG" 2>/dev/null
}

# ------------------------------------------------------------
#  json_escape <text>  — minimal JSON string escaping
# ------------------------------------------------------------
json_escape() {
    printf '%s' "$1" | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g' \
        -e 's/\t/\\t/g' -e 's/\r/\\r/g' | tr -d '\n'
}

# ------------------------------------------------------------
#  emit_kv <key> <value>  — machine-readable line for the WebUI
# ------------------------------------------------------------
emit_kv() {
    printf '%s=%s\n' "$1" "$2"
}

# ------------------------------------------------------------
#  read_state <key>  — read a value from state.conf
# ------------------------------------------------------------
read_state() {
    [ -f "$STATE" ] || return 0
    sed -n "s/^$1=//p" "$STATE" 2>/dev/null | head -1
}

# ------------------------------------------------------------
#  write_state <key> <value>  — set/replace a key
# ------------------------------------------------------------
write_state() {
    _k="$1"; _v="$2"
    touch "$STATE" 2>/dev/null
    if grep -q "^$_k=" "$STATE" 2>/dev/null; then
        sed -i "s|^$_k=.*|$_k=$_v|" "$STATE" 2>/dev/null
    else
        printf '%s=%s\n' "$_k" "$_v" >> "$STATE" 2>/dev/null
    fi
}

# ------------------------------------------------------------
#  has_cmd <name>
# ------------------------------------------------------------
has_cmd() { command -v "$1" >/dev/null 2>&1; }

# ------------------------------------------------------------
#  sys_lang — system locale tag
# ------------------------------------------------------------
sys_lang() {
    getprop persist.sys.locale 2>/dev/null \
        || getprop ro.product.locale 2>/dev/null \
        || echo "en"
}
