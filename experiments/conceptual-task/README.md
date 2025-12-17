# Conceptual Task: Tense Planning Experiment

This is a PCIbex (PennController for Internet Based Experiments) study designed to test tense planning dissociations.

## Experiment Overview

**Goal:** Establish that the entropy-manipulation (switch task) works as intended.
**Method:** Participants describe scenes involving simple actions using Past or Future tense.
**Task:** Participants see an image and choose between "Past" and "Future" options.

### Block Structure

The experiment consists of **3 blocks** with **6 trials** each.
Each block contains a mix of **Regular** and **Irregular** verbs (3 of each).

**Tense Pattern:**
Trials within each block follow a fixed, balanced sequence of Past (P) and Future (F) tenses, specifically one of the following patterns (randomized per block):
- `P -> F -> F -> P -> P -> F`
- `F -> P -> P -> F -> F -> P`

This structure ensures that participants must attend to the tense cue on every trial, rather than predicting a single block-wide tense.

### Experiment Sequence

The experiment proceeds through the following phases:

1.  **Introduction Phase**
    *   Welcome & Consent
    *   Demographics (Age, Gender, Language, etc.)
    *   General Instructions

2.  **Practice Phase**
    *   Participants learn practice verbs.
    *   **Recall Test**: Participants must type the base form of the practice verbs.
    *   **Practice Trials**: Participants perform the Past/Future decision task with practice items.

3.  **Part 1: Learning & Decision (Meta Block 1)**
    *   Consists of 3 blocks (randomly ordered).
    *   For each block:
        *   **Block Intro**: Participants view the verbs for the current block.
        *   **Recall Test**: Intro to recall -> Participants type the base form of each verb (randomized) -> Outro.
        *   **Main Task**: Participants perform the Past/Future decision task (Fixed **PFFPPF** pattern).

4.  **Part 2: Decision Only (Meta Block 2)**
    *   Repeats the 3 blocks (in a new random order).
    *   **Main Task Only**: Participants perform the decision task immediately (No intro or recall phases).

5.  **Conclusion**
    *   Result submission.
    *   Exit/Debrief.

## Technical Details

- **Platform**: PCIbex
- **Main Script**: [`data_includes/main.js`](data_includes/main.js)
- **Helper Logic**: [`data_includes/helper_trial.js`](data_includes/helper_trial.js) (Contains `orderItemsByTensePattern`)
- **Resources**: Images and zips are in `chunk_includes/`.
- **Deployment**: This folder is self-contained. Do not remove files if deploying to a PCIbex server.

### Modifications
- To change stimuli, edit the `verbs`, `items`, or `cbSets` in `main.js`.
- The PFFPPF pattern logic is defined in `data_includes/helper_trial.js`.

## Analysis
- **Measures**:
  - **Reaction Time (RT)**: Time to select Past/Future.
  - **Accuracy**: Correct tense selection.

## Verbs & Frequency Matching

The experiment uses a set of Regular and Irregular verbs matched for frequency.

| Freq Bin | Regular | Irregular | Reg Freq (WPM) | Irreg Freq (WPM) |
| :--- | :--- | :--- | :--- | :--- |
| **High** | play | cut | 407.38 | 173.78 |
| **High** | build | | | 109.648 |
| **High** | break | | | 151.356 |
| **High** | eat | | | 134.896 |
| **Medium** | paint | ride | 33.113 | 70.795 |
| **Medium** | kick | drink | 52.481 | 79.433 |
| **Medium** | wash | throw | 28.840 | 67.608 |
| **Medium** | push | | 66.069 | |
| **Medium** | smell | | 30.903 | |
| **Low** | stir | sweep | 9.120 | 9.333 |
| **Low** | climb | dig | 16.596 | 16.596 |
| **Low** | peel | | 6.310 | |

*Frequencies are calculated using `wordfreq` (zipf to wpm conversion).*
Detailed analysis available in: `analysis/regular_irregular_freqmatch.ipynb` <a target="_blank" href="https://colab.research.google.com/github/utkuturk/tense-timing/blob/main/analysis/regular_irregular_freqmatch.ipynb"><img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab"/></a>

