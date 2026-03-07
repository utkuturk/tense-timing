# Tense Timing: Conceptual Cue Learning + Canonical Production

This repository contains a PCIbex/PennController experiment for tense-timing in spoken production.
This README documents the current implementation in `data_includes/` as it is currently coded.

## Implementation Snapshot

- Platform: PCIbex + PennController
- Main entry: `data_includes/main.js`
- Helper logic:
  - `data_includes/helper_block_intro.js`
  - `data_includes/helper_trial.js`
  - `data_includes/helper_break.js`
  - `data_includes/helper_misc.js`
- Response modality: spoken production with automatic recording windows
- Recording backend: PennController `InitiateRecorder` + S3 recorder lambda

## Assets

At runtime, stimuli are preloaded from GitHub raw URLs in `main.js`:

- Audio zip: `https://raw.githubusercontent.com/utkuturk/tense-timing/morphosyntax/chunk_includes/elevenlabs_audio.zip`
- Pictures zip: `https://raw.githubusercontent.com/utkuturk/tense-timing/morphosyntax/chunk_includes/pictures.zip`

Implications:

- Internet access is required unless you switch to local files.
- If remote zip contents change, runtime stimuli change without JS code edits.

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
- Practice entity is randomized per participant.

Master verb list contains 20 verbs; `spin` and `drag` are reserved for practice in the main flow.

## Cue/Response Design

Learning cues are conceptual:

- Sentence audio files are of the form:
  - `The Pirate's blowing bubbles is in the past.`
  - `The Pirate's blowing bubbles is in the future.`

Production responses are canonical:

- Participants are instructed to produce:
  - Future: `The Pirate will spin a top.`
  - Past: `The Pirate spun a top.`

## Counterbalancing and Randomization

### List selection

- One list is chosen from `a/b/c/d` via `Math.random()`.

### Entity rotation across meta-blocks

- Rotations: `0,1,2`
- This rotates entity assignment to verbs/tense across meta-blocks.

### Block order

- Within each meta-block, the 3 blocks are shuffled (Fisher-Yates).

### Tense-pattern trial order

- Each block uses both fixed patterns:
  - `PAST, FUTURE, FUTURE, PAST, PAST, FUTURE`
  - `FUTURE, PAST, PAST, FUTURE, FUTURE, PAST`
- Pattern order is randomized per block.
- Ordering attempts to avoid immediate same-entity repetition.

## Full Experiment Flow

Global sequence in `main.js`:

`Sequence(...introBlock, "check", ...metaSequences.flat(), "time_summary", "send_results", "debrief", "senddebrief", "exit_sona")`

### Intro block sequence

1. `intro`
2. `consent`
3. `demo`
4. `init` (recorder consent/setup)
5. `recording_test`
6. `instructions`
7. `practice_intro`
8. `intro_practice`
9. `tense_intro_practice`
10. `tense_pairs_practice`
11. `ready_practice`
12. 2 practice production trials
13. `exp_ready`

### Main task sequence

- 3 meta-blocks (`m1/m2/m3`)
- Each meta-block has 3 randomized blocks
- Breaks appear between blocks and before meta-block 2/3

Per block:

1. Verb learning intro (`intro_<block>`)
2. Tense intro (`tense_intro_<block>`)
3. Tense pair reveal (`tense_pairs_<block>`)
4. Production ready screen (`ready_<block>`)
5. 12 production trials (6 from each tense pattern)

Totals per participant:

- 9 main blocks
- 108 main production trials
- 2 practice production trials

## Trial Behavior and Timing

### Verb learning (`introTrial`)

- White screen: `300 ms`
- Fixation: `500 ms`
- Verb audio (`tts_verb_<verb>.mp3`)
- Post-audio minimum gate: `1000 ms`
- Continue via button or `SPACE`

### Tense assignment (`tensePairTrial`)

- Press `SPACE` to reveal each item
- Sentence audio (`tts_sent_<entity>_<verb>_<tense>.mp3`)
- Minimum study gate: `1400 ms`

### Production trial (`trial`, `practiceDecisionTrial`)

- White screen: `300 ms`
- Fixation: `500 ms`
- Picture onset triggers:
  - click sound
  - automatic recording start
- Recording window: `4500 ms` (`AUTO_RECORD_MS`)
- Recording stops automatically
- Participant then continues via button or `SPACE`

## Data Logging

Header/global:

- SONA id URL parameter
- source URL parameter
- experiment start timestamp

Production trial logs include:

- `Block`, `Verb`, `Form`, `Tense`, `Entity`
- `EventPhrase`
- `TargetLabelSentence`
- `TargetCanonicalSentence`
- `PatternTag`
- `ResponseMode` (`spoken_production`)
- `AutoRecordMS`
- `ProductionRT`

Debrief logs:

- technical issues scale
- instruction clarity scale
- free-text feedback

Time summary logs:

- start/end timestamps
- elapsed ms/min

## ElevenLabs Audio Build

Script:

- `scripts/build_elevenlabs_audio.js`

Outputs:

- `chunk_includes/elevenlabs_audio/manifest.json`
- `chunk_includes/elevenlabs_audio/texts.tsv`
- `chunk_includes/elevenlabs_audio.zip`

Generate/overwrite all mp3 files:

```bash
FORCE_REGEN=1 ELEVENLABS_API_KEY=... node scripts/build_elevenlabs_audio.js
```

Notes:

- Without `FORCE_REGEN=1`, existing mp3 files are skipped.
- Regenerating local zip does not affect runtime unless preload URLs are pointed to those local/updated assets.

## Running

### PCIbex (recommended)

1. Create a PCIbex project.
2. Upload repository contents preserving folder structure.
3. Confirm `main.js` is loaded.
4. Verify remote preload URLs are reachable.
5. Run a pilot and confirm recording upload + result rows.

## Quick Validation Commands

```bash
node --check data_includes/main.js
node --check data_includes/helper_block_intro.js
node --check data_includes/helper_trial.js
node --check data_includes/helper_break.js
node --check scripts/build_elevenlabs_audio.js
```

## Notes

- `helper_trial.js` still contains recall-typing helper builders that are not in the active sequence.
- Participant-facing instructions currently say "3 blocks", while implementation is 3 meta-blocks x 3 blocks.
