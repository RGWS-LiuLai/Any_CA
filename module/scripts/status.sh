#!/system/bin/sh
# ============================================================
#  AnyKeybox - module :: status.sh
#  Detects whether the CA files written by the WebUI are
#  actually present in the system target directory (i.e.
#  mounted by the root manager), reports the status and
#  optionally rewrites module.prop description.
#
#  state.txt format (written by WebUI):
#    mode=apex            (or "system")
#    file=<hash>.<n>      (one line per imported file)
#
#  Output (with --print):
#    STATUS=NONE|IMPORTED|ACTIVE
#    REBOOTED=0|1   (import happened before this boot?)
#    BOOTEPOCH=...  (epoch second this boot started)
#    CERT=<name>|src=1|sys=1|der=1|zyg=1|app=1   (per certificate)
#      src  = module source file exists
#      sys  = mounted into system trust store
#      der  = DER fingerprint identical to the source
#      zyg  = visible to every Zygote process ("" = unknown)
#      app  = visible to a running app process    ("" = unknown)
# ============================================================

MODDIR="$(cd "$(dirname "$0")/.." && pwd)"
STATE="$MODDIR/state.txt"
PROP="$MODDIR/module.prop"

MODE=""
FILES=""
STATUS="NONE"
COUNT=0
ACTIVE_COUNT=0

if [ -f "$STATE" ]; then
    MODE="$(grep -m1 '^mode=' "$STATE" 2>/dev/null | cut -d= -f2- | tr -d '\r')"
    FILES="$(grep '^file=' "$STATE" 2>/dev/null | cut -d= -f2- | tr -d '\r' | tr '\n' ' ')"
fi

case "$MODE" in
    apex)
        SYSDIR="/apex/com.android.conscrypt/cacerts"
        MODCAC="$MODDIR/apex/com.android.conscrypt/cacerts"
        ;;
    system)
        SYSDIR="/system/etc/security/cacerts"
        MODCAC="$MODDIR/system/etc/security/cacerts"
        ;;
    *)
        SYSDIR=""
        MODCAC=""
        ;;
esac

if [ -n "$MODE" ] && [ -n "$SYSDIR" ] && [ -n "$FILES" ]; then
    STATUS="IMPORTED"
    ALL=1
    for f in $FILES; do
        COUNT=$((COUNT + 1))
        if [ -f "$SYSDIR/$f" ]; then
            ACTIVE_COUNT=$((ACTIVE_COUNT + 1))
        else
            ALL=0
        fi
    done
    if [ "$ALL" -eq 1 ] && [ "$COUNT" -gt 0 ]; then
        STATUS="ACTIVE"
    fi
fi

# ---------- reboot detection ----------
# If state.txt (written at import time) was last modified before this
# boot started, the device has rebooted since the import.
REBOOTED=0
BOOTEPOCH=0
NOW=$(date +%s)
UP=$(cut -d. -f1 /proc/uptime 2>/dev/null | tr -dc '0-9')
case "$NOW$UP" in
    *[!0-9]*|"") : ;;
    *)
        BOOTEPOCH=$((NOW - UP))
        if [ -f "$STATE" ]; then
            MT=$(stat -c %Y "$STATE" 2>/dev/null | tr -dc '0-9')
            if [ -n "$MT" ] && [ "$MT" -gt 0 ] && [ "$MT" -lt "$BOOTEPOCH" ]; then
                REBOOTED=1
            fi
        fi
        ;;
esac

# ---------- per-certificate verification ----------
# PEM body fingerprint (DER-equivalent, whitespace/newline agnostic)
pem_fp() {
    awk '/-----BEGIN CERTIFICATE-----/{f=1;next} /-----END CERTIFICATE-----/{f=0;exit} f' "$1" 2>/dev/null \
        | tr -d ' \t\r\n' | md5sum | cut -d' ' -f1
}

# pidof may return several pids (zygote64 + usap) — check them all
ZYGO_LIST="$(pidof zygote64 2>/dev/null || pidof zygote 2>/dev/null)"
APPPID_LIST="$(pidof com.android.systemui 2>/dev/null)"
[ -z "$APPPID_LIST" ] && APPPID_LIST="$(ps -o pid,user,args 2>/dev/null | awk '/^ *[0-9]+ +u0_a/{print $1; exit}')"

CERT_OUT=""
if [ -n "$FILES" ] && [ -n "$MODCAC" ] && [ -n "$SYSDIR" ]; then
    for f in $FILES; do
        SRC="$MODCAC/$f"
        DST="$SYSDIR/$f"

        S=0; [ -f "$SRC" ] && S=1
        Y=0; [ -f "$DST" ] && Y=1

        D=0
        if [ "$S" -eq 1 ] && [ "$Y" -eq 1 ]; then
            [ "$(pem_fp "$SRC")" = "$(pem_fp "$DST")" ] && D=1
        fi

        Z=""
        if [ -n "$ZYGO_LIST" ]; then
            Z=1
            for zp in $ZYGO_LIST; do
                [ -f "/proc/$zp/root$DST" ] || Z=0
            done
        fi

        A=""
        if [ -n "$APPPID_LIST" ]; then
            A=1
            for ap in $APPPID_LIST; do
                [ -f "/proc/$ap/root$DST" ] || A=0
            done
        fi

        CERT_OUT="${CERT_OUT}CERT=$f|src=$S|sys=$Y|der=$D|zyg=$Z|app=$A
"
    done
fi

case "$STATUS" in
    ACTIVE)
        DESC="✅ CA certificates mounted and trusted ($COUNT) — AnyKeybox module is working."
        ;;
    IMPORTED)
        DESC="⏳ CA imported ($ACTIVE_COUNT/$COUNT mounted) — enable this module and reboot to activate."
        ;;
    *)
        DESC="📦 No CA imported yet — open the WebUI and select a keybox.xml to install certificates."
        ;;
esac

# 支持任意参数组合与顺序（如 "--update --print"）
DO_UPDATE=0; DO_PRINT=0
for _a in "$@"; do
    case "$_a" in
        --update|-u) DO_UPDATE=1 ;;
        --print|-p)  DO_PRINT=1 ;;
    esac
done
[ $# -eq 0 ] && DO_PRINT=1

if [ "$DO_UPDATE" -eq 1 ]; then
    if [ -f "$PROP" ]; then
        awk -v d="$DESC" '
            /^description=/ { print "description=" d; done = 1; next }
            { print }
            END { if (!done) print "description=" d }
        ' "$PROP" > "$PROP.tmp" 2>/dev/null && mv "$PROP.tmp" "$PROP"
        chmod 644 "$PROP" 2>/dev/null
    fi
fi

if [ "$DO_PRINT" -eq 1 ]; then
    FILES_CSV="$(echo $FILES | tr ' ' ',')"
    echo "STATUS=$STATUS"
    echo "MODE=$MODE"
    echo "SYSDIR=$SYSDIR"
    echo "MODDIR=$MODDIR"
    echo "COUNT=$COUNT"
    echo "ACTIVE=$ACTIVE_COUNT"
    echo "FILES=$FILES_CSV"
    echo "REBOOTED=$REBOOTED"
    echo "BOOTEPOCH=$BOOTEPOCH"
    printf '%s' "$CERT_OUT"
fi
