# Verb Selection for Tense-Timing Experiment

## The Problem

I already created some verb-picture pairs that work well for the regular/irregular distinction. However, there's an aspectual problem: some verbs are **punctual/achievement verbs** — they denote instantaneous events where the action happens at a single point in time.

For example, with "hit": the moment you hit something, the action is complete. Before contact, it's clearly "will hit" (future). After contact, it's "hit" (past). There's no ambiguous middle state where you could reasonably describe it as either past or future.

**What we need:** Verbs with **durative/activity aspect** — where even in the middle of the event, a participant could plausibly say "will X," "is X-ing," or "X-ed" depending on the cue. The picture should show an ongoing action that doesn't force a particular tense interpretation.

---

## Problematic Verbs (Punctual/Achievement)

These verbs are problematic because the action happens at a single moment:

| Verb | Type | Problem |
|------|------|---------|
| **break** | Irregular | Once the stick breaks, it's broken. The breaking moment is instantaneous. |
| **throw** | Irregular | The release is a single moment. Before release = future, after = past. |
| **cut** | Irregular | Each cut is a distinct punctual event. Mid-slice is ambiguous. |
| **kick** | Regular | The foot-ball contact is instantaneous. |
| **light** | Irregular | The ignition moment is punctual (lit/lighted). |
| **hammer** | Regular | Each strike is punctual (though repetitive hammering is durative). |

### Problematic Picture Sets to Replace/Remove

- `pirate_break_stick_v*.png` / `wizard_break_stick_v*.png`
- `pirate_throw_frisbee_v*.png` / `wizard_throw_frisbee_v*.png`
- `pirate_cut_bread_v*.png` / `wizard_cut_bread_v*.png`
- `pirate_kick_ball_v*.png` / `wizard_kick_ball_v*.png`
- `pirate_light_candle_v*.png` / `wizard_light_candle_v*.png`
- `pirate_hammer_nail_v*.png` / `wizard_hammer_nail_v*.png`

---

## Current Good Verbs (Durative/Activity)

These verbs from the current set are fine:

| Verb | Type | Why It Works |
|------|------|--------------|
| build | Irregular | Ongoing construction process |
| sweep | Irregular | Continuous sweeping motion |
| ride | Irregular | Ongoing riding activity |
| drink | Irregular | Progressive consumption |
| eat | Irregular | Progressive consumption |
| dig | Irregular | Continuous digging motion |
| paint | Regular | Ongoing painting strokes |
| play | Regular | Continuous playing |
| wash | Regular | Ongoing washing motion |
| stir | Regular | Continuous stirring |
| climb | Regular | Progressive climbing |
| push | Regular | Continuous pushing |
| peel | Regular | Progressive peeling |
| smell | Regular | Ongoing sensory activity |

---

## Replacement Verbs (Durative/Activity)

### Irregular Verbs — Replacements for Punctual Ones

| Verb | Past | Freq (est.) | Picture Idea |
|------|------|-------------|--------------|
| **swim** | swam | High | Character swimming in pool/ocean |
| **run** | ran | High | Character running on path/track |
| **draw** | drew | Medium | Character sketching on paper |
| **write** | wrote | High | Character writing in notebook |
| **drive** | drove | High | Character driving car/go-kart |
| **sing** | sang | Medium | Character singing with microphone |
| **fly** | flew | Medium | Character with jetpack/wings |
| **blow** | blew | Medium | Character blowing bubbles/horn |
| **spin** | spun | Low | Character spinning a top/pottery wheel |
| **swing** | swung | Medium | Character on a swing |
| **slide** | slid | Low | Character sliding down slide |
| **grind** | ground | Low | Character grinding coffee/pepper |
| **weave** | wove | Low | Character weaving on loom |

### Regular Verbs — Replacements for Punctual Ones

| Verb | Past | Freq (est.) | Picture Idea |
|------|------|-------------|--------------|
| **walk** | walked | High | Character walking on path |
| **dance** | danced | Medium | Character dancing |
| **cook** | cooked | Medium | Character cooking at stove |
| **carry** | carried | Medium | Character carrying box/bag |
| **pull** | pulled | Medium | Character pulling wagon/rope |
| **drag** | dragged | Low | Character dragging sack |
| **pour** | poured | Medium | Character pouring liquid |
| **row** | rowed | Low | Character rowing boat |
| **scrub** | scrubbed | Low | Character scrubbing floor |
| **polish** | polished | Low | Character polishing shoes/trophy |
| **mop** | mopped | Low | Character mopping floor |
| **knit** | knitted | Low | Character knitting scarf |
| **roll** | rolled | Medium | Character rolling dough |
| **spray** | sprayed | Low | Character spraying plants/paint |
| **wipe** | wiped | Medium | Character wiping table |
| **brush** | brushed | Medium | Character brushing hair/teeth |

---

## Extended Verb Pool (More Than Necessary)

Here's an extended list to choose from, ensuring we have plenty of options:

### Irregular — All Durative-Friendly

1. swim (swam) — swimming in water
2. run (ran) — running on ground
3. draw (drew) — drawing picture
4. write (wrote) — writing letter
5. drive (drove) — driving vehicle
6. sing (sang) — singing song
7. fly (flew) — flying with wings/jetpack
8. blow (blew) — blowing bubbles
9. spin (spun) — spinning wheel/top
10. swing (swung) — swinging on swing
11. slide (slid) — sliding down
12. grind (ground) — grinding pepper
13. weave (wove) — weaving cloth
14. feed (fed) — feeding animal
15. read (read) — reading book
16. shake (shook) — shaking maracas
17. sew (sewed/sewn) — sewing fabric
18. ring (rang) — ringing bell (continuous)
19. drag (dragged/drug) — dragging object
20. wind (wound) — winding thread

### Regular — All Durative-Friendly

1. walk (walked) — walking on path
2. dance (danced) — dancing
3. cook (cooked) — cooking food
4. carry (carried) — carrying object
5. pull (pulled) — pulling wagon
6. pour (poured) — pouring liquid
7. row (rowed) — rowing boat
8. scrub (scrubbed) — scrubbing surface
9. polish (polished) — polishing item
10. mop (mopped) — mopping floor
11. knit (knitted) — knitting scarf
12. roll (rolled) — rolling dough
13. spray (sprayed) — spraying water
14. wipe (wiped) — wiping surface
15. brush (brushed) — brushing hair
16. dust (dusted) — dusting shelf
17. fold (folded) — folding clothes
18. iron (ironed) — ironing shirt
19. water (watered) — watering plants
20. sketch (sketched) — sketching picture
21. type (typed) — typing on keyboard
22. chew (chewed) — chewing food
23. sip (sipped) — sipping drink
24. hum (hummed) — humming tune
25. rock (rocked) — rocking chair/baby

---

## FINAL VERB SET (Implemented)

**Critical constraint:** All verbs must be both **TRANSITIVE** (take a direct object for "The X verb-ed Y" structure) and **DURATIVE** (ongoing activity, not punctual achievement).

### Replacements Made

| Removed (Punctual) | Replaced With (Durative) | Type | Reason |
|--------------------|--------------------------|------|--------|
| break | **shake** (shook) | Irregular | "break" is instantaneous - stick is broken or not |
| throw | **blow** (blew) | Irregular | "throw" release is a single moment |
| cut | **read** (read) | Irregular | "cut" each slice is punctual |
| kick | **carry** (carried) | Regular | "kick" foot-ball contact is instantaneous |
| hammer | **drag** (dragged) | Practice | "hammer" each strike is punctual |
| light | **spin** (spun) | Practice | "light" ignition is instantaneous |

### Final Irregular Verbs (9)

| Verb | Past | Object | Picture Description |
|------|------|--------|---------------------|
| eat | ate | apple | eating a shiny apple |
| drink | drank | coffee | drinking from a steaming mug |
| ride | rode | bicycle | riding a simple bicycle |
| build | built | tower | stacking wooden blocks |
| sweep | swept | floor | sweeping with a broom |
| dig | dug | hole | digging with a shovel |
| **shake** | shook | bottle | shaking a bottle |
| **blow** | blew | bubbles | blowing soap bubbles |
| **read** | read | book | reading a book |

### Final Regular Verbs (9)

| Verb | Past | Object | Picture Description |
|------|------|--------|---------------------|
| paint | painted | canvas | painting on an easel |
| play | played | guitar | playing acoustic guitar |
| wash | washed | dish | washing a plate with sponge |
| stir | stirred | pot | stirring a cooking pot |
| climb | climbed | ladder | climbing a wooden ladder |
| push | pushed | cart | pushing a shopping cart |
| peel | peeled | banana | peeling a banana |
| smell | smelled | flower | smelling a flower |
| **carry** | carried | box | carrying a cardboard box |

### Final Practice Verbs (2)

| Verb | Past | Object | Picture Description |
|------|------|--------|---------------------|
| **drag** | dragged | sack | dragging a burlap sack |
| **spin** | spun | top | spinning a wooden top |

---

## Block Structure

Each block has 3 irregular + 3 regular verbs:

| Block | Irregular (3) | Regular (3) |
|-------|---------------|-------------|
| Block 1 | drink, shake, eat | paint, wash, push |
| Block 2 | read, sweep, blow | carry, stir, peel |
| Block 3 | build, ride, dig | play, climb, smell |
| Practice | spin | drag |

---

## Notes

- All verbs describe **activities** (ongoing processes), not **achievements** (instantaneous completions)
- Pictures should show the character clearly **in the middle** of the action
- Avoid showing clear "before" (nothing started) or "after" (result visible) states
- All verbs are **transitive** - they take direct objects for the "The X verb-ed Y" sentence structure
