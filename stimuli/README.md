# Stimulus Construction

Pipeline that produced the picture set used in `experiments/`. Every script takes
repository-root-relative paths, so run them from the repository root:

```
uv pip install -r stimuli/requirements.txt
python stimuli/<script>.py --help
```

## Pipeline

| Stage | Script | Output |
|:--|:--|:--|
| 1. Generate candidate images per character-verb pair | `generate_new_verbs.py` | `experiments/conceptual-task/chunk_includes/` |
| 2. Score temporal neutrality (Gemini vision) | `evaluate_images.py` | `image_evaluations.json` |
| 3. Score verb clarity (CLIP) | `clip_verb_clarity.py` | `clip_verb_scores.json` |
| 4. Combine scores and pick one image per pair | `select_best_images.py` | `selected_images/`, `combined_selection_report.csv` |
| 5. Split the picture archive into loadable chunks | `split_images.py` | zip parts under `chunk_includes/` |

Stages 1-3 call external APIs and need credentials in the repository-root `token`
file, which is untracked.

## Selection criteria

Images must read equally well under a past and a future description of the same
event ("The chef ate an apple" / "The chef will eat an apple"), so candidates are
penalised for completion cues, motion lines, and any depicted result state.
`combined_selection_report.csv` records the per-image scores behind each choice.
