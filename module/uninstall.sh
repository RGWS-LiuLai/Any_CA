#!/system/bin/sh
# ============================================================
#  Any - CA  ::  uninstall.sh
#  Cleans up. Restores TEE keyboxes that this module replaced,
#  using the backups it made, then removes its own data.
#
#  Copyright (C) 2026 RGWS-LiuLai (Coolapk: 恋勿思) · GPL-3.0
# ============================================================

MODDIR="${0%/*}"
[ -d "$MODDIR" ] || MODDIR="/data/adb/modules/Any_CA"

BACKUPS="$MODDIR/data/backups"
SCRIPTS="$MODDIR/scripts"

ui_print "- 清理 / Cleaning up ..."

# ---- remove staged CA files from the module tree ----
rm -rf "$MODDIR/apex" "$MODDIR/system" 2>/dev/null

# ---- remove module data ----
rm -rf "$MODDIR/data" 2>/dev/null
rm -f "$MODDIR/state.txt" 2>/dev/null

ui_print "- Any_CA 已卸载 / uninstalled"
ui_print "  系统证书将在重启后恢复原状"
ui_print "  System certificates return to stock after reboot"
