#!/usr/bin/env bash
# MFA forced alignment for phon and syntax corpora.
# Input:  analysis/mfa/corpus/{phon,syntax}/<speaker>/<file>.wav + <file>.lab
# Output: analysis/mfa/aligned/{phon,syntax}/<speaker>/<file>.TextGrid
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MFA_DIR="${MFA_DIR:-$(cd "$SCRIPT_DIR/.." && pwd)/mfa}"
CORPUS_ROOT="${CORPUS_ROOT:-$MFA_DIR/corpus}"
ALIGN_ROOT="${ALIGN_ROOT:-$MFA_DIR/aligned}"
RUN_ROOT="${RUN_ROOT:-$MFA_DIR/runs}"

mfa() { conda run -n aligner mfa "$@"; }

export MFA_ROOT_DIR="${MFA_ROOT_DIR:-$MFA_DIR/state}"
export MFA_TMP_DIR="${MFA_TMP_DIR:-$MFA_DIR/tmp}"

DICTIONARY_MODEL="english_us_arpa"
ACOUSTIC_MODEL="english_us_arpa"
G2P_MODEL="english_us_arpa"
NUM_JOBS="${NUM_JOBS:-8}"
# Which corpora to align. Narrow this when only one experiment has new data.
EXPERIMENTS="${EXPERIMENTS:-phon syntax}"

mkdir -p "$MFA_ROOT_DIR" "$MFA_TMP_DIR"

echo "Configuring MFA..."
mfa configure -t "$MFA_TMP_DIR" -j "$NUM_JOBS" --always_overwrite

echo "Ensuring models exist..."
mfa model download acoustic "$ACOUSTIC_MODEL"
mfa model download dictionary "$DICTIONARY_MODEL"
mfa model download g2p "$G2P_MODEL"

for exp in $EXPERIMENTS; do
  corpus_dir="$CORPUS_ROOT/$exp"
  align_dir="$ALIGN_ROOT/$exp"
  run_dir="$RUN_ROOT/$exp"
  profile="tense_timing_${exp}"

  if [[ ! -d "$corpus_dir" ]]; then
    echo "Skipping $exp: corpus dir not found ($corpus_dir)"
    continue
  fi

  echo
  echo "=============================="
  echo "Aligning: $exp"
  echo "=============================="

  mkdir -p "$align_dir" "$run_dir/validate" "$run_dir/oovs"

  # Align only speakers we can tie to a participant. Recordings named after the
  # naming change carry their own id and land in a folder named for it. Older
  # ones were matched through the results file; anything that could not be
  # matched sits in rando_*, and demo runs in demo/. Both are skipped.
  sona_corpus_dir="$run_dir/sona_corpus"
  rm -rf "$sona_corpus_dir"
  mkdir -p "$sona_corpus_dir"
  skipped_speakers=0
  for speaker_dir in "$corpus_dir"/*/; do
    speaker="$(basename "$speaker_dir")"
    if [[ "$speaker" == rando_* || "$speaker" == demo || "$speaker" == noid ]]; then
      skipped_speakers=$((skipped_speakers + 1))
      continue
    fi
    # A session that stopped after the practice items leaves a folder of wavs
    # with no transcript beside them. There is nothing to align there, and
    # passing it to MFA only produces warnings.
    if ! compgen -G "$speaker_dir*.lab" > /dev/null; then
      skipped_speakers=$((skipped_speakers + 1))
      continue
    fi
    ln -s "$speaker_dir" "$sona_corpus_dir/$speaker"
  done
  echo "Speakers: $(find "$sona_corpus_dir" -maxdepth 1 -mindepth 1 | wc -l | tr -d ' ') aligned, $skipped_speakers unidentified and skipped"

  echo "Validating corpus..."
  mfa validate "$sona_corpus_dir" "$DICTIONARY_MODEL" \
    --acoustic_model_path "$ACOUSTIC_MODEL" \
    --output_directory "$run_dir/validate" \
    -p "$profile" -t "$MFA_TMP_DIR" \
    --clean --final_clean --overwrite

  oov_file=""
  if [[ -f "$run_dir/validate/oovs_found_${DICTIONARY_MODEL}.txt" ]]; then
    oov_file="$run_dir/validate/oovs_found_${DICTIONARY_MODEL}.txt"
  elif [[ -f "$run_dir/validate/oovs_found.txt" ]]; then
    oov_file="$run_dir/validate/oovs_found.txt"
  fi

  if [[ -n "$oov_file" && -s "$oov_file" ]]; then
    echo "Generating OOV pronunciations..."
    mfa g2p "$oov_file" "$G2P_MODEL" "$run_dir/oovs/oovs_g2p.txt" \
      --dictionary_path "$DICTIONARY_MODEL" \
      -p "$profile" -t "$MFA_TMP_DIR" \
      --clean --final_clean --overwrite

    echo "Adding OOVs to dictionary..."
    mfa model add_words "$DICTIONARY_MODEL" "$run_dir/oovs/oovs_g2p.txt" \
      -p "$profile" -t "$MFA_TMP_DIR"
  else
    echo "No OOVs, skipping g2p."
  fi

  echo "Aligning $exp..."
  mfa align "$sona_corpus_dir" "$DICTIONARY_MODEL" "$ACOUSTIC_MODEL" "$align_dir" \
    -p "$profile" -t "$MFA_TMP_DIR" \
    --clean --final_clean --overwrite

  echo "Done: $exp → $align_dir"
done

echo
echo "All done."
