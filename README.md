# Tense Timing: Morphophonological Production (Regular vs Irregular)

This repository contains a PCIbex/PennController spoken-production experiment.
This README reflects the current implementation in `data_includes/`.

## Implementation Snapshot

- Platform: PCIbex + PennController
- Main entry: `data_includes/main.js`
- Helpers:
  - `data_includes/helper_block_intro.js`
  - `data_includes/helper_trial.js`
  - `data_includes/helper_break.js`
  - `data_includes/helper_misc.js`
- Response mode: spoken production with automatic recording windows
- Recording backend: `InitiateRecorder` + S3 recorder lambda
- Upload mode: asynchronous checkpoints via `UploadRecordings("async", "noblock")`

## Assets

At runtime, `main.js` preloads zips from:

- `https://raw.githubusercontent.com/utkuturk/tense-timing/morphosyntax/chunk_includes/elevenlabs_audio.zip`
- `https://raw.githubusercontent.com/utkuturk/tense-timing/morphosyntax/chunk_includes/pictures.zip`

## Stimuli

Entities:

- `Pirate`, `Chef`, `Wizard`

Main verbs (18 total; 6 per block):

- Block 1: `drink, read, eat, paint, wash, push`
- Block 2: `build, sweep, ride, climb, stir, peel`
- Block 3: `blow, dig, shake, carry, play, smell`

Practice verbs:

- `spin`, `drag` (both produced in past tense)

Regularity grouping in the active design:

- Irregular set: `blow, build, dig, drink, eat, read, ride, shake, spin, sweep`
- Regular set: all remaining verbs
- Each main block is constructed to contain exactly 3 irregular + 3 regular verbs

## Cue/Response Design

- Production is **past tense only**.
- Participants produce canonical past forms (e.g., `The Pirate spun a top.`).
- Item metadata still includes conceptual labels in past form:
  - `The Pirate's spinning a top is in the past.`

Note: tense-learning trials are not in the active sequence.

## Randomization and Ordering

### Entity rotation

- 3 meta-rotations: `0, 1, 2`
- Rotates entity assignment to verbs across meta-blocks.

### Block order

- Within each meta-block, the 3 blocks are shuffled (Fisher-Yates).

### Regularity-pattern order

Each block is presented twice (12 production trials total), once with each fixed regularity pattern:

- Pattern 1: `I R R I I R`
- Pattern 2: `R I I R R I`

Pattern order is randomized per block, and ordering tries to avoid immediate same-entity repetition.

## Experiment Flow

Global sequence:

`Sequence(...introBlock, "check", ...metaSequences.flat(), "time_summary", "send_results", "debrief", "senddebrief", "exit_sona")`

### Intro block

1. `intro`
2. `consent`
3. `demo`
4. `init`
5. `recording_test`
6. `instructions`
7. `practice_intro`
8. `intro_practice` (verb learning only)
9. `ready_practice`
10. 2 practice production trials
11. `async` (non-blocking upload checkpoint)
12. `exp_ready`

### Main task

- 3 meta-blocks (`m1`, `m2`, `m3`)
- each meta-block has 3 shuffled blocks
- breaks between blocks and before meta-blocks 2/3

Per main block:

1. `intro_<block>` (verb learning)
2. `ready_<block>`
3. 12 production trials (6 items x 2 regularity patterns)
4. `async` upload checkpoint

Totals per participant:

- 9 main blocks
- 108 main production trials
- 2 practice production trials

## Trial Timing

### Verb learning (`introTrial`)

- White screen: `300 ms`
- Fixation: `500 ms`
- Verb audio: `tts_verb_<verb>.mp3`
- Post-audio minimum gate: `1000 ms`

### Production (`trial`, `practiceDecisionTrial`)

- White screen: `300 ms`
- Fixation: `500 ms`
- Picture onset:
  - click sound
  - automatic recording start
- Recording window: `4500 ms` (`AUTO_RECORD_MS`)
- Recording auto-stops, then participant continues

## Data Logging

Header/global:

- SONA ID URL parameter
- `source` URL parameter
- experiment start timestamp

Production logs include:

- `Block`, `Verb`, `Form`, `Tense`, `Regularity`, `Entity`
- `EventPhrase`
- `TargetLabelSentence`
- `TargetCanonicalSentence`
- `PatternTag`
- `ResponseMode`
- `AutoRecordMS`
- `ProductionRT`

Debrief logs:

- technical issues
- instruction clarity
- free-text feedback

Time summary logs:

- start/end timestamps
- elapsed ms/min

## ElevenLabs Build

Script:

- `scripts/build_elevenlabs_audio.js`

Outputs:

- `chunk_includes/elevenlabs_audio/manifest.json`
- `chunk_includes/elevenlabs_audio/texts.tsv`
- `chunk_includes/elevenlabs_audio.zip`

Generate/overwrite:

```bash
FORCE_REGEN=1 ELEVENLABS_API_KEY=... node scripts/build_elevenlabs_audio.js
```

## Quick Validation

```bash
node --check data_includes/main.js
node --check data_includes/helper_block_intro.js
node --check data_includes/helper_trial.js
node --check data_includes/helper_break.js
node --check scripts/build_elevenlabs_audio.js
```

## Notes

- `tenseIntroTrial`/`tensePairTrial` builders still exist in `helper_block_intro.js` as legacy helpers but are not used in the active sequence.
- `helper_trial.js` still includes recall-typing helpers not used in the active sequence.
