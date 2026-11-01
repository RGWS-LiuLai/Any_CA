#!/system/bin/sh
# ============================================================
#  Any - CA  ::  uninstall.sh
#  Cleans up the module's staged certificates and data.
#
#  Copyright (C) 2026 RGWS-LiuLai (Coolapk: 恋勿思) · GPL-3.0
# ============================================================

MODDIR="${0%/*}"
[ -d "$MODDIR" ] || MODDIR="/data/adb/modules/Any_CA"

ui_print "- 清理 / Cleaning up ..."

# ---- remove staged CA files from the module tree ----
rm -rf "$MODDIR/apex" 2>/dev/null
rm -rf "$MODDIR/.cacerts_root" 2>/dev/null

# ---- remove module data ----
rm -rf "$MODDIR/data" 2>/dev/null
rm -f "$MODDIR/mount.log" 2>/dev/null

ui_print "- Any_CA 已卸载 / uninstalled"
ui_print "  系统证书将在重启后恢复原状"
ui_print "  System certificates return to stock after reboot"
