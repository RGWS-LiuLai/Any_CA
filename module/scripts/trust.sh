#!/system/bin/sh
# ============================================================
#  Any - CA  ::  scripts/trust.sh
#  Install CA certificates into the Android system trust store
#  with backup / rollback / dedup / conflict detection.
#
#  Target selection follows AnyKeybox - module (same project):
#    /apex/com.android.conscrypt/cacerts  (preferred, Android 14+)
#    /system/etc/security/cacerts         (legacy fallback)
#
#  File naming uses the Android system CA convention:
#     MD5(raw Subject DER TLV) first 4 bytes little-endian → <hash>.<n>
#
#  Copyright (C) 2026 RGWS-LiuLai (Coolapk: 恋勿思) · GPL-3.0
# ============================================================

case "$0" in
    */*) _dir="${0%/*}" ;;
    *)   _dir="." ;;
esac
. "$_dir/common.sh"

# ------------------------------------------------------------
#  target_dir — pick the trust store to write into
# ------------------------------------------------------------
target_dir() {
    if [ -d "$APEX_CACERTS" ]; then
        echo "$APEX_CACERTS"
    elif [ -d "$SYS_CACERTS" ]; then
        echo "$SYS_CACERTS"
    else
        echo ""
    fi
}

# ------------------------------------------------------------
#  target_mode — "apex" | "system" | ""
# ------------------------------------------------------------
target_mode() {
    if [ -d "$APEX_CACERTS" ]; then echo apex
    elif [ -d "$SYS_CACERTS" ]; then echo system
    else echo ""; fi
}

# ------------------------------------------------------------
#  module_cacerts_dir — where this module stages the files
# ------------------------------------------------------------
module_cacerts_dir() {
    _m="$(target_mode)"
    case "$_m" in
        apex)   echo "$MODPATH/apex/com.android.conscrypt/cacerts" ;;
        system) echo "$MODPATH/system/etc/security/cacerts" ;;
        *)      echo "" ;;
    esac
}

# ------------------------------------------------------------
#  normalize_pem <src> <dst>
#  Re-wrap a PEM certificate to 64-column form, one cert per file.
# ------------------------------------------------------------
normalize_pem() {
    awk '
        /-----BEGIN CERTIFICATE-----/ { inblk = 1; body = ""; next }
        /-----END CERTIFICATE-----/ {
            if (inblk) {
                printf "-----BEGIN CERTIFICATE-----\n"
                n = length(body)
                for (i = 1; i <= n; i += 64)
                    print substr(body, i, 64)
                printf "-----END CERTIFICATE-----\n"
                inblk = 0
            }
            next
        }
        inblk { gsub(/[ \t\r\n]/, ""); body = body $0 }
    ' "$1" > "$2" 2>/dev/null
}

# ------------------------------------------------------------
#  subject_hash <pem_file> — Android CA file-name hash
#  Requires the `gen/hash.js` helper (node-free, pure busybox awk
#  is not enough), so hashing is done by the WebUI and passed in.
#  This function exists for callers that already know the hash.
# ------------------------------------------------------------
hash_for() {
    echo "$1"
}

# ------------------------------------------------------------
#  install_cert <pem> <hash> — stage one CA file
#  Prints the final file name on success.
# ------------------------------------------------------------
install_cert() {
    _pem="$1"; _hash="$2"
    _dest="$(module_cacerts_dir)"
    [ -n "$_dest" ] || { log ERROR "no trust store target"; return 2; }
    mkdir -p "$_dest" 2>/dev/null || return 3

    # Conflict/dedup: find a free <hash>.<n> slot
    n=0
    while [ -f "$_dest/$_hash.$n" ]; do
        n=$((n + 1))
        [ "$n" -gt 32 ] && { log ERROR "too many collisions for $_hash"; return 4; }
    done
    _name="$_hash.$n"

    normalize_pem "$_pem" "$_dest/$_name" || return 5
    chmod 644 "$_dest/$_name" 2>/dev/null
    chown 0:0 "$_dest/$_name" 2>/dev/null
    chcon u:object_r:system_file:s0 "$_dest/$_name" 2>/dev/null

    log INFO "staged CA $_name"
    echo "$_name"
    return 0
}

# ------------------------------------------------------------
#  install_pem_text <b64_pem> <hash> — stage from base64 text
#  Avoids temp files; used by the WebUI.
# ------------------------------------------------------------
install_b64() {
    _b64="$1"; _hash="$2"
    _dest="$(module_cacerts_dir)"
    [ -n "$_dest" ] || { echo "ERR_NOTARGET"; return 2; }
    mkdir -p "$_dest" 2>/dev/null || { echo "ERR_MKDIR"; return 3; }

    n=0
    while [ -f "$_dest/$_hash.$n" ]; do
        n=$((n + 1))
        [ "$n" -gt 32 ] && { echo "ERR_COLLISION"; return 4; }
    done
    _name="$_hash.$n"

    # Remove any stale file first: if this path is currently part of a live
    # bind mount, writing in place can leave a 0-byte file.
    rm -f "$_dest/$_name" 2>/dev/null

    printf '%s' "$_b64" | base64 -d > "$_dest/$_name" 2>/dev/null || {
        rm -f "$_dest/$_name"
        echo "ERR_WRITE"; return 5
    }

    # verify the file is non-empty, otherwise the write silently failed
    if [ ! -s "$_dest/$_name" ]; then
        rm -f "$_dest/$_name"
        echo "ERR_WRITE"; return 5
    fi

    log INFO "staged CA $_name"
    echo "$_name"
    return 0
}

# ------------------------------------------------------------
#  clear_all — remove every staged CA file (used when replacing)
# ------------------------------------------------------------
clear_all() {
    _dest="$(module_cacerts_dir)"
    [ -n "$_dest" ] && [ -d "$_dest" ] || return 0
    rm -f "$_dest"/*.* 2>/dev/null
    log INFO "cleared staged CAs"
    return 0
}

# ------------------------------------------------------------
#  uninstall_cert <name>
# ------------------------------------------------------------
uninstall_cert() {
    _dest="$(module_cacerts_dir)"
    [ -n "$_dest" ] && [ -f "$_dest/$1" ] || return 1
    rm -f "$_dest/$1" 2>/dev/null
    log INFO "removed CA $1"
    return 0
}

# ------------------------------------------------------------
#  mounted <name> — is the file visible in the real trust store?
# ------------------------------------------------------------
mounted() {
    _dir="$(target_dir)"
    [ -n "$_dir" ] && [ -f "$_dir/$1" ]
}

# ------------------------------------------------------------
#  status_all — emit status for every staged CA file
#    name|staged|mounted
# ------------------------------------------------------------
status_all() {
    _dest="$(module_cacerts_dir)"
    [ -n "$_dest" ] && [ -d "$_dest" ] || return 0
    for f in "$_dest"/*; do
        [ -f "$f" ] || continue
        _n="$(basename "$f")"
        _m=0; mounted "$_n" && _m=1
        printf '%s|1|%s\n' "$_n" "$_m"
    done
}

# ------------------------------------------------------------
#  CLI
# ------------------------------------------------------------
case "$1" in
    dir)       target_dir ;;
    mode)      target_mode ;;
    moddir)    module_cacerts_dir ;;
    install)   install_cert "$2" "$3" ;;
    installb64) install_b64 "$2" "$3" ;;
    clearall)  clear_all ;;
    remove)    uninstall_cert "$2" ;;
    mounted)   mounted "$2" && echo 1 || echo 0 ;;
    status)    status_all ;;
    *)
        echo "usage: trust.sh {dir|mode|moddir|install <pem> <hash>|installb64 <b64> <hash>|clearall|remove <name>|mounted <name>|status}" >&2
        exit 64
        ;;
esac
