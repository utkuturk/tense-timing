# Tense-Timing Experiment Status Log

## Purpose
This file captures a chronological log of our chat decisions/requests and the resulting experiment changes.

## Conversation Timeline (Chronological)
1. You asked to align the experiment with `reference.js` from the `norming` branch and remove unwanted assets from `chunk_includes`.
2. You asked to re-check `chunk_includes` because extra content was still present.
3. You reported that `main.js` had been over-copied from `reference.js`; you asked to restore the previous experiment structure and re-read `README.md`.
4. You asked to keep `norming` `chunk_includes`, add:
   - `PreloadZip("https://raw.githubusercontent.com/utkuturk/tense-timing/norming/chunk_includes/pictures.zip")`
   - psych/ling SONA URL setup
   - `senddebrief` and `exit_sona` flow
5. You reported the experiment appeared to jump to “sending to server”; then said it might actually be working.
6. You requested object inclusion in teaching (not just "The pirate spun"), i.e., verb + object training.
7. You requested that each verb be assigned to exactly one tense (Past or Future), not taught as both.
8. You requested fixed tense ordering per `README.md`:
   - `P -> F -> F -> P -> P -> F`
   - `F -> P -> P -> F -> F -> P`
9. You requested recall acceptance to allow object text and only require that the verb appears in the typed response.
10. You requested ElevenLabs integration and an API placeholder (`XX`).
11. You requested pre-generated ElevenLabs audio files in project folders/zip and loading from experiment files.
12. You asked which files (e.g., analysis outputs) were from a previous branch and should not be pushed.
13. You reported zipped ElevenLabs audio was not loading and suspected zip internal folder layout mismatch.
14. You requested deleting TTS fallback behavior.
15. You asked to remove the current practice style; requested stronger intro instructions and fixed keys `F/J` with no key mapping shuffling.
16. You asked: “how does the experiment go?” (overall flow explanation).
17. You requested removal of recall; requested:
   - teach verbs one-by-one,
   - then tense assignment display,
   - show all 6 pictures in one page (2 pirate, 2 wizard, 2 chef),
   - reveal in grouped pairs by entity,
   - then “get ready” page,
   - then start decision trials.
18. You asked trial counts per block.
19. You questioned why 6 trials with two tense patterns and requested 12 decision trials/block.
20. You requested both patterns per block and randomize which pattern comes first.
21. You requested a concrete possible trial sequence participants see.
22. You asked for an entity adjacency constraint (avoid same entity back-to-back).
23. You requested broader design change to avoid reusing same head-verb pairs across metablocks and suggested cycling through non-overlapping sets.
24. You requested tense-study behavior changes:
   - reveal items via `SPACE`,
   - remove sentence text under items,
   - show picture + play audio upon reveal,
   - then show `Next`, repeat.
25. You requested `SPACE` navigation generally available across the experiment.
26. You requested larger decision images, smaller fonts, and explicit `F/J` labels next to Past/Future.
27. You requested removing count text like “Verb 4 of 6”.
28. You added `scriptH2.js` as timing reference and requested global per-participant total-time logging.
29. You requested tense page to keep all six slots visible on one screen, but reveal items one-by-one in-place.
30. You asked that `SPACE` activate every button except demographics.
31. You requested pacing updates:
   - do not show `Next` immediately,
   - show `Next` after audio,
   - instruction pages should gate `Next` by minimum reading time,
   - verb learning and decision trials should include `300ms` white + `500ms` fixation.
32. Latest request: `1000ms` wait felt too long and `Next` still appeared too early; you asked to shorten and delay button visibility.

## Implemented State (Current)
- `SPACE` support has been added broadly for button advancement outside demographics.
- Verb learning includes:
  - `300ms` white screen,
  - `500ms` fixation cross,
  - stimulus presentation + audio,
  - delayed `Next` reveal only after audio and post-audio timer.
- Tense assignment screen shows a single shared layout (Past/Future columns with entity rows) and reveals items one-by-one in-place.
- `Next` in tense reveal now appears only after audio + wait gate.
- Post-audio delay in verb-learning reduced from `1000ms` to `250ms`.
- Decision task uses fixed keys (`F = Past`, `J = Future`) and includes pre-stimulus white/fixation timing.
- Recall section is removed from active flow (per your direction).
- Two tense patterns are used for decision ordering per block, with randomized pattern-first order.
- Entity adjacency constraint logic was added for ordering (to avoid immediate repeats where feasible).
- Global timing capture (participant-level elapsed time) was added following your `scriptH2.js` reference request.
- Debrief + `senddebrief` + `exit_sona` flow remains in the sequence.

## Files Most Frequently Edited During This Thread
- `data_includes/main.js`
- `data_includes/helper_block_intro.js`
- `data_includes/helper_trial.js`
- `data_includes/helper_break.js`
- `data_includes/helper_misc.js`
- `scripts/build_elevenlabs_audio.js`

## Most Recent Fix Applied
In `data_includes/helper_block_intro.js`:
- `VERB_POST_AUDIO_MS` changed to `250`.
- Verb-study `Next` button is now created hidden and printed only after audio + timer completion.
- Tense-study `Next` button is now created hidden and printed only after audio + timer completion.

## Note
This `status.md` is a structured conversation log + implementation state summary, designed for handoff and debugging continuity.
