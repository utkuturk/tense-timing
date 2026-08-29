#!/usr/bin/env bash
# Parse PCIbex CSVs → group zips by SONA ID → unzip + convert webm→wav
# Writes: mfa_corpus/phon/<sona_id>/*.wav  and  mfa_corpus/syntax/<sona_id>/*.wav
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATA_DIR="${DATA_DIR:-$(cd "$SCRIPT_DIR/.." && pwd)/data}"
uv run python "$SCRIPT_DIR/prepare_recordings.py" \
  --analysis-dir "$SCRIPT_DIR" --data-dir "$DATA_DIR"
