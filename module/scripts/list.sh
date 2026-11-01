#!/system/bin/sh
# ============================================================
#  Any - CA  ::  scripts/list.sh
#  Manage the certificate / keybox item list.
#
#  Each item lives in $ITEMS/<id>/ with:
#     meta.conf    type, title, enabled, pinned, created,
#                  source, hash (for CA), keybox info
#     payload      the original file (xml / pem / der converted)
#
#  Item types:
#     keybox   - generated self-signed keybox  (module-owned)
#     ukb      - user supplied keybox.xml
#     ca       - plain CA certificate (pem / der)
#
#  Copyright (C) 2026 RGWS-LiuLai (Coolapk: 恋勿思) · GPL-3.0
# ============================================================

case "$0" in
    */*) _dir="${0%/*}" ;;
    *)   _dir="." ;;
esac
. "$_dir/common.sh"

# ------------------------------------------------------------
#  item_field <id> <key>
# ------------------------------------------------------------
item_field() {
    _f="$ITEMS/$1/meta.conf"
    [ -f "$_f" ] || { echo ""; return; }
    sed -n "s/^$2=//p" "$_f" 2>/dev/null | head -1
}

# ------------------------------------------------------------
#  item_set <id> <key> <value>
# ------------------------------------------------------------
item_set() {
    _f="$ITEMS/$1/meta.conf"
    [ -f "$_f" ] || return 1
    _k="$2"; _v="$3"
    if grep -q "^$_k=" "$_f" 2>/dev/null; then
        sed -i "s|^$_k=.*|$_k=$_v|" "$_f" 2>/dev/null
    else
        printf '%s=%s\n' "$_k" "$_v" >> "$_f"
    fi
}

# ------------------------------------------------------------
#  new_id <type> — timestamp + random suffix
# ------------------------------------------------------------
new_id() {
    _ts="$(date +%Y%m%d%H%M%S)"
    _r="$(od -An -N2 -tu2 /dev/urandom 2>/dev/null | tr -d ' ')"
    [ -z "$_r" ] && _r="$$"
    echo "$1-$_ts-$_r"
}

# ------------------------------------------------------------
#  default_order — sort key per spec:
#    1. keybox items (module-generated) and user keyboxes
#    2. plain CA certificates
#    pinned items float above all of that
# ------------------------------------------------------------
type_rank() {
    case "$1" in
        keybox) echo 0 ;;
        ukb)    echo 1 ;;
        ca)     echo 2 ;;
        *)      echo 9 ;;
    esac
}

# ------------------------------------------------------------
#  list_items — tab-separated rows for the WebUI
#    id \t type \t title \t enabled \t pinned \t created \t extra
# ------------------------------------------------------------
list_items() {
    [ -d "$ITEMS" ] || return 0
    for d in "$ITEMS"/*/; do
        [ -d "$d" ] || continue
        _id="$(basename "$d")"
        _f="$d/meta.conf"
        [ -f "$_f" ] || continue
        _type="$(item_field "$_id" type)"
        _title="$(item_field "$_id" title)"
        _en="$(item_field "$_id" enabled)"; [ -z "$_en" ] && _en=1
        _pin="$(item_field "$_id" pinned)"; [ -z "$_pin" ] && _pin=0
        _cr="$(item_field "$_id" created)"
        _extra="$(item_field "$_id" extra)"
        _rank="$(type_rank "$_type")"
        # sort key: pinned first, then type rank, then newest first
        printf '%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\n' \
            "$_pin" "$_rank" "$_cr" "$_id" "$_type" "$_title" "$_en" "$_extra"
    done | sort -t"$(printf '\t')" -k1,1r -k2,2n -k3,3r
}

# ------------------------------------------------------------
#  toggle <id> — flip enabled
# ------------------------------------------------------------
toggle_item() {
    _id="$1"
    [ -d "$ITEMS/$_id" ] || return 1
    _cur="$(item_field "$_id" enabled)"; [ -z "$_cur" ] && _cur=1
    if [ "$_cur" = "1" ]; then _new=0; else _new=1; fi
    item_set "$_id" enabled "$_new"
    echo "$_new"
}

# ------------------------------------------------------------
#  pin / unpin
# ------------------------------------------------------------
pin_item() {
    _id="$1"; _v="$2"
    [ -d "$ITEMS/$_id" ] || return 1
    item_set "$_id" pinned "$_v"
}

# ------------------------------------------------------------
#  delete <id> — remove item dir and its staged CA file(s)
# ------------------------------------------------------------
delete_item() {
    _id="$1"
    [ -d "$ITEMS/$_id" ] || return 1
    _type="$(item_field "$_id" type)"
    _hash="$(item_field "$_id" hash)"
    case "$_type" in
        ca)
            if [ -n "$_hash" ]; then
                _dest="$(sh "$_dir/trust.sh" moddir 2>/dev/null)"
                if [ -n "$_dest" ]; then
                    rm -f "$_dest/$_hash".* 2>/dev/null
                fi
            fi
            ;;
    esac
    rm -rf "$ITEMS/$_id"
    log INFO "deleted item $_id"
    return 0
}

# ------------------------------------------------------------
#  item_effective <id> — does this item actually take effect?
#    ca    : staged file exists AND is visible in the real store
#    keybox: the keybox is distributed to at least one TEE module
# ------------------------------------------------------------
item_effective() {
    _id="$1"
    _f="$ITEMS/$_id/meta.conf"
    [ -f "$_f" ] || { echo 0; return; }
    _en="$(item_field "$_id" enabled)"; [ -z "$_en" ] && _en=1
    [ "$_en" = "1" ] || { echo 0; return; }

    _type="$(item_field "$_id" type)"
    case "$_type" in
        ca)
            _hash="$(item_field "$_id" hash)"
            [ -n "$_hash" ] || { echo 0; return; }
            _dest="$(sh "$_dir/trust.sh" moddir 2>/dev/null)"
            _sys="$(sh "$_dir/trust.sh" dir 2>/dev/null)"
            [ -n "$_dest" ] && [ -n "$_sys" ] || { echo 0; return; }
            # any staged <hash>.<n> that is also present in the system store
            for f in "$_dest/$_hash".*; do
                [ -f "$f" ] || continue
                _n="$(basename "$f")"
                [ -f "$_sys/$_n" ] && { echo 1; return; }
            done
            echo 0
            ;;
        keybox|ukb)
            _tgt="$(item_field "$_id" teetargets)"
            [ -n "$_tgt" ] && echo 1 || echo 0
            ;;
        *)
            echo 0
            ;;
    esac
}

# ------------------------------------------------------------
#  counts — total / enabled / effective
# ------------------------------------------------------------
counts() {
    _total=0; _enabled=0; _eff=0
    [ -d "$ITEMS" ] || { printf '0|0|0\n'; return; }
    for d in "$ITEMS"/*/; do
        [ -d "$d" ] || continue
        _id="$(basename "$d")"
        _f="$d/meta.conf"
        [ -f "$_f" ] || continue
        _total=$((_total + 1))
        _en="$(item_field "$_id" enabled)"; [ -z "$_en" ] && _en=1
        [ "$_en" = "1" ] && _enabled=$((_enabled + 1))
        [ "$(item_effective "$_id")" = "1" ] && _eff=$((_eff + 1))
    done
    printf '%s|%s|%s\n' "$_total" "$_enabled" "$_eff"
}

# ------------------------------------------------------------
#  CLI
# ------------------------------------------------------------
case "$1" in
    list)     list_items ;;
    field)    item_field "$2" "$3" ;;
    set)      item_set "$2" "$3" "$4" ;;
    toggle)   toggle_item "$2" ;;
    pin)      pin_item "$2" 1 ;;
    unpin)    pin_item "$2" 0 ;;
    delete)   delete_item "$2" ;;
    effective) item_effective "$2" ;;
    counts)   counts ;;
    newid)    new_id "$2" ;;
    *)
        echo "usage: list.sh {list|field|set|toggle|pin|unpin|delete|counts|newid}" >&2
        exit 64
        ;;
esac
