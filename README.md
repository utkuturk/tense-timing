# Tense Planning Project

This project investigates the dissociation between syntactic planning (tense feature/diacritic selection) and phonological planning (morph realization) in language production.


## Project Structure

- **`experiments/`**: Source code and materials for psycholinguistic experiments.
  - [`norming/`](experiments/norming/): Norming experiment for stimulus validation. Branch: [`norming`](https://github.com/utkuturk/tense-timing/tree/norming). [Live demo](https://farm.pcibex.net/p/qHbGqX/)
  - [`conceptual-task/`](experiments/conceptual-task/): A non-linguistic decision task. Participants are being thought which event happens when and asked to remember. The trials are ordered in a way that the previous trial is either a prime or not a prime. (PCIbex). Branch: [`conceptual-task`](https://github.com/utkuturk/tense-timing/tree/conceptual-task). [Live demo](https://farm.pcibex.net/r/ZlMqba/)
  - [`morphosyntax/`](experiments/morphosyntax/): A production version of the conceptual task. Intead of the non-linguistic task, participants are asked to produce sentences according to the time and the event taught to them. Branch: [`morphosyntax`](https://github.com/utkuturk/tense-timing/tree/morphosyntax)
  - [`morphophonology/`](experiments/morphophonology/): A version of the morphosyntax experiment, where all participants where asked to produce sentences in past tense. But now the priming is done according to past tense form regularity.  Branch: [`morphophonology`](https://github.com/utkuturk/tense-timing/tree/morphophonology)
- **`analysis/`**: Analysis source, figures and the rendered report. Model fits and the
  MFA working tree are generated locally and left untracked.
  - [`analysis.qmd`](analysis/analysis.qmd): main Quarto analysis; renders to `analysis.pdf`.
  - `fig_output/`: figures produced by `analysis.qmd`.
  - `scripts/`: recording preparation, transcription and forced alignment
    (`prepare_recordings.sh` → `transcribe_to_lab.py` → `run_mfa.sh`).
  - `mfa/`: forced-alignment working tree (`corpus/`, `aligned/`, `runs/`, `state/`), untracked.
  - `notebooks/`:
    - `regular_irregular_freqmatch.ipynb` <a target="_blank" href="https://colab.research.google.com/github/utkuturk/tense-timing/blob/main/analysis/notebooks/regular_irregular_freqmatch.ipynb"><img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab"/></a>
    - `experiment_materials_generator.ipynb` <a target="_blank" href="https://colab.research.google.com/github/utkuturk/tense-timing/blob/main/analysis/notebooks/experiment_materials_generator.ipynb"><img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab"/></a>
- **`stimuli/`**: Image generation and selection pipeline for the experiment materials,
  with the resulting scores and the selected image set. Run the scripts from the repository
  root. See [`stimuli/README.md`](stimuli/README.md).
- **`data/`**: Derived participant tables (`*_june6.csv`) and verb frequency norms. Raw
  per-participant archives and audio recordings live in `data/phon/` and `data/syn/` and
  are untracked.
- **`docs/`**: Research notes and meeting minutes ([`notes/`](docs/notes/), including
  [`exp_details.md`](docs/notes/exp_details.md)), and slides and posters
  ([`presentations/`](docs/presentations/)).

## Experiments and their branches

Each experiment lives in two places: as `experiments/<name>/` here on `main`, and
as the root of a standalone branch `<name>`. The branches exist because PCIbex
fetches assets at runtime from
`raw.githubusercontent.com/utkuturk/tense-timing/<branch>/chunk_includes/...`.

**`main` is the source of truth.** Edit `experiments/<name>/` on `main`; the
branch is derived from it. Pushing a change under `experiments/` to `main` fires
`.github/workflows/sync-experiment-branches.yml`, which adds a commit to each
affected branch making its tree match `main` and pushes it. Nothing is rewritten
or force-pushed, and unaffected branches are left alone.

To do the same by hand, or to check what would change:

```
experiments/sync-to-branches.sh            # update local branches only
experiments/sync-to-branches.sh --push     # and push them
```

It is idempotent, so running it when everything already matches does nothing.

A consequence worth knowing: a commit made directly on an experiment branch stays
in that branch's history, but its *content* is superseded the next time `main`
syncs. Make the edit on `main` instead.

The SONA credit links in each `data_includes/main.js` ship as
`experiment_id=XX&credit_token=XX`. Fill in the real values from the SONA
researcher dashboard when deploying to PCIbex; they are not kept in this
repository.

## Running the pipeline

All scripts take repository-root-relative paths and expect to be run from the
repository root:

```
uv run analysis/scripts/prepare_recordings.sh      # zips -> analysis/mfa/corpus/
uv run python analysis/scripts/transcribe_to_lab.py  # .wav -> .lab transcripts
bash analysis/scripts/run_mfa.sh                   # -> analysis/mfa/aligned/
quarto render analysis/analysis.qmd                # -> analysis.pdf, fig_output/
```

## Research Goals

1. **Overall Goal**: Test dissociation between syntactic and phonological planning.

## Conceptual Task

Participants learn action verbs for characters (Chef, Pirate, Wizard), study tense assignments (past/future), then make speeded tense decisions via key press (`C = Past`, `M = Future`). The task includes a practice phase followed by 3 meta-blocks (9 blocks total, 108 decision trials). See the [experiment README](experiments/conceptual-task/README.md) for full details.

###  Experiment Structure

Each meta-block has 3 blocks of 6 verbs, and each block is organized by tense assignment: 3 **Past** and 3 **Future** items (counterbalanced by list). Block order is shuffled within each meta-block; entity-verb pairings rotate across meta-blocks.

Tense-order patterns used within blocks:

- Raw patterns:
  - `F P P F F P`
  - `P F F P P F`
- Annotated with boundary and priming status:
  - `F<sub>b</sub> P<sub>u</sub> P<sub>p</sub> F<sub>u</sub> F<sub>p</sub> P<sub>e</sub>`
  - `P<sub>b</sub> F<sub>u</sub> F<sub>p</sub> P<sub>u</sub> P<sub>p</sub> F<sub>e</sub>`

Legend: `b = beginning`, `e = end`, `p = primed` (same tense as previous trial), `u = unprimed` (switch from previous trial).

<details>
<summary><b>Block 1 verbs</b></summary>

| Verb | Tense role | Object |
|:-----|:-----------|:-------|
| drink | Past/Future (counterbalanced) | coffee |
| read | Past/Future (counterbalanced) | a book |
| eat | Past/Future (counterbalanced) | an apple |
| paint | Past/Future (counterbalanced) | a canvas |
| wash | Past/Future (counterbalanced) | a dish |
| push | Past/Future (counterbalanced) | a cart |

</details>

<details>
<summary><b>Block 2 verbs</b></summary>

| Verb | Tense role | Object |
|:-----|:-----------|:-------|
| build | Past/Future (counterbalanced) | a tower |
| sweep | Past/Future (counterbalanced) | the floor |
| ride | Past/Future (counterbalanced) | a bicycle |
| climb | Past/Future (counterbalanced) | a ladder |
| stir | Past/Future (counterbalanced) | a pot |
| peel | Past/Future (counterbalanced) | a banana |

</details>

<details>
<summary><b>Block 3 verbs</b></summary>

| Verb | Tense role | Object |
|:-----|:-----------|:-------|
| blow | Past/Future (counterbalanced) | bubbles |
| dig | Past/Future (counterbalanced) | a hole |
| shake | Past/Future (counterbalanced) | a bottle |
| carry | Past/Future (counterbalanced) | a box |
| play | Past/Future (counterbalanced) | the guitar |
| smell | Past/Future (counterbalanced) | a flower |

</details>

<details>
<summary><b>Sample stimuli images (one per character)</b></summary>

| Character | Example |
|:----------|:--------|
| Chef | <img src="experiments/conceptual-task/chunk_includes/chef_drink_coffee_v1.png" alt="chef drink coffee" width="120"> <img src="experiments/conceptual-task/chunk_includes/chef_paint_canvas_v3.png" alt="chef paint canvas" width="120"> <img src="experiments/conceptual-task/chunk_includes/chef_read_book_v2.png" alt="chef read book" width="120"> |
| Pirate | <img src="experiments/conceptual-task/chunk_includes/pirate_drink_coffee_v2.png" alt="pirate drink coffee" width="120"> <img src="experiments/conceptual-task/chunk_includes/pirate_paint_canvas_v2.png" alt="pirate paint canvas" width="120"> <img src="experiments/conceptual-task/chunk_includes/pirate_read_book_v2.png" alt="pirate read book" width="120"> |
| Wizard | <img src="experiments/conceptual-task/chunk_includes/wizard_drink_coffee_v5.png" alt="wizard drink coffee" width="120"> <img src="experiments/conceptual-task/chunk_includes/wizard_paint_canvas_v2.png" alt="wizard paint canvas" width="120"> <img src="experiments/conceptual-task/chunk_includes/wizard_read_book_v2.png" alt="wizard read book" width="120"> |

</details>


## Morphosyntax

The morphosyntax experiment is a spoken-production adaptation of the conceptual task.
Participants still learn event-time mappings (Past vs Future), but instead of keypress decisions they produce canonical sentences aloud (e.g., `The Pirate will spin a top.` / `The Pirate spun a top.`).
The tense sequencing logic remains tied to the conceptual-task-style P/F ordering and prime structure.

###  Experiment Structure

- Core unit: 3 meta-blocks x 3 blocks
- Per block: verb learning, tense mapping, then spoken production trials
- Ordering: Past/Future patterning with primed vs unprimed transitions inherited from the conceptual design

## Morphophonology

Morphophonology is a past-only spoken-production variant.
Participants always produce past tense, and trial ordering is manipulated by **regular vs irregular** past-tense morphology rather than Past/Future conceptual assignment.

###  Experiment Structure

- Core unit: 3 meta-blocks x 3 blocks
- Per block: verb learning and spoken production
- Ordering patterns: `I R R I I R` and `R I I R R I`
- Priming is defined by morphological regularity repetition/switch
