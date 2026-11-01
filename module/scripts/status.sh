#!/system/bin/sh
# ============================================================
#  Any - CA  ::  scripts/status.sh
#  Top-bar status colour + counters.
#
#  Colour rules (per specification):
#    green  : at least one enabled item, and EVERY enabled item is effective
#             (an item manually disabled does not affect green, as long as
#              all remaining enabled items are effective)
#    yellow : there are enabled items, but only SOME of them are effective
#    red    : nothing enabled, or no enabled item is effective
#
#  Output (machine readable, consumed by the WebUI):
#    COLOR=green|yellow|red
#    TOTAL=<n>          total items
#    ENABLED=<n>        enabled items
#    EFFECTIVE=<n>      effective items
#    REBOOTED=0|1       device rebooted since last import?
#    ITEM=<id>|<type>|<enabled>|<effective>|<pinned>|<title>
#    ...
#
#  Copyright (C) 2026 RGWS-LiuLai (Coolapk: 恋勿思) · GPL-3.0
# ============================================================

case "$0" in
    */*) _dir="${0%/*}" ;;
    *)   _dir="." ;;
esac
. "$_dir/common.sh"

TOTAL=0
ENABLED=0
EFFECTIVE=0
ITEMS_OUT=""

if [ -d "$ITEMS" ]; then
    for d in "$ITEMS"/*/; do
        [ -d "$d" ] || continue
        _id="$(basename "$d")"
        [ -f "$d/meta.conf" ] || continue

        _type="$(sh "$_dir/list.sh" field "$_id" type 2>/dev/null)"
        _title="$(sh "$_dir/list.sh" field "$_id" title 2>/dev/null)"
        _en="$(sh "$_dir/list.sh" field "$_id" enabled 2>/dev/null)"
        [ -z "$_en" ] && _en=1
        _pin="$(sh "$_dir/list.sh" field "$_id" pinned 2>/dev/null)"
        [ -z "$_pin" ] && _pin=0

        _eff="$(sh "$_dir/list.sh" effective "$_id" 2>/dev/null)"
        [ -z "$_eff" ] && _eff=0

        TOTAL=$((TOTAL + 1))
        [ "$_en" = "1" ] && ENABLED=$((ENABLED + 1))
        [ "$_eff" = "1" ] && EFFECTIVE=$((EFFECTIVE + 1))

        ITEMS_OUT="${ITEMS_OUT}ITEM=${_id}|${_type}|${_en}|${_eff}|${_pin}|${_title}
"
    done
fi

# ---- colour decision ----
if [ "$ENABLED" -eq 0 ]; then
    COLOR="red"
elif [ "$EFFECTIVE" -ge "$ENABLED" ]; then
    # every enabled item is effective
    COLOR="green"
elif [ "$EFFECTIVE" -eq 0 ]; then
    COLOR="red"
else
    COLOR="yellow"
fi

# ---- reboot detection ----
# state.conf is touched on every import; if it predates this boot,
# the device has been rebooted since the last change.
REBOOTED=0
BOOTEPOCH=0
NOW=$(date +%s 2>/dev/null | tr -dc '0-9')
UP=$(cut -d. -f1 /proc/uptime 2>/dev/null | tr -dc '0-9')
if [ -n "$NOW" ] && [ -n "$UP" ]; then
    BOOTEPOCH=$((NOW - UP))
    if [ -f "$STATE" ]; then
        MT=$(stat -c %Y "$STATE" 2>/dev/null | tr -dc '0-9')
        if [ -n "$MT" ] && [ "$MT" -gt 0 ] && [ "$MT" -lt "$BOOTEPOCH" ]; then
            REBOOTED=1
        fi
    fi
fi

echo "COLOR=$COLOR"
echo "TOTAL=$TOTAL"
echo "ENABLED=$ENABLED"
echo "EFFECTIVE=$EFFECTIVE"
echo "REBOOTED=$REBOOTED"
echo "BOOTEPOCH=$BOOTEPOCH"

# ---- OEM attestation overlay state ----
# The overlay is what KeyAttestation-style tools read for OEM roots.
OVL_MODE=""; OVL_INSTALLED=0; OVL_MOUNTED=0
if [ -f "$SCRIPTS/overlay.sh" ]; then
    OVL_MODE="$(sh "$SCRIPTS/overlay.sh" mode 2>/dev/null)"
    OVL_INSTALLED="$(sh "$SCRIPTS/overlay.sh" installed 2>/dev/null)"
    OVL_MOUNTED="$(sh "$SCRIPTS/overlay.sh" mounted 2>/dev/null)"
fi
echo "OVL_MODE=$OVL_MODE"
echo "OVL_INSTALLED=${OVL_INSTALLED:-0}"
echo "OVL_MOUNTED=${OVL_MOUNTED:-0}"
printf '%s' "$ITEMS_OUT"
