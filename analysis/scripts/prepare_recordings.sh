#!/usr/bin/env bash
# Parse PCIbex CSVs → group zips by SONA ID → unzip + convert webm→wav
# Writes: analysis/mfa/corpus/phon/<sona_id>/*.wav  and  .../syntax/<sona_id>/*.wav
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ANALYSIS_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
DATA_DIR="${DATA_DIR:-$(cd "$ANALYSIS_DIR/.." && pwd)/data}"
uv run python "$SCRIPT_DIR/prepare_recordings.py" \
  --analysis-dir "$ANALYSIS_DIR" --data-dir "$DATA_DIR"
