#!/system/bin/sh
# ============================================================
#  Any - CA  ::  post-fs-data.sh
#
#  Runs in the post-fs-data stage (before system_server), and mounts
#  the system CA trust store with our staged certificates added.
#
#  Why a bind mount is needed:
#    /apex/com.android.conscrypt/cacerts is read-only (erofs inside an
#    APEX). We therefore prepare a directory that contains a copy of
#    the stock certificates PLUS the ones staged by the WebUI, and bind
#    mount it over the real path. Processes started afterwards see the
#    merged set.
#
#  Safety rules learned the hard way:
#    * never `rm -rf` a directory that is currently bind-mounted onto a
#      system path — the kernel marks it "/deleted" and the mount shows
#      an empty tree.  Always umount first.
#    * rebuild the staging dir from scratch on every boot so it always
#      reflects the current stock content.
#
#  Copyright (C) 2026 RGWS-LiuLai (Coolapk: 恋勿思) · GPL-3.0
# ============================================================

MODDIR="${0%/*}"
[ -d "$MODDIR" ] || MODDIR="/data/adb/modules/Any_CA"

LOG="$MODDIR/mount.log"
: > "$LOG" 2>/dev/null
log() { echo "[$(date '+%H:%M:%S')] $*" >> "$LOG"; }

STAGED="$MODDIR/apex/com.android.conscrypt/cacerts"
TARGET="/apex/com.android.conscrypt/cacerts"
ROOT="$MODDIR/.cacerts_root"

log "=== Any_CA post-fs-data start ==="

# nothing staged -> nothing to do
if [ ! -d "$STAGED" ] || [ -z "$(ls -A "$STAGED" 2>/dev/null)" ]; then
    log "no staged certs, nothing to mount"
    exit 0
fi

# wait for the target to appear (APEX mounts happen early)
i=0
while [ ! -d "$TARGET" ] && [ "$i" -lt 50 ]; do
    sleep 0.1
    i=$((i + 1))
done
[ -d "$TARGET" ] || { log "target missing: $TARGET"; exit 1; }

# ---- if we already mounted there, unmount first (avoids /deleted) ----
if grep -q " $ROOT " /proc/self/mountinfo 2>/dev/null || \
   grep -q " $TARGET " /proc/self/mountinfo 2>/dev/null; then
    : # inspect below
fi
if mount 2>/dev/null | grep -qF "$ROOT on $TARGET"; then
    log "already mounted, refreshing contents in place"
    # copy new certs without deleting the mounted directory
    for c in "$STAGED"/*; do
        [ -f "$c" ] || continue
        cp -f "$c" "$ROOT/" 2>/dev/null
    done
    chown 0:0 "$ROOT"/* 2>/dev/null
    chmod 644 "$ROOT"/* 2>/dev/null
    chcon -R u:object_r:system_file:s0 "$ROOT" 2>/dev/null
    log "refreshed, $(ls "$TARGET" | wc -l) certs visible"
    exit 0
fi

# ---- build a fresh staging root ----
mkdir -p "$ROOT" 2>/dev/null
# clear previous contents WITHOUT removing the directory itself
find "$ROOT" -mindepth 1 -maxdepth 1 -exec rm -rf {} + 2>/dev/null

n=0
for e in "$TARGET"/*; do
    [ -e "$e" ] || continue
    cp -a "$e" "$ROOT/" 2>/dev/null && n=$((n + 1))
done
log "copied $n stock certs"

m=0
for c in "$STAGED"/*; do
    [ -f "$c" ] || continue
    cp -f "$c" "$ROOT/" 2>/dev/null && m=$((m + 1))
done
log "added $m staged certs"

chown -R 0:0 "$ROOT" 2>/dev/null
chmod 644 "$ROOT"/* 2>/dev/null
chcon -R u:object_r:system_file:s0 "$ROOT" 2>/dev/null

mount --bind "$ROOT" "$TARGET" 2>>"$LOG"
if [ $? -ne 0 ]; then
    log "bind mount FAILED"
    exit 1
fi

log "mounted, $(ls "$TARGET" | wc -l) certs visible"
log "=== done ==="
exit 0
