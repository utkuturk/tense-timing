#!/usr/bin/env bash
# Archive one cycle of recordings, then delete exactly that cycle from the live
# bucket. Everything is driven by a manifest frozen at snapshot time, so uploads
# that arrive while you work are never archived and never deleted.
#
#   bash s3_release.sh snapshot   # freeze what is on disk now into a manifest
#   bash s3_release.sh check      # compare the archive against the manifest
#   bash s3_release.sh archive    # make the archive prefix exactly the manifest
#   bash s3_release.sh release    # delete manifest keys from the bucket + stage
#   bash s3_release.sh all        # all four, with one confirmation
#
# Run them in that order. check and archive are safe to repeat. Override any of
# the settings below with environment variables; STAMP re-targets an old cycle.
set -euo pipefail

SRC="${SRC:-s3://shota-utku-tense-2026}"
ARC_BUCKET="${ARC_BUCKET:-s3://shota-utku-tense-2026-archive}"
STAGE="${STAGE:-$HOME/aws-sync/syn}"
KEEP_DIR="${KEEP_DIR:-$HOME/workspace/tense-timing/data/syn}"   # local copy of record
STAMP="${STAMP:-$(date +%F)}"

ARC="$ARC_BUCKET/$STAMP"
L="${L:-$HOME/aws-sync/syn-manifest-$STAMP.txt}"
W="$HOME/aws-sync/.s3work/$STAMP"
mkdir -p "$W" "$(dirname "$L")"

die() { printf '\nABORT: %s\n' "$*" >&2; exit 1; }
say() { printf '\n== %s\n' "$*"; }

# Keys under a bucket or prefix, one per line, prefix stripped.
keys() { aws s3 ls "$1" --recursive \
  | awk '{$1="";$2="";$3="";sub(/^ +/,"")}1' | sed "s|^${2:-}||" | sed '/^$/d' | sort; }

need_manifest() {
  [ -s "$L" ] || die "no manifest at $L - run 'snapshot' first"
  printf 'manifest: %s zips (%s)\n' "$(wc -l < "$L" | tr -d ' ')" "$L"
}

cmd_snapshot() {
  find "$STAGE" -maxdepth 1 -name '*.zip' -exec basename {} \; | sort > "$L"
  [ -s "$L" ] || die "no zips in $STAGE"
  say "snapshot: $(wc -l < "$L" | tr -d ' ') zips -> $L"
}

cmd_check() {
  need_manifest
  keys "$ARC/" "$STAMP/" > "$W/arc_now.txt" || : > "$W/arc_now.txt"
  comm -13 "$L" "$W/arc_now.txt" > "$W/arc_extra.txt"    # in archive, not in manifest
  comm -23 "$L" "$W/arc_now.txt" > "$W/arc_missing.txt"  # in manifest, not archived
  say "extra in archive: $(wc -l < "$W/arc_extra.txt" | tr -d ' ')"; cat "$W/arc_extra.txt"
  say "missing from archive: $(wc -l < "$W/arc_missing.txt" | tr -d ' ')"; cat "$W/arc_missing.txt"
}

cmd_archive() {
  cmd_check
  if [ -s "$W/arc_missing.txt" ]; then
    while IFS= read -r k || [ -n "$k" ]; do aws s3 cp "$SRC/$k" "$ARC/$k" --only-show-errors; done < "$W/arc_missing.txt"
  fi
  if [ -s "$W/arc_extra.txt" ]; then
    while IFS= read -r k || [ -n "$k" ]; do aws s3 rm "$ARC/$k" --only-show-errors; done < "$W/arc_extra.txt"
  fi

  keys "$ARC/" "$STAMP/" > "$W/arc_final.txt"
  diff -q "$L" "$W/arc_final.txt" >/dev/null \
    || { diff "$L" "$W/arc_final.txt"; die "archive does not match the manifest"; }
  say "ARCHIVE OK: exactly the manifest"
  aws s3 ls "$ARC/" --recursive --summarize | tail -2
}

cmd_release() {
  need_manifest
  keys "$ARC/" "$STAMP/" > "$W/arc_final.txt" || : > "$W/arc_final.txt"
  diff -q "$L" "$W/arc_final.txt" >/dev/null \
    || die "archive does not match the manifest - run 'archive' first"

  if [ -d "$KEEP_DIR" ]; then
    n=0; while IFS= read -r k || [ -n "$k" ]; do [ -f "$KEEP_DIR/$k" ] || n=$((n+1)); done < "$L"
    [ "$n" -eq 0 ] || die "$n manifest zips are not in $KEEP_DIR"
    say "all manifest zips present in $KEEP_DIR"
  fi

  say "deleting $(wc -l < "$L" | tr -d ' ') keys from $SRC"
  while IFS= read -r k || [ -n "$k" ]; do aws s3 rm "$SRC/$k" --only-show-errors; done < "$L"

  say "left in the live bucket (arrived during this cycle, kept for the next)"
  aws s3 ls "$SRC" --recursive --summarize | tail -2

  say "clearing the stage"
  while IFS= read -r k || [ -n "$k" ]; do rm -f "$STAGE/$k"; done < "$L"
  echo "$(find "$STAGE" -maxdepth 1 -name '*.zip' | wc -l | tr -d ' ') zips left in $STAGE"
}

# snapshot -> archive -> release, stopping at the first failed assertion.
# Both later stages verify before they act, so the only thing a human adds is
# agreeing to the plan; YES=1 or --yes skips the prompt for unattended runs.
cmd_all() {
  cmd_snapshot
  cmd_check
  if [ "${YES:-0}" != "1" ] && [ "${2:-}" != "--yes" ]; then
    printf '\nArchive these %s zips to %s, then delete them from %s? [y/N] ' \
      "$(wc -l < "$L" | tr -d ' ')" "$ARC" "$SRC"
    read -r reply < /dev/tty
    case "$reply" in [yY]*) ;; *) die "cancelled" ;; esac
  fi
  cmd_archive
  cmd_release
}

case "${1:-}" in
  snapshot) cmd_snapshot ;;
  check)    cmd_check ;;
  archive)  cmd_archive ;;
  release)  cmd_release ;;
  all)      cmd_all "$@" ;;
  *) die "usage: $(basename "$0") {all|snapshot|check|archive|release} [--yes]" ;;
esac
