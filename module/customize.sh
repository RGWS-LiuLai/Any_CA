#!/system/bin/sh
# ============================================================
#  Any - CA  v1.0.0  ::  customize.sh
#  Installer. Preserves user data across module updates.
#
#  Copyright (C) 2026 RGWS-LiuLai (Coolapk: 恋勿思) · GPL-3.0
#  https://github.com/RGWS-LiuLai/Any_CA
# ============================================================

ui_print "************************************"
ui_print "   Any - CA  v1.0.0"
ui_print "   CA trust store · keybox · TEE"
ui_print "************************************"
ui_print "   Author : RGWS-LiuLai (恋勿思)"
ui_print "   License: GPL-3.0 · 禁止闭源"
ui_print "************************************"

# ---------- preserve data on update ----------
# The module's own data directory lives inside MODPATH, so an update
# replaces it. Move it aside before the old tree is discarded.
DATA_BAK=""
if [ -d "/data/adb/modules/Any_CA/data" ]; then
    DATA_BAK="/data/adb/anyca_data_backup"
    rm -rf "$DATA_BAK"
    ui_print "- 保留已有数据 / Preserving existing data ..."
    cp -a "/data/adb/modules/Any_CA/data" "$DATA_BAK" 2>/dev/null \
        && ui_print "  · 数据已暂存 / data staged"
fi

# ---------- permissions ----------
ui_print "- 设置权限 / Setting permissions ..."
[ -d "$MODPATH/scripts" ] && set_perm_recursive "$MODPATH/scripts" 0 0 0755 0755
[ -d "$MODPATH/webroot" ] && set_perm_recursive "$MODPATH/webroot" 0 0 0755 0644
set_perm "$MODPATH/service.sh"   0 0 0755
set_perm "$MODPATH/uninstall.sh" 0 0 0755
[ -f "$MODPATH/module.prop" ] && set_perm "$MODPATH/module.prop" 0 0 0644

# ---------- restore data ----------
mkdir -p "$MODPATH/data" 2>/dev/null
if [ -n "$DATA_BAK" ] && [ -d "$DATA_BAK" ]; then
    cp -a "$DATA_BAK/." "$MODPATH/data/" 2>/dev/null
    rm -rf "$DATA_BAK"
    ui_print "  · 数据已恢复 / data restored"
fi
set_perm_recursive "$MODPATH/data" 0 0 0755 0644

# ---------- notes ----------
ui_print "- 说明 / Notes:"
ui_print "  · 打开模块 WebUI 导入 CA 或生成 keybox"
ui_print "    Open the WebUI to import a CA or a keybox"
ui_print "  · 安装后需在管理器启用本模块并重启"
ui_print "    Enable the module in your manager, then reboot"
ui_print "  · 生成的 keybox 仅供娱乐，无法通过 Google 认证"
ui_print "    Generated keyboxes are entertainment only"

ui_print "- 安装完成 / Installed!"
ui_print "************************************"
