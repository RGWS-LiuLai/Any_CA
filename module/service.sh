#!/system/bin/sh
# ============================================================
#  Any - CA  ::  service.sh
#  Runs late in boot. Refreshes module.prop description with the
#  real mount/effect state so the manager list stays accurate.
#
#  Copyright (C) 2026 RGWS-LiuLai (Coolapk: 恋勿思) · GPL-3.0
# ============================================================

MODDIR="${0%/*}"
[ -d "$MODDIR" ] || MODDIR="/data/adb/modules/Any_CA"

# Give the root manager a moment to finish applying mounts.
sleep 8

SCRIPTS="$MODDIR/scripts"
[ -f "$SCRIPTS/status.sh" ] || exit 0

OUT="$(sh "$SCRIPTS/status.sh" 2>/dev/null)"
[ -n "$OUT" ] || exit 0

COLOR="$(printf '%s\n' "$OUT" | sed -n 's/^COLOR=//p' | head -1)"
TOTAL="$(printf '%s\n' "$OUT" | sed -n 's/^TOTAL=//p' | head -1)"
EFF="$(printf '%s\n' "$OUT" | sed -n 's/^EFFECTIVE=//p' | head -1)"
[ -z "$TOTAL" ] && TOTAL=0
[ -z "$EFF" ] && EFF=0

case "$COLOR" in
    green)  DESC="✅ All $EFF of $TOTAL CA items are active — Any_CA is working." ;;
    yellow) DESC="⚠️ Partially active ($EFF/$TOTAL) — some items are not mounted yet." ;;
    *)
        if [ "$TOTAL" -eq 0 ]; then
            DESC="📦 No certificates yet — open the WebUI to import a CA or generate a keybox."
        else
            DESC="❌ Nothing active (0/$TOTAL) — enable an item or reboot the device."
        fi
        ;;
esac

PROP="$MODDIR/module.prop"
[ -f "$PROP" ] || exit 0

awk -v d="$DESC" '
    /^description=/ { print "description=" d; done = 1; next }
    { print }
    END { if (!done) print "description=" d }
' "$PROP" > "$PROP.tmp" 2>/dev/null && mv "$PROP.tmp" "$PROP"
chmod 644 "$PROP" 2>/dev/null
