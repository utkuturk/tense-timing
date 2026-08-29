#!/usr/bin/env python3
"""
Parse PCIbex results CSVs to map session UUIDs → SONA IDs,
then unzip and convert all phon + syntax recordings into an MFA corpus layout:

  mfa_corpus/phon/<sona_id>/<file>.wav
  mfa_corpus/syntax/<sona_id>/<file>.wav
  mfa_corpus/phon/rando_<n>/<file>.wav   (no matching SONA ID)
  mfa_corpus/syntax/rando_<n>/<file>.wav

Usage:
    python3 prepare_recordings.py [--analysis-dir DIR]
"""

import argparse
import subprocess
import tempfile
import zipfile
from pathlib import Path


def parse_pcibex_csv(csv_path: Path) -> dict[str, str]:
    """Return {session_uuid: sona_id} from UploadRecordings Filename rows."""
    mapping = {}
    with open(csv_path, encoding="utf-8", errors="replace") as f:
        for line in f:
            line = line.strip()
            if line.startswith("#") or not line:
                continue
            cols = line.split(",")
            # Need at least 18 columns and match UploadRecordings/Filename
            if len(cols) < 18:
                continue
            penn_element_name = cols[8]
            parameter = cols[9]
            if penn_element_name != "UploadRecordings" or parameter != "Filename":
                continue
            value = cols[10]           # e.g. "cd8b40ea-....zip"
            sona_id = cols[17].strip() # SONA_ID_URL column
            session_uuid = value.removesuffix(".zip")
            if session_uuid and sona_id:
                mapping[session_uuid] = sona_id
    return mapping


def session_uuid_from_zip(zip_path: Path) -> str:
    """Extract the session UUID (second UUID) from zip filename.

    Zip names are: morphophon_{upload_uuid}_{session_uuid}.zip
    The session_uuid is the part after the last underscore (before .zip).
    """
    stem = zip_path.stem  # e.g. morphophon_UUID1_UUID2
    return stem.rsplit("_", maxsplit=1)[-1]


EBML_MAGIC = bytes.fromhex("1a45dfa3")


def is_valid_webm(webm_path: Path) -> bool:
    """True if the file starts with an EBML header.

    Some sessions uploaded 5-byte stubs instead of real recordings; ffmpeg
    fails on those with "EBML header parsing failed".
    """
    with open(webm_path, "rb") as f:
        return f.read(4) == EBML_MAGIC


def convert_webm_to_wav(webm_path: Path, wav_path: Path) -> bool:
    """Convert to 16 kHz mono wav. Returns False if ffmpeg rejected the input."""
    result = subprocess.run(
        ["ffmpeg", "-y", "-loglevel", "error",
         "-i", str(webm_path),
         "-ar", "16000", "-ac", "1",
         str(wav_path)],
        capture_output=True,
    )
    if result.returncode != 0:
        wav_path.unlink(missing_ok=True)
        return False
    return True


def process_experiment(
    zip_dir: Path,
    corpus_dir: Path,
    uuid_to_sona: dict[str, str],
    exp_prefix: str,
):
    """Unzip and convert all zips in zip_dir into corpus_dir/<sona_id>/."""
    corpus_dir.mkdir(parents=True, exist_ok=True)
    rando_counter = 1
    converted = 0
    skipped = 0
    corrupt: dict[str, int] = {}

    # Keep stable rando mapping across zips (zip_path → rando folder)
    rando_map: dict[str, str] = {}

    for zip_path in sorted(zip_dir.glob(f"{exp_prefix}_*.zip")):
        session_uuid = session_uuid_from_zip(zip_path)
        sona_id = uuid_to_sona.get(session_uuid)

        if sona_id:
            speaker_dir = corpus_dir / sona_id
        else:
            # Assign a stable rando folder per zip
            if str(zip_path) not in rando_map:
                rando_map[str(zip_path)] = f"rando_{rando_counter}"
                rando_counter += 1
            speaker_dir = corpus_dir / rando_map[str(zip_path)]

        speaker_dir.mkdir(parents=True, exist_ok=True)

        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            with zipfile.ZipFile(zip_path) as zf:
                zf.extractall(tmp_path)

            for webm in sorted(tmp_path.glob("*.webm")):
                wav_out = speaker_dir / webm.with_suffix(".wav").name
                if wav_out.exists():
                    skipped += 1
                    continue
                if not is_valid_webm(webm) or not convert_webm_to_wav(webm, wav_out):
                    corrupt[speaker_dir.name] = corrupt.get(speaker_dir.name, 0) + 1
                    continue
                converted += 1

    # Speakers whose recordings were all corrupt leave an empty folder behind
    empty = [d for d in corpus_dir.iterdir() if d.is_dir() and not any(d.iterdir())]
    for d in empty:
        d.rmdir()

    print(
        f"  {exp_prefix}: converted={converted} skipped={skipped} "
        f"corrupt={sum(corrupt.values())} rando_folders={len(rando_map)}"
    )
    if corrupt:
        named = {k: v for k, v in corrupt.items() if not k.startswith("rando_")}
        n_rando = sum(v for k, v in corrupt.items() if k.startswith("rando_"))
        if named:
            print(f"    corrupt by speaker: {dict(sorted(named.items()))}")
        if n_rando:
            print(f"    corrupt in rando_* folders: {n_rando}")
    if empty:
        print(f"    removed {len(empty)} empty speaker folders: {[d.name for d in empty]}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--analysis-dir",
        default="analysis",
        help="Path to the analysis/ directory (default: analysis)",
    )
    parser.add_argument(
        "--data-dir",
        default="data",
        help="Path to the data/ directory holding the CSVs and zip folders (default: data)",
    )
    parser.add_argument("--phon-csv", default="phon_june6.csv", help="PCIbex CSV inside --data-dir")
    parser.add_argument("--syn-csv", default="syn_june6.csv", help="PCIbex CSV inside --data-dir")
    args = parser.parse_args()

    analysis = Path(args.analysis_dir).resolve()
    data_dir = Path(args.data_dir).resolve()
    corpus_root = analysis / "mfa_corpus"

    phon_csv = data_dir / args.phon_csv
    syn_csv = data_dir / args.syn_csv

    print("Parsing PCIbex CSVs...")
    phon_mapping = parse_pcibex_csv(phon_csv) if phon_csv.exists() else {}
    syn_mapping = parse_pcibex_csv(syn_csv) if syn_csv.exists() else {}
    print(f"  phon: {len(phon_mapping)} session UUIDs across {len(set(phon_mapping.values()))} SONA IDs")
    print(f"  syntax: {len(syn_mapping)} session UUIDs across {len(set(syn_mapping.values()))} SONA IDs")

    print("\nProcessing phon recordings...")
    process_experiment(
        zip_dir=data_dir / "phon",
        corpus_dir=corpus_root / "phon",
        uuid_to_sona=phon_mapping,
        exp_prefix="morphophon",
    )

    print("\nProcessing syntax recordings...")
    process_experiment(
        zip_dir=data_dir / "syn",
        corpus_dir=corpus_root / "syntax",
        uuid_to_sona=syn_mapping,
        exp_prefix="morphosyntax",
    )

    print(f"\nCorpus ready at: {corpus_root}")


if __name__ == "__main__":
    main()
