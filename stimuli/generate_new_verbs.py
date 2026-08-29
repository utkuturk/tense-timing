#!/usr/bin/env python3
"""
Generate images for new replacement verbs.

Uses Google Gemini's image generation with reference images for consistency.
Based on the experiment_materials_generator.ipynb workflow.

New verbs to generate (replacing punctual verbs):
- shake_bottle (replaces break_stick) - Irregular
- blow_bubbles (replaces throw_frisbee) - Irregular
- read_book (replaces cut_bread) - Irregular
- carry_box (replaces kick_ball) - Regular
- drag_sack (replaces hammer_nail) - Practice
- spin_top (replaces light_candle) - Practice
"""

import os
import time
import argparse
from pathlib import Path

from google import genai
from PIL import Image as PILImage

# Configuration
BASE_DIR = "experiments/conceptual-task/chunk_includes/base"
OUTPUT_DIR = "experiments/conceptual-task/chunk_includes"
# Match the Colab notebook defaults.
MODEL_ID = os.environ.get("GEMINI_MODEL_ID", "gemini-2.5-flash-image")

# Style prompt (must match existing images)
STYLE_PROMPT = """A clean black and white cartoon line drawing with bold, even black outlines,
in the style of a coloring page. No shading, no gray, just black lines on white background.
Minimalist details."""

# Character descriptions (must match base images)
CHARACTERS = {
    "wizard": "A friendly wizard character wearing a starry robe and a pointed hat with a long beard.",
    "pirate": "A generic pirate character with an eye patch, a bandana, and a striped shirt.",
    "chef": "A generic chef character wearing a tall white chef's hat and a double-breasted jacket."
}

# New verbs to generate (replacements for punctual verbs)
NEW_ACTIONS = {
    # Irregular verbs (replacements)
    "shake_bottle": "shaking a bottle vigorously to mix its contents",
    "blow_bubbles": "blowing soap bubbles from a bubble wand",
    "read_book": "reading an open book held in both hands",

    # Regular verbs (replacements)
    "carry_box": "carrying a cardboard box with both arms",

    # Practice verbs (replacements)
    "drag_sack": "dragging a heavy burlap sack along the ground",
    "spin_top": "spinning a wooden spinning top on the ground",
}

# Number of versions to generate per action
NUM_VERSIONS = 5


def get_client():
    """Get Gemini client from env var or token file."""
    api_key = os.environ.get("GOOGLE_API_KEY")

    if not api_key:
        home = os.path.expanduser("~")
        possible_paths = [
            os.path.join(home, ".google_api_key"),
            "token",
            "experiments/norming/token",
        ]
        for path in possible_paths:
            if os.path.exists(path):
                with open(path, "r") as f:
                    api_key = f.read().strip()
                print(f"Loaded API key from {path}")
                break

    if not api_key:
        print("Error: GOOGLE_API_KEY not set and token file not found.")
        print("Set GOOGLE_API_KEY env var or create ~/.google_api_key")
        return None

    return genai.Client(api_key=api_key)


def load_base_images(base_dir):
    """Load base reference images for each character."""
    base_images = {}

    for char_name in CHARACTERS.keys():
        filename = os.path.join(base_dir, f"{char_name}_base.png")
        if os.path.exists(filename):
            base_images[char_name] = PILImage.open(filename)
            print(f"  Loaded base image: {filename}")
        else:
            print(f"  Warning: Base image not found: {filename}")

    return base_images


def generate_image(client, prompt, reference_image=None, max_retries=5, model_id=MODEL_ID):
    """Generate image using Gemini with optional reference image."""

    for attempt in range(max_retries):
        try:
            contents = [prompt]
            if reference_image:
                contents.append(reference_image)

            response = client.models.generate_content(
                model=model_id,
                contents=contents,
                config=genai.types.GenerateContentConfig(
                    response_modalities=['Image']
                )
            )

            for part in response.parts:
                if image := part.as_image():
                    # Save to temp and reload as PIL
                    temp_path = "/tmp/gemini_temp.png"
                    image.save(temp_path)
                    return PILImage.open(temp_path)

            print(f"    No image in response")
            return None

        except Exception as e:
            error_str = str(e)
            if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                wait_time = (2 ** attempt) * 5
                print(f"    Rate limited. Waiting {wait_time}s...")
                time.sleep(wait_time)
                continue
            if "NOT_FOUND" in error_str or "not found" in error_str:
                print("    Model not found. Try --model-id gemini-2.5-flash-image or gemini-3-pro-image-preview.")
            else:
                print(f"    Error: {e}")
            return None

    print(f"    Failed after {max_retries} retries")
    return None


def main():
    parser = argparse.ArgumentParser(description="Generate images for new verbs")
    parser.add_argument("--base-dir", default=BASE_DIR, help="Directory with base images")
    parser.add_argument("--output-dir", default=OUTPUT_DIR, help="Output directory")
    parser.add_argument("--num-versions", type=int, default=NUM_VERSIONS, help="Versions per action")
    parser.add_argument("--character", type=str, help="Generate for specific character only")
    parser.add_argument("--action", type=str, help="Generate specific action only")
    parser.add_argument("--delay", type=float, default=2.0, help="Delay between API calls")
    parser.add_argument(
        "--model-id",
        default=MODEL_ID,
        help="Gemini model id (default: GEMINI_MODEL_ID env var or gemini-2.5-flash-image)",
    )
    parser.add_argument("--dry-run", action="store_true", help="Show what would be generated")
    parser.add_argument("--skip-existing", action="store_true", help="Skip if file exists")
    args = parser.parse_args()

    # Filter characters and actions if specified
    characters = {args.character: CHARACTERS[args.character]} if args.character else CHARACTERS
    actions = {args.action: NEW_ACTIONS[args.action]} if args.action else NEW_ACTIONS

    # Calculate total
    total = len(characters) * len(actions) * args.num_versions
    print(
        f"Generating {total} images ({len(characters)} characters × {len(actions)} actions × {args.num_versions} versions)"
    )
    print(f"Model: {args.model_id}")

    if args.dry_run:
        print("\nDry run - would generate:")
        for char in characters:
            for action in actions:
                for v in range(1, args.num_versions + 1):
                    print(f"  {char}_{action}_v{v}.png")
        return

    # Setup
    client = get_client()
    if not client:
        return

    print(f"\nLoading base images from {args.base_dir}...")
    base_images = load_base_images(args.base_dir)

    if not base_images:
        print("Error: No base images found. Cannot maintain consistency.")
        return

    os.makedirs(args.output_dir, exist_ok=True)

    # Generate images
    count = 0
    for char_name, char_desc in characters.items():
        ref_image = base_images.get(char_name)

        if not ref_image:
            print(f"\nWarning: No reference for {char_name}, skipping...")
            continue

        for action_key, action_desc in actions.items():
            # Build prompt
            full_prompt = (
                f"{STYLE_PROMPT} {char_desc} The character is {action_desc}. "
                f"Full body shot. Clear mid-action pose. Isolated on white background. "
                f"The character should be actively engaged in the action, not before or after."
            )

            for v in range(1, args.num_versions + 1):
                filename = f"{char_name}_{action_key}_v{v}.png"
                filepath = os.path.join(args.output_dir, filename)

                count += 1
                print(f"\n[{count}/{total}] {filename}")

                if args.skip_existing and os.path.exists(filepath):
                    print(f"    Skipping (exists)")
                    continue

                # Generate
                image = generate_image(
                    client,
                    full_prompt,
                    reference_image=ref_image,
                    model_id=args.model_id,
                )

                if image:
                    image.save(filepath)
                    print(f"    Saved: {filepath}")
                else:
                    print(f"    FAILED")

                time.sleep(args.delay)

    print(f"\n{'='*60}")
    print(f"Generation complete!")
    print(f"Output directory: {args.output_dir}")
    print(f"\nNext steps:")
    print(f"  1. Review generated images")
    print(f"  2. Run: python evaluate_images.py --filter shake_bottle")
    print(f"  3. Run: python clip_verb_clarity.py --filter shake_bottle")
    print(f"  4. Run: python select_best_images.py --checklist")


if __name__ == "__main__":
    main()
