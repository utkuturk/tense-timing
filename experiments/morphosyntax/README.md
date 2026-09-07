# Tense Timing: Conceptual Cue Learning + Canonical Production

A PCIbex spoken-production experiment. Participants learn which action goes with
which character and when it happened, then describe pictures out loud in the
tense the trial calls for. Every response is recorded. The manipulation is
whether the previous trial used the same tense, so the question is what
repeating a *tense* does to the next utterance.

Both past and future are produced here. The companion `morphophonology`
experiment holds tense constant and varies the form instead.

## What a participant does

1. Reads the introduction and consents.
2. Answers a few demographic questions.
3. Grants microphone access and makes a test recording.
4. Reads the instructions, learns two practice verbs with their tenses, and
   produces two practice sentences.
5. Works through nine blocks, grouped into three meta-blocks of three. Each
   block first teaches its six verbs one at a time with audio and then places
   each event in past or future; only afterwards does the block ask for its
   twelve spoken descriptions, which show a picture and no tense cue. Breaks
   come between blocks, and meta-blocks 2 and 3 open on a "new situation"
   screen.
6. Reaches the end screen, waits while the recordings and results are sent, is
   offered a copy of their own recordings, and then claims credit or payment.

About 108 recorded sentences per participant, plus the two practice ones.

## Design

Characters: Pirate, Chef, Wizard.

Eighteen verbs, six per block:

- Block 1: `drink, read, eat, paint, wash, push`
- Block 2: `build, sweep, ride, climb, stir, peel`
- Block 3: `blow, dig, shake, carry, play, smell`

Practice verbs: `spin` (past) and `drag` (future), with the practice character
randomised per participant. The master list holds twenty verbs; those two are
reserved for practice.

Learning cues are conceptual rather than sentences to repeat, so participants
are not simply echoing the target:

> The Pirate's blowing bubbles is in the past.

Responses are canonical:

> Past: The Pirate spun a top.
> Future: The Pirate will spin a top.

Each block runs twice, once under each tense order:

```
Pattern 1:  PAST  FUTURE FUTURE PAST  PAST  FUTURE
Pattern 2:  FUTURE PAST  PAST  FUTURE FUTURE PAST
```

Which pattern comes first is randomised per block. One of four lists is drawn at
random, block order is shuffled within each meta-block, entity assignment rotates
across the three meta-blocks, and the ordering avoids putting the same character
back to back.

## Sequence

What the participant sees, in order:

| | Screen |
|:--|:--|
| 1 | Introduction, consent, demographics |
| 2 | Microphone permission and a test recording |
| 3 | Instructions, then two practice sentences |
| 4 | Three meta-blocks: learn six verbs and tenses, produce twelve sentences, break |
| 5 | "The experiment has now ended" — asks them not to close the page |
| 6 | Recordings upload, then results are sent |
| 7 | Exit page: download your own copy, then claim credit or payment |

In code:

```js
Sequence(
  ...introBlock,
  "check",
  ...metaSequences.flat(),
  "end_explanation",
  "upload_recordings",
  "send_results",
  ...(RECRUITMENT === "prolific"
    ? ["exit_prolific"]
    : ["debrief", "exit_sona"]),
);
```

Results are sent *after* the upload on purpose: the results file then carries the
`UploadRecordings` rows that `analysis/scripts/prepare_recordings.py` reads, and
records whether the upload succeeded.

## Recruitment and the end pages

The `source` URL parameter, or Prolific's own `PROLIFIC_PID`, decides where a
participant is sent at the end.

- **SONA** (`source=psych` or `source=ling`): debrief questions, then a link
  that confirms participation and grants credit.
- **Prolific**: straight to an exit page with the completion link.
- **Anything else**: a message saying credit will be approved manually.

Both exit pages offer a download of the participant's own recordings before the
credit or payment link.

If the upload fails, PCIbex shows its own error screen with a link that saves the
recordings and continues. The experiment rewords that screen and carries on, so
the results are still sent.

## Recordings

Each recording is named:

```
resp_{participant}_{session}_m{metablock}_block{block}_p{pattern}_{verb}_{tense}
```

`participant` is the Prolific PID or the SONA id, reduced to alphanumerics.
`session` is a random per-session id, so two runs by the same person stay apart.
Names carrying these ids need no lookup to be traced back to a participant.

Recordings made before this naming was introduced start straight at
`resp_m1_...` with no ids. The analysis handles both.

## Logged per trial

Block, verb, form, tense, regularity, entity, the target sentence in both
labelled and canonical form, the pattern tag, the assigned list, and the
recording filename. Session-level: the participant and session ids, the
recruitment source, and the Prolific study and session ids when present.

The debrief adds technical issues, instruction clarity, and free-text feedback.

## Stimulus audio

Spoken cues are pre-generated rather than synthesised in the browser:

```bash
FORCE_REGEN=1 ELEVENLABS_API_KEY=... node scripts/build_elevenlabs_audio.js
```

Writes `chunk_includes/elevenlabs_audio/` and the zip the experiment preloads.
Pictures and audio are fetched from GitHub at runtime, so the experiment needs
internet access and changing those archives changes the stimuli without touching
any JavaScript.

## Running it

Deploy to PCIbex. Before going live, fill in the SONA `experiment_id` and
`credit_token` and the Prolific completion code at the top of
`data_includes/main.js`; they ship as `XX` placeholders.

Edit this experiment on `main` under `experiments/morphosyntax/`, not on the
branch. Pushing to `main` propagates it here automatically.

```bash
node --check data_includes/main.js
node --check scripts/build_elevenlabs_audio.js
```
