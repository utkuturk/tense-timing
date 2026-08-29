# Norming Experiment (tense-timing)

Stimulus validation for the production experiments. The pictures used in
`conceptual-task/`, `morphosyntax/` and `morphophonology/` have to work equally
well under a past and a future description of the same event, otherwise a timing
difference between tenses could come from the picture rather than from planning.
This experiment checks that.

## Implementation Snapshot

- Platform: PCIbex + PennController
- Main entry: `data_includes/main.js`
- Items: `chunk_includes/items.csv`, 120 rows over two counterbalanced lists
- Response mode: 1-7 rating of sentence-picture fit, no recording
- Analysis: `scripts/norming.qmd`, rendered to `scripts/norming.html`

## Outcome

Past and future descriptions are equally available from the pictures. Of 17
participants, 5 were excluded for a filler mean rating above 2, leaving 12 and
641 analysed trials. The future-minus-past reading time difference was 13.7 ms,
95% CrI [-166.2, 191.3], with P(future > past) = 0.56; the expected rating
difference was -0.273, 95% CrI [-0.794, 0.042]. Numbers come from
`scripts/norming.html`.

## Current design

- Single-picture trials (no picture selection).
- One sentence per trial (either past or future).
- Participants rate sentence-picture fit on a 1-7 scale.
- Picture preview is timed at 15 seconds before the sentence appears.
- Short break screens are inserted every 20 trials.

## List structure (A/B)

`items.csv` uses two counterbalanced lists with a `group` column:

- `A`
- `B`

Each picture appears in exactly two rows total:

- one row with a past sentence
- one row with a future sentence

The script uses:

`GetTable("items.csv").setGroupColumn("group")`

so PCIbex counter/list assignment can serve Group A vs Group B.

## items.csv schema

- `item_id`: stable item identifier
- `group`: `A` or `B`
- `character`
- `verb`
- `past_form`
- `type`
- `picture`: image filename in `chunk_includes/`
- `tense`: `past` or `future`
- `sentence`: sentence shown for rating
