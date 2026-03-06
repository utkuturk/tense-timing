# Conceptual Task: Tense Planning Experiment

This repository contains a PCIbex/PennController experiment for tense decision behavior.
This README describes the current implementation in `data_includes/` and is meant to be reproducible against the code as-is.

## Implementation Snapshot

- Platform: PCIbex + PennController
- Main entry: `data_includes/main.js`
- Helper logic:
  - `data_includes/helper_block_intro.js`
  - `data_includes/helper_trial.js`
  - `data_includes/helper_break.js`
  - `data_includes/helper_misc.js`
- Response keys in decision task: `C = Past`, `M = Future`

## Assets

At runtime, stimuli are preloaded from GitHub raw URLs in `main.js`:

- Audio zip: `https://raw.githubusercontent.com/utkuturk/tense-timing/conceptual-task/chunk_includes/elevenlabs_audio.zip`
- Pictures zip: `https://raw.githubusercontent.com/utkuturk/tense-timing/norming/chunk_includes/pictures.zip`

Implication for reproducibility:
- Internet access is required unless you replace these URLs with local assets.
- If these remote files change, stimuli can change without code changes.

## Stimuli

Entities:
- `Pirate`, `Chef`, `Wizard`

Main experimental verbs (18 total; 6 per block):
- Block 1: `drink, read, eat, paint, wash, push`
- Block 2: `build, sweep, ride, climb, stir, peel`
- Block 3: `blow, dig, shake, carry, play, smell`

Practice verbs:
- `spin` (Past)
- `drag` (Future)
- Both use one randomly selected entity per participant.

Master verb list in code contains 20 verbs; `spin` and `drag` are currently reserved for practice.

## Counterbalancing and Randomization

### List selection
- One list is chosen per participant from `a/b/c/d` via `Math.random()`.
- Note: in current code, `c` mirrors `b`, and `d` mirrors `a`.

### Entity rotation across meta-blocks
- Three meta-block rotations are used: `0,1,2`.
- This rotates which entity is paired with each verb/tense assignment.

### Block order
- Within each meta-block, the three blocks are shuffled with Fisher-Yates.

### Decision tense pattern order
- Each block uses both fixed tense patterns once:
  - `PAST, FUTURE, FUTURE, PAST, PAST, FUTURE`
  - `FUTURE, PAST, PAST, FUTURE, FUTURE, PAST`
- Which pattern comes first is randomized per block.

### Additional randomization
- Verb-teaching order in each intro is shuffled.
- Practice entity is randomized from `ENTITIES`.
- Practice decision trial order is shuffled (`spin/drag` order).

### Ordering constraint
- Decision ordering attempts to avoid immediate same-entity repetition.
- If constraint solving fails, it falls back to tense-only ordering.

## Full Experiment Flow

Global sequence in `main.js`:

`Sequence(...introBlock, "check", ...metaSequences.flat(), "time_summary", "send_results", "debrief", "senddebrief", "exit_sona")`

### Intro block sequence

1. `intro`
2. `consent`
3. `demo`
4. `instructions`
5. `practice_intro`
6. `intro_practice` (learn 2 practice verbs)
7. `tense_intro_practice`
8. `tense_pairs_practice`
9. `ready_practice`
10. 2 practice decision trials (with immediate feedback)
11. `exp_ready`

### Main task sequence

- 3 meta-blocks (`m1/m2/m3`)
- Each meta-block has 3 blocks (randomized order)
- A break appears:
  - between blocks inside each meta-block
  - before meta-block 2 and 3

For each block:
1. Verb learning intro (`intro_<block>`)
2. Tense intro (`tense_intro_<block>`)
3. Tense pair reveal (`tense_pairs_<block>`)
4. Decision ready screen (`ready_<block>`)
5. 12 decision trials (6 from each tense pattern)

Totals per participant:
- 9 main blocks
- 108 main decision trials
- 2 practice decision trials

## Trial Behavior and Timing

### Verb learning (`introTrial`)

Per verb item:
- White screen: `300 ms`
- Fixation: `500 ms`
- Stimulus shown: image `400x400`, entity, verb, object
- Verb audio plays (`tts_verb_<verb>.mp3`)
- Minimum post-audio gate: `1000 ms`
- Continue via `Next` button or `SPACE`

### Tense assignment (`tensePairTrial`)

- Grid layout by entity row and tense column
- Item image size: `250x250`
- Dynamic row spacing and canvas height to avoid overlap
- Reveal each item with `SPACE`
- Sentence audio plays (`tts_sent_<entity>_<verb>_<tense>.mp3`)
- Minimum study gate before Next: `1400 ms`

### Decision trials (`trial`)

- White screen: `300 ms`
- Fixation: `500 ms`
- Picture size: `400x400`
- Choice labels: `Past (C)` and `Future (M)`
- Keys: `C` / `M`
- RT logged from choice onset to response

### Practice decisions (`practiceDecisionTrial`)

- Same visual structure and key mapping as main decision trials
- Immediate feedback:
  - Correct
  - Incorrect + correct answer label

## Data Logging (Current)

Header/global:
- SONA id URL param
- source URL param
- experiment start timestamp

Decision trials log:
- Block
- Verb
- Form
- Tense
- Entity
- PatternTag
- LeftOpt / RightOpt
- DecisionRT

Practice decision log:
- Same core fields plus `PracticeCorrect`

Debrief logs:
- technical issues scale
- instruction clarity scale
- free-text feedback

Time summary logs:
- start/end timestamps
- elapsed ms/min

## Running the Experiment

### PCIbex (recommended)

1. Create a PCIbex project.
2. Upload this repository contents preserving folder structure (`data_includes`, `chunk_includes`, `js_includes`, `css_includes`, etc.).
3. Confirm `main.js` is loaded and asset preload URLs are reachable.
4. Run a pilot participant and verify preloading + response logging.

### Local legacy Ibex server

- This repository includes classic Ibex server files (`www/server.py`) that expect Python 2 syntax.
- If you run locally with the legacy server path, use a Python 2 environment.
- If you do not have Python 2, use PCIbex deployment instead.

## Reproducibility Checklist

To replicate the current behavior:

1. Use this exact code snapshot in `data_includes/`.
2. Keep external preload asset URLs unchanged, or vendor and pin local copies.
3. Keep key mapping as `C/M`.
4. Keep timing constants in:
   - `helper_block_intro.js`
   - `helper_trial.js`
5. Keep sequence definition in `main.js` unchanged.

For deterministic (non-random) replay, additionally hardcode:
- `LIST_ID`
- `PRACTICE_ENTITY`
- block order shuffles
- pattern-order shuffles
- practice decision order shuffle
- intro verb shuffle

## Quick Validation Commands

Use syntax checks after edits:

```bash
node --check data_includes/main.js
node --check data_includes/helper_block_intro.js
node --check data_includes/helper_trial.js
node --check data_includes/helper_break.js
```

## Notes

- `helper_trial.js` still contains recall-related trial builders, but they are not in the active sequence.
- Participant-facing instruction text says "3 blocks", while the implemented sequence runs 3 meta-blocks x 3 blocks.
