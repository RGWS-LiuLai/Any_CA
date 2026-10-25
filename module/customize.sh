#!/system/bin/sh
# ============================================================
#  AnyKeybox - module  v1.0.0
#  Import CA certificates from a keybox.xml into the
#  Android system trust store (conscrypt APEX preferred).
#
#  Author : RGWS-LiuLai  (Coolapk: 恋勿思)
#  License: GPL-3.0 (open source, closed source forbidden)
#  GitHub : https://github.com/RGWS-LiuLai/Anykeybox_module
# ============================================================

ui_print "************************************"
ui_print "   AnyKeybox - module  v1.0.0"
ui_print "   keybox CA → system trust store"
ui_print "************************************"
ui_print "   Author : RGWS-LiuLai (恋勿思)"
ui_print "   License: GPL-3.0 · 禁止闭源"
ui_print "************************************"

# ---------- permissions ----------
ui_print "- 设置权限 / Setting permissions ..."
[ -d "$MODPATH/scripts" ] && set_perm_recursive "$MODPATH/scripts" 0 0 0755 0755
[ -d "$MODPATH/webroot"  ] && set_perm_recursive "$MODPATH/webroot"  0 0 0755 0644
set_perm "$MODPATH/service.sh"   0 0 0755
set_perm "$MODPATH/uninstall.sh" 0 0 0755
[ -f "$MODPATH/module.prop" ] && set_perm "$MODPATH/module.prop" 0 0 0644

# ---------- notes ----------
ui_print "- 说明 / Notes:"
if [ -f "$MODPATH/state.txt" ]; then
  ui_print "  · 检测到旧状态文件，模块目录已更新 / Old state detected,"
  ui_print "    请在 WebUI 中重新选择 keybox.xml / re-select keybox.xml"
else
  ui_print "  · 安装完成后打开本模块的 WebUI 选择 keybox.xml"
  ui_print "    Open this module's WebUI and pick a keybox.xml"
fi
ui_print "  · 挂载/生效由元模块 (KernelSU/Magisk/APatch) 负责"
ui_print "    Mounting is handled by your root manager"
ui_print "  · APEX 场景需重启设备 / APEX target requires a reboot"

# ---------- initialize module.prop status ----------
if [ -f "$MODPATH/scripts/status.sh" ]; then
  sh "$MODPATH/scripts/status.sh" --update >/dev/null 2>&1
fi

ui_print "- 安装完成 / Installed!"
ui_print "  任何 XML（含 keybox.xml）中的证书都会被提取"
ui_print "  Certificates inside any XML file will be extracted"
ui_print "************************************"
