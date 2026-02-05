# Tense Planning Project

This project investigates the dissociation between syntactic planning (tense feature/diacritic selection) and phonological planning (morph realization) in language production.

## Project Structure

The repository is organized as follows:

- **`experiments/`**: Contains the source code and materials for psycholinguistic experiments.
  - `conceptual-task/`: A PCIbex experiment testing tense planning using a switch task paradigm.
  - `norming/`: A norming experiment to validate aspectual properties of stimuli. [DEMO for the norming experiment](https://farm.pcibex.net/p/qHbGqX/)
  - `morphophonology/`: (Planned) Experiment focusing on phonological planning.
  - `morphosyntax/`: (Planned) Experiment focusing on syntactic planning.
- **`analysis/`**: Scripts and notebooks for data analysis and stimulus generation.
  - `regular_irregular_freqmatch.ipynb`: Notebook for matching verb frequencies. <a target="_blank" href="https://colab.research.google.com/github/utkuturk/tense-timing/blob/main/analysis/regular_irregular_freqmatch.ipynb"><img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab"/></a>
  - `experiment_materials_generator.ipynb`: Notebook for generating experiment materials. <a target="_blank" href="https://colab.research.google.com/github/utkuturk/tense-timing/blob/main/analysis/experiment_materials_generator.ipynb"><img src="https://colab.research.google.com/assets/colab-badge.svg" alt="Open In Colab"/></a>
- **`presentations/`**: Slides and posters for conferences and talks.
  - `bling/`: Presentation materials for BLING.
- **`paper/`**: Manuscripts, drafts, and figures for publication.
- **`notes/`**: Research notes, meeting minutes, and literature reviews.
- **`doc/`**: Additional project-level documentation.

## Getting Started

### Conceptual Task
To run or edit the main experiment, navigate to `experiments/conceptual-task/`.
See the [Experiment README](experiments/conceptual-task/README.md) for details on the design, conditions, and deployment.

## Research Goals

1. **Overall Goal**: Test dissociation between syntactic and phonological planning.
2. **Current Focus**: Establish that the entropy-manipulation (switch task) works as intended using the `conceptual-task`.

## Experiment Structure

Blocks 1-3 (6 trials each). Representative images use the Wizard for consistency.

**Block 1**
| Order | Verb (Type) | Representative |
| :--- | :--- | :---: |
| Trial 1 | drink (I) | <img src="experiments/conceptual-task/chunk_includes/wizard_drink_coffee_v5.png" alt="wizard drink coffee" width="90"> |
| Trial 2 | shake (I) | <img src="experiments/conceptual-task/chunk_includes/wizard_shake_bottle_v3.png" alt="wizard shake bottle" width="90"> |
| Trial 3 | eat (I) | <img src="experiments/conceptual-task/chunk_includes/wizard_eat_apple_v4.png" alt="wizard eat apple" width="90"> |
| Trial 4 | paint (R) | <img src="experiments/conceptual-task/chunk_includes/wizard_paint_canvas_v2.png" alt="wizard paint canvas" width="90"> |
| Trial 5 | wash (R) | <img src="experiments/conceptual-task/chunk_includes/wizard_wash_dish_v5.png" alt="wizard wash dish" width="90"> |
| Trial 6 | push (R) | <img src="experiments/conceptual-task/chunk_includes/wizard_push_cart_v1.png" alt="wizard push cart" width="90"> |

↓

**Block 2**
| Order | Verb (Type) | Representative |
| :--- | :--- | :---: |
| Trial 1 | read (I) | <img src="experiments/conceptual-task/chunk_includes/wizard_read_book_v2.png" alt="wizard read book" width="90"> |
| Trial 2 | sweep (I) | <img src="experiments/conceptual-task/chunk_includes/wizard_sweep_floor_v3.png" alt="wizard sweep floor" width="90"> |
| Trial 3 | blow (I) | <img src="experiments/conceptual-task/chunk_includes/wizard_blow_bubbles_v5.png" alt="wizard blow bubbles" width="90"> |
| Trial 4 | carry (R) | <img src="experiments/conceptual-task/chunk_includes/wizard_carry_box_v1.png" alt="wizard carry box" width="90"> |
| Trial 5 | stir (R) | <img src="experiments/conceptual-task/chunk_includes/wizard_stir_pot_v2.png" alt="wizard stir pot" width="90"> |
| Trial 6 | peel (R) | <img src="experiments/conceptual-task/chunk_includes/wizard_peel_banana_v1.png" alt="wizard peel banana" width="90"> |

↓

**Block 3**
| Order | Verb (Type) | Representative |
| :--- | :--- | :---: |
| Trial 1 | build (I) | <img src="experiments/conceptual-task/chunk_includes/wizard_build_tower_v2.png" alt="wizard build tower" width="90"> |
| Trial 2 | ride (I) | <img src="experiments/conceptual-task/chunk_includes/wizard_ride_bicycle_v5.png" alt="wizard ride bicycle" width="90"> |
| Trial 3 | dig (I) | <img src="experiments/conceptual-task/chunk_includes/wizard_dig_hole_v4.png" alt="wizard dig hole" width="90"> |
| Trial 4 | play (R) | <img src="experiments/conceptual-task/chunk_includes/wizard_play_guitar_v1.png" alt="wizard play guitar" width="90"> |
| Trial 5 | climb (R) | <img src="experiments/conceptual-task/chunk_includes/wizard_climb_ladder_v1.png" alt="wizard climb ladder" width="90"> |
| Trial 6 | smell (R) | <img src="experiments/conceptual-task/chunk_includes/wizard_smell_flower_v2.png" alt="wizard smell flower" width="90"> |

## Selected Conceptual-Task Images

Best versions selected from `experiments/conceptual-task/chunk_includes` (generated from `combined_selection_report.csv`).

| Character | Verb | Object | Best Image |
| :--- | :--- | :--- | :---: |
| Chef | blow | bubbles | <img src="experiments/conceptual-task/chunk_includes/chef_blow_bubbles_v4.png" alt="chef blow bubbles" width="90"> |
| Chef | build | tower | <img src="experiments/conceptual-task/chunk_includes/chef_build_tower_v1.png" alt="chef build tower" width="90"> |
| Chef | carry | box | <img src="experiments/conceptual-task/chunk_includes/chef_carry_box_v5.png" alt="chef carry box" width="90"> |
| Chef | climb | ladder | <img src="experiments/conceptual-task/chunk_includes/chef_climb_ladder_v2.png" alt="chef climb ladder" width="90"> |
| Chef | dig | hole | <img src="experiments/conceptual-task/chunk_includes/chef_dig_hole_v1.png" alt="chef dig hole" width="90"> |
| Chef | drag | sack | <img src="experiments/conceptual-task/chunk_includes/chef_drag_sack_v1.png" alt="chef drag sack" width="90"> |
| Chef | drink | coffee | <img src="experiments/conceptual-task/chunk_includes/chef_drink_coffee_v1.png" alt="chef drink coffee" width="90"> |
| Chef | eat | apple | <img src="experiments/conceptual-task/chunk_includes/chef_eat_apple_v1.png" alt="chef eat apple" width="90"> |
| Chef | paint | canvas | <img src="experiments/conceptual-task/chunk_includes/chef_paint_canvas_v3.png" alt="chef paint canvas" width="90"> |
| Chef | peel | banana | <img src="experiments/conceptual-task/chunk_includes/chef_peel_banana_v5.png" alt="chef peel banana" width="90"> |
| Chef | play | guitar | <img src="experiments/conceptual-task/chunk_includes/chef_play_guitar_v2.png" alt="chef play guitar" width="90"> |
| Chef | push | cart | <img src="experiments/conceptual-task/chunk_includes/chef_push_cart_v3.png" alt="chef push cart" width="90"> |
| Chef | read | book | <img src="experiments/conceptual-task/chunk_includes/chef_read_book_v2.png" alt="chef read book" width="90"> |
| Chef | ride | bicycle | <img src="experiments/conceptual-task/chunk_includes/chef_ride_bicycle_v2.png" alt="chef ride bicycle" width="90"> |
| Chef | shake | bottle | <img src="experiments/conceptual-task/chunk_includes/chef_shake_bottle_v2.png" alt="chef shake bottle" width="90"> |
| Chef | smell | flower | <img src="experiments/conceptual-task/chunk_includes/chef_smell_flower_v1.png" alt="chef smell flower" width="90"> |
| Chef | spin | top | <img src="experiments/conceptual-task/chunk_includes/chef_spin_top_v3.png" alt="chef spin top" width="90"> |
| Chef | stir | pot | <img src="experiments/conceptual-task/chunk_includes/chef_stir_pot_v4.png" alt="chef stir pot" width="90"> |
| Chef | sweep | floor | <img src="experiments/conceptual-task/chunk_includes/chef_sweep_floor_v1.png" alt="chef sweep floor" width="90"> |
| Chef | wash | dish | <img src="experiments/conceptual-task/chunk_includes/chef_wash_dish_v3.png" alt="chef wash dish" width="90"> |
| Pirate | blow | bubbles | <img src="experiments/conceptual-task/chunk_includes/pirate_blow_bubbles_v5.png" alt="pirate blow bubbles" width="90"> |
| Pirate | build | tower | <img src="experiments/conceptual-task/chunk_includes/pirate_build_tower_v3.png" alt="pirate build tower" width="90"> |
| Pirate | carry | box | <img src="experiments/conceptual-task/chunk_includes/pirate_carry_box_v4.png" alt="pirate carry box" width="90"> |
| Pirate | climb | ladder | <img src="experiments/conceptual-task/chunk_includes/pirate_climb_ladder_v1.png" alt="pirate climb ladder" width="90"> |
| Pirate | dig | hole | <img src="experiments/conceptual-task/chunk_includes/pirate_dig_hole_v4.png" alt="pirate dig hole" width="90"> |
| Pirate | drag | sack | <img src="experiments/conceptual-task/chunk_includes/pirate_drag_sack_v3.png" alt="pirate drag sack" width="90"> |
| Pirate | drink | coffee | <img src="experiments/conceptual-task/chunk_includes/pirate_drink_coffee_v2.png" alt="pirate drink coffee" width="90"> |
| Pirate | eat | apple | <img src="experiments/conceptual-task/chunk_includes/pirate_eat_apple_v5.png" alt="pirate eat apple" width="90"> |
| Pirate | paint | canvas | <img src="experiments/conceptual-task/chunk_includes/pirate_paint_canvas_v2.png" alt="pirate paint canvas" width="90"> |
| Pirate | peel | banana | <img src="experiments/conceptual-task/chunk_includes/pirate_peel_banana_v5.png" alt="pirate peel banana" width="90"> |
| Pirate | play | guitar | <img src="experiments/conceptual-task/chunk_includes/pirate_play_guitar_v5.png" alt="pirate play guitar" width="90"> |
| Pirate | push | cart | <img src="experiments/conceptual-task/chunk_includes/pirate_push_cart_v3.png" alt="pirate push cart" width="90"> |
| Pirate | read | book | <img src="experiments/conceptual-task/chunk_includes/pirate_read_book_v2.png" alt="pirate read book" width="90"> |
| Pirate | ride | bicycle | <img src="experiments/conceptual-task/chunk_includes/pirate_ride_bicycle_v3.png" alt="pirate ride bicycle" width="90"> |
| Pirate | shake | bottle | <img src="experiments/conceptual-task/chunk_includes/pirate_shake_bottle_v4.png" alt="pirate shake bottle" width="90"> |
| Pirate | smell | flower | <img src="experiments/conceptual-task/chunk_includes/pirate_smell_flower_v3.png" alt="pirate smell flower" width="90"> |
| Pirate | spin | top | <img src="experiments/conceptual-task/chunk_includes/pirate_spin_top_v5.png" alt="pirate spin top" width="90"> |
| Pirate | stir | pot | <img src="experiments/conceptual-task/chunk_includes/pirate_stir_pot_v3.png" alt="pirate stir pot" width="90"> |
| Pirate | sweep | floor | <img src="experiments/conceptual-task/chunk_includes/pirate_sweep_floor_v4.png" alt="pirate sweep floor" width="90"> |
| Pirate | wash | dish | <img src="experiments/conceptual-task/chunk_includes/pirate_wash_dish_v3.png" alt="pirate wash dish" width="90"> |
| Wizard | blow | bubbles | <img src="experiments/conceptual-task/chunk_includes/wizard_blow_bubbles_v5.png" alt="wizard blow bubbles" width="90"> |
| Wizard | build | tower | <img src="experiments/conceptual-task/chunk_includes/wizard_build_tower_v2.png" alt="wizard build tower" width="90"> |
| Wizard | carry | box | <img src="experiments/conceptual-task/chunk_includes/wizard_carry_box_v1.png" alt="wizard carry box" width="90"> |
| Wizard | climb | ladder | <img src="experiments/conceptual-task/chunk_includes/wizard_climb_ladder_v1.png" alt="wizard climb ladder" width="90"> |
| Wizard | dig | hole | <img src="experiments/conceptual-task/chunk_includes/wizard_dig_hole_v4.png" alt="wizard dig hole" width="90"> |
| Wizard | drag | sack | <img src="experiments/conceptual-task/chunk_includes/wizard_drag_sack_v1.png" alt="wizard drag sack" width="90"> |
| Wizard | drink | coffee | <img src="experiments/conceptual-task/chunk_includes/wizard_drink_coffee_v5.png" alt="wizard drink coffee" width="90"> |
| Wizard | eat | apple | <img src="experiments/conceptual-task/chunk_includes/wizard_eat_apple_v4.png" alt="wizard eat apple" width="90"> |
| Wizard | paint | canvas | <img src="experiments/conceptual-task/chunk_includes/wizard_paint_canvas_v2.png" alt="wizard paint canvas" width="90"> |
| Wizard | peel | banana | <img src="experiments/conceptual-task/chunk_includes/wizard_peel_banana_v1.png" alt="wizard peel banana" width="90"> |
| Wizard | play | guitar | <img src="experiments/conceptual-task/chunk_includes/wizard_play_guitar_v1.png" alt="wizard play guitar" width="90"> |
| Wizard | push | cart | <img src="experiments/conceptual-task/chunk_includes/wizard_push_cart_v1.png" alt="wizard push cart" width="90"> |
| Wizard | read | book | <img src="experiments/conceptual-task/chunk_includes/wizard_read_book_v2.png" alt="wizard read book" width="90"> |
| Wizard | ride | bicycle | <img src="experiments/conceptual-task/chunk_includes/wizard_ride_bicycle_v5.png" alt="wizard ride bicycle" width="90"> |
| Wizard | shake | bottle | <img src="experiments/conceptual-task/chunk_includes/wizard_shake_bottle_v3.png" alt="wizard shake bottle" width="90"> |
| Wizard | smell | flower | <img src="experiments/conceptual-task/chunk_includes/wizard_smell_flower_v2.png" alt="wizard smell flower" width="90"> |
| Wizard | spin | top | <img src="experiments/conceptual-task/chunk_includes/wizard_spin_top_v5.png" alt="wizard spin top" width="90"> |
| Wizard | stir | pot | <img src="experiments/conceptual-task/chunk_includes/wizard_stir_pot_v2.png" alt="wizard stir pot" width="90"> |
| Wizard | sweep | floor | <img src="experiments/conceptual-task/chunk_includes/wizard_sweep_floor_v3.png" alt="wizard sweep floor" width="90"> |
| Wizard | wash | dish | <img src="experiments/conceptual-task/chunk_includes/wizard_wash_dish_v5.png" alt="wizard wash dish" width="90"> |
