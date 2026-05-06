# Morphophonology Experiment — Cleanup Changes

## 1. Removed experiment-duration timing
- Deleted `const EXP_START_TIMESTAMP = Date.now()`
- Removed `exp_start_timestamp` var and log from `Header`
- Deleted the entire `"time_summary"` trial (which computed `exp_end_timestamp`, `exp_elapsed_ms`, `exp_elapsed_min`)
- Removed `"time_summary"` from `Sequence`

## 2. Removed double results submission
- Deleted `SendResults("senddebrief")` — results are now sent exactly once via `"send_results"` after the main experiment
- Removed `"senddebrief"` from `Sequence`

## 3. Replaced synthesized click sound with a file, then removed entirely
- Replaced the Web Audio API `playClickSound()` function (oscillator/gain synthesis) with `newAudio("click", "./click.mp3").play()` inline in both the main trial and practice trial
- Later removed the click sound entirely — no audio cue before recording
- Updated all instruction text to say **"Speak as soon as possible once you see the picture"** instead of referencing a click sound

## 4. Removed dead code
The following functions were defined but never called and were deleted:

**`helper_trial.js`**
- `escapeRegExp()`
- `recall_trial()`
- `recallIntroTrial()`
- `recallOutroTrial()`

**`helper_block_intro.js`**
- `playPreGeneratedAudio()` / `__speechCounter`
- `tenseIntroTrial()`
- `tensePairTrial()`
- `defineSituationSwitchTrial()` (in `helper_break.js`)
- `MIN_TENSE_STUDY_MS`, `MIN_VERB_STUDY_MS`, `ENTITY_DISPLAY_ORDER` constants
- `sortByEntityThenVerb()`, `withObject()`

**`main.js`**
- `const verbs = [...]` — flat verb list, superseded by the per-block arrays
- `const RECORDING_UPLOAD_TIMEOUT_MS` and the entire `patchRecordingUploadTimeouts` IIFE (XMLHttpRequest monkey-patching)

## 5. Removed per-trial reaction time logging
- Deleted `newVar("production_rt")` / `getVar("production_rt").set(...)` / `.log("ProductionRT", ...)` from main trial
- Deleted the same for `practice_production_rt` in practice trial

## 6. Merged all helper files into main.js
Deleted the four separate helper files and inlined their contents into `main.js` in logical order:

| Deleted file | Contents moved to |
|---|---|
| `helper_misc.js` | CSS vars, `newDemo`, `requireFilled` |
| `helper_break.js` | Break trial (inlined directly, no wrapper function) |
| `helper_trial.js` | `AUTO_RECORD_MS`, `trial()`, `practiceDecisionTrial()`, regularity pattern logic |
| `helper_block_intro.js` | `introTrial()`, `decisionReadyTrial()`, verb/audio helpers |

`data_includes/` now contains only `main.js`.

## 7. Timer callback refactor for recorder stop
Changed both the main trial and practice trial from:
```javascript
newTimer("...", AUTO_RECORD_MS).start(),
getTimer("...").wait(),
getVoiceRecorder(recorderId).stop(),
```
to:
```javascript
newTimer("...", AUTO_RECORD_MS)
  .callback(getVoiceRecorder(recorderId).stop())
  .start(),
getTimer("...").wait(),
```
The recorder now stops via the timer's callback rather than a separate step after `.wait()`.

## 8. Random subject ID
- Added `const SUBJECT_ID = isDemoMode ? "demo" : Math.random().toString(36).slice(2, 10)`
- All `VoiceRecorder` labels are now prefixed with `SUBJECT_ID` (e.g. `subjectid_resp_block_...`), which determines the recording filename on S3
- `subject_id` is logged in every results row via `Header`

## 9. Demo mode
- Added `const isDemoMode = GetURLParameter("id") === "demo"`
- When `?id=demo` is in the URL, the `"intro"` and `"consent"` trials are skipped; the sequence starts at `"demo"` (demographics form)
- Demo participants get `SUBJECT_ID = "demo"` instead of a random ID

## 10. Replaced async upload checkpoints with a single end-of-experiment upload
- Removed `ENABLE_ASYNC_UPLOAD_CHECKPOINTS` flag
- Removed all mid-experiment `UploadRecordings("async", "noblock")` calls
- Added a single blocking `UploadRecordings("upload_recordings")` step in the `Sequence` immediately before `"send_results"`

Final sequence order:
```
...introBlock → "check" → ...experiment trials → "upload_recordings" → "send_results" → "debrief" → "exit_sona"
```
