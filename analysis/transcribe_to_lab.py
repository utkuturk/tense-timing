#!/usr/bin/env python3
"""
Transcribe wavs to .lab files using either:
  --backend google      Google Cloud Speech-to-Text v2, Chirp 3, inline audio
  --backend assemblyai  AssemblyAI, universal model

Both run up to 5 requests concurrently and use a pickle cache to skip re-runs.
Skips: rando_* speaker folders, non-resp_ files, files that already have a .lab.

Usage (run from the project root; assemblyai is the default backend):
  uv run python analysis/transcribe_to_lab.py
  uv run python analysis/transcribe_to_lab.py --backend google --project-id speech-492821
"""

import argparse
import logging
import os
import pickle
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

os.environ.setdefault("GRPC_VERBOSITY", "ERROR")
os.environ.setdefault("GRPC_TRACE", "")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(message)s",
    handlers=[
        logging.FileHandler(f"transcription_{time.strftime('%Y%m%d_%H%M%S')}.log"),
        logging.StreamHandler(),
    ],
)
log = logging.getLogger(__name__)
logging.getLogger("google.auth").setLevel(logging.WARNING)
logging.getLogger("google.api_core").setLevel(logging.WARNING)
logging.getLogger("urllib3").setLevel(logging.WARNING)
logging.getLogger("httpx").setLevel(logging.WARNING)
logging.getLogger("httpcore").setLevel(logging.WARNING)

BATCH_SIZE = 5

# Verb forms shared across backends
_VERBS    = ["blow","build","carry","climb","dig","drag","drink","eat","paint",
             "peel","play","push","read","ride","shake","smell","spin","stir","sweep","wash"]
_PAST     = ["blew","built","carried","climbed","dug","dragged","drank","ate",
             "painted","peeled","played","pushed","rode","shook","smelled","smelt",
             "spun","stirred","swept","washed"]
_FUTURE   = [f"will {v}" for v in _VERBS]
_ENTITIES = ["the pirate","the chef","the wizard"]
PHRASES   = _VERBS + _PAST + _FUTURE + _ENTITIES + ["she","he","they","a","an"]


# ── Google backend ────────────────────────────────────────────────────────────

def _google_transcribe_one(wav: Path, project_id: str, total: int, idx: int) -> tuple[str, str]:
    from google.api_core.client_options import ClientOptions
    from google.cloud.speech_v2 import SpeechClient
    from google.cloud.speech_v2.types import cloud_speech

    try:
        log.info(f"[{idx}/{total}] {wav.parent.name}/{wav.name}")
        client = SpeechClient(
            client_options=ClientOptions(api_endpoint="us-speech.googleapis.com")
        )
        config = cloud_speech.RecognitionConfig(
            explicit_decoding_config=cloud_speech.ExplicitDecodingConfig(
                encoding=cloud_speech.ExplicitDecodingConfig.AudioEncoding.LINEAR16,
                sample_rate_hertz=16000,
                audio_channel_count=1,
            ),
            language_codes=["en-US"],
            model="chirp_3",
        )
        request = cloud_speech.RecognizeRequest(
            recognizer=f"projects/{project_id}/locations/us/recognizers/_",
            config=config,
            content=wav.read_bytes(),
        )
        response = client.recognize(request=request)
        transcript = " ".join(
            result.alternatives[0].transcript
            for result in response.results
            if result.alternatives
        ).strip()
        log.info(f"  → {wav.name}: {transcript!r}")
        return str(wav), transcript
    except Exception as e:
        log.error(f"  failed ({wav.name}): {e}")
        return str(wav), "ERROR"


def transcribe_google(wav_paths: list[Path], project_id: str) -> dict[str, str]:
    if not project_id:
        raise ValueError("--project-id required for google backend")
    results = {}
    total = len(wav_paths)
    with ThreadPoolExecutor(max_workers=BATCH_SIZE) as pool:
        futures = {
            pool.submit(_google_transcribe_one, wav, project_id, total, i): wav
            for i, wav in enumerate(wav_paths, 1)
        }
        for future in as_completed(futures):
            key, value = future.result()
            results[key] = value
    return results


# ── AssemblyAI backend ────────────────────────────────────────────────────────

def _assemblyai_transcribe_one(wav: Path, transcriber, total: int, idx: int) -> tuple[str, str]:
    try:
        log.info(f"[{idx}/{total}] {wav.parent.name}/{wav.name}")
        t = transcriber.transcribe(str(wav))
        if t.error:
            log.error(f"  error ({wav.name}): {t.error}")
            return str(wav), "NOT_RECOGNIZED"
        log.info(f"  → {wav.name}: {t.text!r}")
        return str(wav), t.text or ""
    except Exception as e:
        log.error(f"  failed ({wav.name}): {e}")
        return str(wav), "ERROR"


def transcribe_assemblyai(wav_paths: list[Path], api_key: str) -> dict[str, str]:
    import assemblyai as aai
    if not api_key:
        raise ValueError("API key required for assemblyai backend")
    aai.settings.api_key = api_key
    config = aai.TranscriptionConfig(
        punctuate=False,
        format_text=False,
        speech_model=aai.SpeechModel.universal,
        language_code="en",
        word_boost=PHRASES,
        boost_param="high",
    )
    transcriber = aai.Transcriber(config=config)
    results = {}
    total = len(wav_paths)
    with ThreadPoolExecutor(max_workers=BATCH_SIZE) as pool:
        futures = {
            pool.submit(_assemblyai_transcribe_one, wav, transcriber, total, i): wav
            for i, wav in enumerate(wav_paths, 1)
        }
        for future in as_completed(futures):
            key, value = future.result()
            results[key] = value
    return results


# ── Cache helpers ─────────────────────────────────────────────────────────────

def load_cache(path: Path) -> dict:
    try:
        with open(path, "rb") as f:
            return pickle.load(f)
    except FileNotFoundError:
        return {}


def save_cache(path: Path, data: dict):
    with open(path, "wb") as f:
        pickle.dump(data, f)


# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--backend", choices=["google", "assemblyai"], default="assemblyai")
    parser.add_argument("--corpus-root", default="analysis/mfa_corpus")
    parser.add_argument("--cache", default="analysis/transcription_cache.pkl")
    parser.add_argument("--no-cache", action="store_true")
    # Google options
    parser.add_argument("--project-id", default=os.getenv("GOOGLE_CLOUD_PROJECT", ""))
    # AssemblyAI options
    parser.add_argument("--token-file", default="token")
    parser.add_argument("--api-key", default=None)
    args = parser.parse_args()

    corpus_root = Path(args.corpus_root)
    if not corpus_root.exists():
        log.error(f"Corpus root not found: {corpus_root}")
        return 1

    cache_path = Path(args.cache)
    cache = {} if args.no_cache else load_cache(cache_path)
    log.info(f"Backend: {args.backend} | Cache: {len(cache)} entries")

    all_wavs = [
        w for w in sorted(corpus_root.rglob("*.wav"))
        if not w.parent.name.startswith("rando_")
        and w.name.startswith("resp_")
    ]
    to_transcribe = [
        w for w in all_wavs
        if not w.with_suffix(".lab").exists() and str(w) not in cache
    ]
    log.info(f"{len(all_wavs)} total wavs, {len(to_transcribe)} need transcription")

    if to_transcribe:
        if args.backend == "google":
            new = transcribe_google(to_transcribe, args.project_id)
        else:
            api_key = args.api_key
            if not api_key:
                token_path = Path(args.token_file)
                if token_path.exists():
                    api_key = token_path.read_text().strip()
            if not api_key:
                api_key = os.getenv("ASSEMBLYAI_API_KEY", "")
            new = transcribe_assemblyai(to_transcribe, api_key)
        cache.update(new)
        save_cache(cache_path, cache)

    written = 0
    for wav in all_wavs:
        lab = wav.with_suffix(".lab")
        if lab.exists():
            continue
        raw = cache.get(str(wav), "")
        text = raw.strip().lower() if raw not in ("ERROR", "NOT_RECOGNIZED", "") else "sil"
        lab.write_text(text + "\n")
        written += 1

    log.info(f"Done. Wrote {written} .lab files.")
    return 0


if __name__ == "__main__":
    exit(main())
