# Norming Experiment (tense-timing)

This experiment is defined in `data_includes/main.js` and uses items in `chunk_includes/items.csv`.

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
