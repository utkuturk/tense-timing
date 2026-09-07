#!/usr/bin/env bash
# One collection cycle for Experiment 3: pull whatever the recorder has uploaded,
# fold it into the analysis, then archive and clear what was pulled.
#
#   bash analysis/scripts/refresh_syn.sh            # pull, then analyse
#   bash analysis/scripts/refresh_syn.sh --pull     # pull only
#   bash analysis/scripts/refresh_syn.sh --analyse  # analyse only
#   bash analysis/scripts/refresh_syn.sh --release  # archive, empty, clear stage
#
# Re-running is safe. Each stage skips work already done: zips are copied only if
# absent, wavs are converted only if missing, transcripts are cached, and MFA
# realigns from scratch each time by design.
#
# The release stage acts only on the manifest written when the pull ran. A
# session that uploads while the script is working is neither archived nor
# deleted, so it survives in the live bucket for the next cycle. This matters:
# recordings upload in chunks during a session, and results are only submitted at
# the end, so the bucket is never quiet while the study is open.
set -euo pipefail

BUCKET="${BUCKET:-s3://shota-utku-tense-2026}"
ARCHIVE_BUCKET="${ARCHIVE_BUCKET:-s3://shota-utku-tense-2026-archive}"
STAGE="${STAGE:-$HOME/aws-sync/syn}"
EXPERIMENTS="${EXPERIMENTS:-syntax}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$SCRIPT_DIR/../.." && pwd)"
DATA_DIR="$REPO/data/syn"
STAMP="${STAMP:-$(date +%Y-%m-%d)}"
MANIFEST="$HOME/aws-sync/syn-manifest-$STAMP.txt"
ARCHIVE_PREFIX="$ARCHIVE_BUCKET/$STAMP"

say() { printf '\n\033[1m== %s\033[0m\n' "$*"; }
die() { printf '\nABORT: %s\n' "$*" >&2; exit 1; }

# Object keys under a bucket or prefix, one per line, with any prefix stripped.
s3_keys() {
  aws s3 ls "$1" --recursive \
    | awk '{ $1=""; $2=""; $3=""; sub(/^ +/, "") } 1' \
    | sed "s|^${2:-}||" | sed '/^$/d' | sort
}

do_pull() {
  say "Pulling $BUCKET -> $STAGE"
  mkdir -p "$STAGE"
  aws s3 sync "$BUCKET" "$STAGE"

  # The manifest freezes what this cycle owns. Everything downstream, including
  # the deletes, is driven from it rather than from a live listing.
  find "$STAGE" -maxdepth 1 -name '*.zip' -exec basename {} \; | sort > "$MANIFEST"
  [ -s "$MANIFEST" ] || die "nothing pulled; manifest is empty"
  say "Manifest: $(wc -l < "$MANIFEST" | tr -d ' ') zips -> $MANIFEST"

  say "Copying into $DATA_DIR"
  mkdir -p "$DATA_DIR"
  local added=0
  while IFS= read -r k || [ -n "$k" ]; do
    if [ ! -f "$DATA_DIR/$k" ]; then cp -c "$STAGE/$k" "$DATA_DIR/$k"; added=$((added + 1)); fi
  done < "$MANIFEST"
  echo "  added $added, $(find "$DATA_DIR" -name '*.zip' | wc -l | tr -d ' ') total"
}

# Every results file in data/ has to be listed in the qmd, or its participants
# align but carry no metadata and drop out of the models without saying so.
check_csvs() {
  say "Checking results files are wired into the report"
  local missing=0
  for f in "$REPO"/data/syn_*.csv; do
    [ -e "$f" ] || continue
    if ! grep -q "$(basename "$f")" "$REPO/analysis/analysis.qmd"; then
      echo "  NOT REFERENCED: data/$(basename "$f")"; missing=$((missing + 1))
    else
      echo "  ok: data/$(basename "$f")"
    fi
  done
  [ "$missing" -eq 0 ] || die "add the file(s) above to the read_pcibex_meta call for syn_meta in analysis/analysis.qmd"
}

do_analyse() {
  check_csvs
  say "Converting recordings"
  bash "$SCRIPT_DIR/prepare_recordings.sh"
  say "Transcribing"
  ( cd "$REPO" && uv run python analysis/scripts/transcribe_to_lab.py )
  say "Forced alignment ($EXPERIMENTS)"
  EXPERIMENTS="$EXPERIMENTS" bash "$SCRIPT_DIR/run_mfa.sh"
  say "Rendering report"
  ( cd "$REPO" && quarto render analysis/analysis.qmd )
}

do_release() {
  [ -f "$MANIFEST" ] || die "no manifest at $MANIFEST; run --pull first"
  local n; n="$(wc -l < "$MANIFEST" | tr -d ' ')"
  say "Releasing $n zips from this cycle"

  # Refuse to go on unless every manifest key is already safe in data/.
  local nodata=0
  while IFS= read -r k || [ -n "$k" ]; do [ -f "$DATA_DIR/$k" ] || nodata=$((nodata + 1)); done < "$MANIFEST"
  [ "$nodata" -eq 0 ] || die "$nodata manifest zips are not in $DATA_DIR"

  say "Archiving to $ARCHIVE_PREFIX"
  while IFS= read -r k || [ -n "$k" ]; do aws s3 cp "$BUCKET/$k" "$ARCHIVE_PREFIX/$k" --only-show-errors; done < "$MANIFEST"

  say "Verifying the archive holds exactly this cycle"
  local tmp; tmp="$(mktemp)"
  s3_keys "$ARCHIVE_PREFIX/" "$STAMP/" > "$tmp"
  local unarchived; unarchived="$(comm -23 "$MANIFEST" "$tmp" | wc -l | tr -d ' ')"
  [ "$unarchived" -eq 0 ] || { comm -23 "$MANIFEST" "$tmp"; rm -f "$tmp"; die "$unarchived not archived"; }
  local extra; extra="$(comm -13 "$MANIFEST" "$tmp" | wc -l | tr -d ' ')"
  if [ "$extra" -gt 0 ]; then
    echo "  removing $extra object(s) that are not part of this cycle:"
    comm -13 "$MANIFEST" "$tmp" | tee /dev/stderr | while IFS= read -r k || [ -n "$k" ]; do
      aws s3 rm "$ARCHIVE_PREFIX/$k" --only-show-errors
    done
  fi
  rm -f "$tmp"
  aws s3 ls "$ARCHIVE_PREFIX/" --recursive --summarize | tail -2

  say "Deleting this cycle's keys from $BUCKET"
  while IFS= read -r k || [ -n "$k" ]; do aws s3 rm "$BUCKET/$k" --only-show-errors; done < "$MANIFEST"

  say "Left in the live bucket (uploaded during this cycle; kept for the next one)"
  aws s3 ls "$BUCKET" --recursive --summarize | tail -2

  say "Clearing the stage"
  while IFS= read -r k || [ -n "$k" ]; do rm -f "$STAGE/$k"; done < "$MANIFEST"
  echo "  $(find "$STAGE" -maxdepth 1 -name '*.zip' | wc -l | tr -d ' ') zips left in $STAGE"
}

case "${1:---all}" in
  --pull)    do_pull ;;
  --analyse) do_analyse ;;
  --release) do_release ;;
  --all)     do_pull; do_analyse ;;
  *) die "usage: $(basename "$0") [--all|--pull|--analyse|--release]" ;;
esac
say "Done."
