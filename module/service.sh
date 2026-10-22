#!/system/bin/sh
# AnyKeybox - module :: boot service
# Refreshes module.prop description with the real mount status
# after the root manager has applied module mounts.
MODDIR="${0%/*}"
sh "$MODDIR/scripts/status.sh" --update >/dev/null 2>&1
