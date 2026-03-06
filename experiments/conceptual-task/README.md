# Conceptual Task: Tense Planning Experiment

> **Branch**: [`conceptual-task`](https://github.com/utkuturk/tense-timing/tree/conceptual-task)
> **Live demo**: [PCIbex](https://farm.pcibex.net/r/ZlMqba/)

A PCIbex experiment where participants learn verb-entity pairings, study their tense assignments (past/future), then make speeded tense decisions. The task uses a switch-task paradigm to investigate conceptual tense planning.

## File Overview

| File | Role |
|:-----|:-----|
| `data_includes/main.js` | Experiment entry point: stimuli definitions, counterbalancing, sequence construction, and all non-trial screens (intro, consent, demographics, instructions, debrief) |
| `data_includes/helper_trial.js` | Trial builders: decision trials, practice trials with feedback, and tense-pattern ordering logic |
| `data_includes/helper_block_intro.js` | Block intro builders: verb learning (`introTrial`), tense-pair reveal (`tensePairTrial`), and ready screens |
| `data_includes/helper_break.js` | Between-block break screen |
| `data_includes/helper_misc.js` | Shared CSS constants and small utilities (demographics, validation) |

## Design

**Characters**: Pirate, Chef, Wizard
**Verbs**: 18 experimental (6 per block) + 2 practice (`spin`, `drag`)
**Response keys**: `C = Past`, `M = Future`

### Counterbalancing

- **List** (`a`/`b`/`c`/`d`): determines which 3 verbs per block are past vs. future. Lists `c`/`d` mirror `b`/`a`.
- **Entity rotation** (0/1/2): three meta-blocks rotate which character is paired with each verb, so every verb appears with every character across meta-blocks.
- **Block order**: shuffled (Fisher-Yates) within each meta-block.
- **Tense pattern**: each block uses two fixed 6-trial sequences (e.g., P-F-F-P-P-F and F-P-P-F-F-P); which comes first is randomized per block. Ordering also avoids consecutive same-entity trials when possible.

### Experiment Flow

1. **Intro screens**: welcome, consent, demographics, instructions
2. **Practice**: learn 2 verbs for a random entity, study their tense, then 2 decision trials with feedback
3. **3 meta-blocks x 3 blocks** (9 blocks, 108 decision trials total):
   - *Verb learning*: see each verb's image + hear audio, one at a time
   - *Tense assignment*: grid showing past/future items per entity, revealed one by one with sentence audio
   - *Decision trials*: fixation (500ms) then image appears with Past/Future labels; respond with C/M
4. **Debrief + SONA credit redirect**

### Timing

| Phase | Detail |
|:------|:-------|
| Decision trial | 300ms blank, 500ms fixation, then image + choice labels until response |
| Verb learning | 300ms blank, 500ms fixation, image + audio, 1000ms minimum before Next |
| Tense-pair reveal | Each item revealed with SPACE, sentence audio plays, 1400ms minimum before Next |

### Data Logged

Decision trials: Block, Verb, Form, Tense, Entity, PatternTag, LeftOpt, RightOpt, DecisionRT.
Practice trials: same fields + PracticeCorrect.

## Running

Upload the full directory to a [PCIbex](https://farm.pcibex.net/) project. Assets (audio + images) are preloaded from GitHub raw URLs on the `conceptual-task` and `norming` branches. Verify preloading works before collecting data.
