# Tense Planning Project

This project investigates the dissociation between syntactic planning (tense feature/diacritic selection) and phonological planning (morph realization) in language production.

## Project Structure

- **`experiments/`**: Source code and materials for psycholinguistic experiments.
  - [`conceptual-task/`](experiments/conceptual-task/) — Switch-task tense decision experiment (PCIbex). Branch: [`conceptual-task`](https://github.com/utkuturk/tense-timing/tree/conceptual-task). [Live demo](https://farm.pcibex.net/r/ZlMqba/)
  - [`norming/`](experiments/norming/) — Norming experiment for stimulus validation. Branch: [`norming`](https://github.com/utkuturk/tense-timing/tree/norming). [Live demo](https://farm.pcibex.net/p/qHbGqX/)
  - `morphophonology/` — (Planned) Phonological planning experiment. Branch: [`morphophonology`](https://github.com/utkuturk/tense-timing/tree/morphophonology)
  - `morphosyntax/` — (Planned) Syntactic planning experiment. Branch: [`morphosyntax`](https://github.com/utkuturk/tense-timing/tree/morphosyntax)
- **`analysis/`**: Scripts and notebooks for data analysis and stimulus generation.
  - `regular_irregular_freqmatch.ipynb` <a target="_blank" href="https://colab.research.google.com/github/utkuturk/tense-timing/blob/main/analysis/regular_irregular_freqmatch.ipynb"><img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab"/></a>
  - `experiment_materials_generator.ipynb` <a target="_blank" href="https://colab.research.google.com/github/utkuturk/tense-timing/blob/main/analysis/experiment_materials_generator.ipynb"><img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab"/></a>
- **`presentations/`**: Slides and posters for conferences and talks.
- **`paper/`**: Manuscripts, drafts, and figures for publication.
- **`notes/`**: Research notes, meeting minutes, and literature reviews.

## Research Goals

1. **Overall Goal**: Test dissociation between syntactic and phonological planning.
2. **Current Focus**: Establish that the entropy-manipulation (switch task) works as intended using the `conceptual-task`.

## Conceptual Task (Quick Summary)

Participants learn action verbs for characters (Chef, Pirate, Wizard), study tense assignments (past/future), then make speeded tense decisions via key press (`C = Past`, `M = Future`). The task includes a practice phase followed by 3 meta-blocks (9 blocks total, 108 decision trials). See the [experiment README](experiments/conceptual-task/README.md) for full details.

## Experiment Structure

Each meta-block has 3 blocks of 6 verbs (3 irregular, 3 regular). Block order is shuffled within each meta-block; entity-verb pairings rotate across meta-blocks.

<details>
<summary><b>Block 1 verbs</b></summary>

| Verb | Type | Object |
|:-----|:-----|:-------|
| drink | Irregular | coffee |
| read | Irregular | a book |
| eat | Irregular | an apple |
| paint | Regular | a canvas |
| wash | Regular | a dish |
| push | Regular | a cart |

</details>

<details>
<summary><b>Block 2 verbs</b></summary>

| Verb | Type | Object |
|:-----|:-----|:-------|
| build | Irregular | a tower |
| sweep | Irregular | the floor |
| ride | Irregular | a bicycle |
| climb | Regular | a ladder |
| stir | Regular | a pot |
| peel | Regular | a banana |

</details>

<details>
<summary><b>Block 3 verbs</b></summary>

| Verb | Type | Object |
|:-----|:-----|:-------|
| blow | Irregular | bubbles |
| dig | Irregular | a hole |
| shake | Irregular | a bottle |
| carry | Regular | a box |
| play | Regular | the guitar |
| smell | Regular | a flower |

</details>

<details>
<summary><b>Sample stimuli images (one per character)</b></summary>

| Character | Example |
|:----------|:--------|
| Chef | <img src="experiments/conceptual-task/chunk_includes/chef_drink_coffee_v1.png" alt="chef drink coffee" width="120"> <img src="experiments/conceptual-task/chunk_includes/chef_paint_canvas_v3.png" alt="chef paint canvas" width="120"> <img src="experiments/conceptual-task/chunk_includes/chef_read_book_v2.png" alt="chef read book" width="120"> |
| Pirate | <img src="experiments/conceptual-task/chunk_includes/pirate_drink_coffee_v2.png" alt="pirate drink coffee" width="120"> <img src="experiments/conceptual-task/chunk_includes/pirate_paint_canvas_v2.png" alt="pirate paint canvas" width="120"> <img src="experiments/conceptual-task/chunk_includes/pirate_read_book_v2.png" alt="pirate read book" width="120"> |
| Wizard | <img src="experiments/conceptual-task/chunk_includes/wizard_drink_coffee_v5.png" alt="wizard drink coffee" width="120"> <img src="experiments/conceptual-task/chunk_includes/wizard_paint_canvas_v2.png" alt="wizard paint canvas" width="120"> <img src="experiments/conceptual-task/chunk_includes/wizard_read_book_v2.png" alt="wizard read book" width="120"> |

</details>
