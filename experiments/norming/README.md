# Norming Experiment

This directory contains a PCIbex experiment for norming stimuli.

## Structure
- `data_includes/main.js`: The main experiment script.
- `chunk_includes/items.csv`: The list of items (pictures and verbs) to test.

## How to run
1. **Generate Materials**:
   - Set your google API key: `export GOOGLE_API_KEY="your_key_here"`
   - Run the generation script: `python generate_images.py`
   - This will populate `chunk_includes/` with images and `items.csv`.
   - `items.csv` will have a `task_group` column, assigning ~50% of items to "tense" and 50% to "desc" (Description).

   - `items.csv` will have a `task_group` column (now handled in JS).

3. **Packaging**:
   - The script sets up `main.js` to preload images from multiple zip files (`chunk_includes/images_part_*.zip`).
   - If you generate new images, run `python split_images.py` to create the split archives (Github limit workaround).

4. **Deploy**:
   - The experiment has two phases per trial:
     1. **Selection**: Select the best of 3 images (All trials).
     2. **Norming**: 
        - If `task_group == "tense"`: Choose between "He will X" / "He X'd".
        - If `task_group == "desc"`: Write a simple sentence describing the picture.
