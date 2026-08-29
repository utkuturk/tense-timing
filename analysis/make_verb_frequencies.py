#!/usr/bin/env python3
"""Write Zipf frequencies for the 20 experimental verbs to data/verb_frequencies.csv.

Two forms per verb: the bare lemma (produced in future trials, "will push") and
the past form (produced in past trials, "pushed"). Zipf is log10 of frequency per
billion words, so it is already on a log scale and is used as-is as a predictor.

Supersedes run_freq_match.py, whose verb list predates the current materials.
"""
import csv
from pathlib import Path
from wordfreq import zipf_frequency

PAST = {"blow": "blew", "build": "built", "carry": "carried", "climb": "climbed",
        "dig": "dug", "drag": "dragged", "drink": "drank", "eat": "ate",
        "paint": "painted", "peel": "peeled", "play": "played", "push": "pushed",
        "read": "read", "ride": "rode", "shake": "shook", "smell": "smelled",
        "spin": "spun", "stir": "stirred", "sweep": "swept", "wash": "washed"}

IRREGULAR = {"blow", "build", "dig", "drink", "eat",
             "read", "ride", "shake", "spin", "sweep"}

out = Path("data/verb_frequencies.csv")
with out.open("w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["verb", "regularity", "past_form", "zipf_lemma", "zipf_past"])
    for verb, past in sorted(PAST.items()):
        w.writerow([verb,
                    "IRREGULAR" if verb in IRREGULAR else "REGULAR",
                    past,
                    round(zipf_frequency(verb, "en"), 3),
                    round(zipf_frequency(past, "en"), 3)])
print(f"wrote {out}")
