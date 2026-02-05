#!/usr/bin/env python3
"""
Image Temporal Neutrality Evaluator

Uses Gemini vision to score experiment images against temporal neutrality criteria.
Helps select the best version for each character-verb combination.
"""

import os
import json
import glob
from pathlib import Path
from google import genai
from PIL import Image
import io
import time
import argparse

# Configuration
IMAGE_DIR = "experiments/conceptual-task/chunk_includes"
OUTPUT_FILE = "image_evaluations.json"
MODEL_ID = "gemini-2.0-flash"  # Vision-capable model

# The evaluation prompt based on temporal neutrality constraints
EVALUATION_PROMPT = """You are a HARSH CRITIC evaluating images for a psycholinguistic experiment.

Note: ChatGPT also evaluates these images and tends to be very critical and catches subtle issues.
We need you to be AT LEAST as rigorous. Don't let obvious flaws slip by.

BE EXTREMELY STRICT. Most images should score 2-3 on each criterion, not 4-5.
A score of 5 means PERFECT - almost nothing deserves a 5.
A score of 4 means EXCELLENT - only give this if there are truly no issues.
A score of 3 means ACCEPTABLE - minor issues present.
A score of 2 means PROBLEMATIC - noticeable issues.
A score of 1 means FAIL - clear violations.

The image shows a character performing an action. We need images that work EQUALLY well for:
- PAST: "The chef ate an apple"
- FUTURE: "The chef will eat an apple"

CRITERIA - Be merciless:

1. NO COMPLETION EVIDENCE (1-5)
   Look for: empty plates, eaten food, finished products, depleted materials, completed constructions
   Even PARTIAL completion (half-eaten apple, tower mostly built) = score 2 or lower
   Any hint the action has progressed significantly = deduct points

2. NO ANTICIPATORY SETUP (1-5)
   Look for: hands reaching toward objects, "about to" poses, preparatory stances
   Character not yet touching/engaging the object = score 2 or lower
   Poised/ready position without action = deduct points

3. NO PROGRESSIVE DURATION CUES (1-5)
   Look for: sweat, exhaustion, partially consumed items, wear on objects
   Any sign of "has been doing this for a while" = score 2 or lower
   Tired expressions, rumpled appearance = deduct points

4. NO RESULT STATES (1-5)
   Look for: crumbs, spills, sawdust, debris, mess, dirt, displaced objects
   ANY visible consequence of the action = score 2 or lower
   Clean but with subtle evidence of activity = deduct points

5. MID-ACTION QUALITY (1-5)
   The character must be IN the action, not before or after
   Just holding an object ≠ mid-action (score 2)
   Object at mouth but not biting = anticipatory (score 2)
   Only truly dynamic, engaged action = score 4-5

6. OBJECT FRESHNESS (1-5)
   Objects must look completely untouched/pristine
   Bite marks, wear, use marks = score 1-2
   "Being acted upon" but showing effects = score 2-3

7. BOTH TENSES TEST (1-5) - THE ULTIMATE TEST
   Say out loud: "The [character] [past verb]" and "The [character] will [verb]"
   If the image feels more natural with ONE tense = score 1-3
   Only if GENUINELY ambiguous = score 4-5
   Be honest - most images lean toward one tense

SCORING GUIDANCE:
- Average image should total 18-22 out of 35
- Good image: 23-27
- Excellent image: 28-32
- Perfect image (rare): 33-35
- If you're giving 30+, double-check you're being critical enough

Respond in this exact JSON format:
{
    "scores": {
        "no_completion": <1-5>,
        "no_anticipatory": <1-5>,
        "no_duration_cues": <1-5>,
        "no_result_states": <1-5>,
        "mid_action": <1-5>,
        "object_freshness": <1-5>,
        "both_tenses": <1-5>
    },
    "total_score": <sum of all scores, max 35>,
    "issues": ["list EVERY problem you see, be thorough"],
    "strengths": ["only list genuine strengths"],
    "recommendation": "keep" | "maybe" | "reject",
    "notes": "brief, critical assessment"
}

Recommendation guide:
- "keep": score 28+ AND no major issues (should be RARE - maybe 10-20% of images)
- "maybe": score 22-27 OR has fixable issues
- "reject": score below 22 OR has unfixable temporal bias

IMPORTANT: The researcher is selecting the SINGLE BEST image from 5 versions of each action.
Being too generous means bad images get selected. Be discriminating.
If in doubt, score LOWER. We need to find the truly best images, not "good enough" ones.

Only output the JSON, nothing else.
"""


def get_client():
    """Get Gemini client, trying env var first, then token file."""
    api_key = os.environ.get("GOOGLE_API_KEY")

    if not api_key:
        # Check various locations, including home directory (more secure on clusters)
        home = os.path.expanduser("~")
        possible_paths = [
            os.path.join(home, ".google_api_key"),  # Secure home location
            "token",
            "experiments/norming/token",
            "../token"
        ]
        for path in possible_paths:
            if os.path.exists(path):
                try:
                    with open(path, "r") as f:
                        api_key = f.read().strip()
                    print(f"Loaded API key from {path}")
                    break
                except Exception as e:
                    print(f"Error reading {path}: {e}")

    if not api_key:
        print("Error: GOOGLE_API_KEY not set and 'token' file not found.")
        print("Set GOOGLE_API_KEY env var or create a 'token' file with your API key.")
        return None

    return genai.Client(api_key=api_key)


def evaluate_image(client, image_path, max_retries=5):
    """Send image to Gemini for temporal neutrality evaluation with retry logic."""

    for attempt in range(max_retries):
        try:
            # Load image
            img = Image.open(image_path)

            # Convert to bytes for API
            img_bytes = io.BytesIO()
            img.save(img_bytes, format='PNG')
            img_bytes.seek(0)

            # Upload image
            uploaded = client.files.upload(
                file=img_bytes,
                config={"mime_type": "image/png"}
            )

            # Generate evaluation
            response = client.models.generate_content(
                model=MODEL_ID,
                contents=[
                    uploaded,
                    EVALUATION_PROMPT
                ]
            )

            # Parse JSON response
            text = response.text.strip()
            # Handle markdown code blocks
            if text.startswith("```"):
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]

            return json.loads(text)

        except json.JSONDecodeError as e:
            print(f"  JSON parse error: {e}")
            print(f"  Raw response: {response.text[:200]}...")
            return None
        except Exception as e:
            error_str = str(e)
            # Handle rate limiting with exponential backoff
            if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                wait_time = (2 ** attempt) * 5  # 5, 10, 20, 40, 80 seconds
                print(f"  Rate limited. Waiting {wait_time}s before retry ({attempt+1}/{max_retries})...")
                time.sleep(wait_time)
                continue
            else:
                print(f"  Evaluation error: {e}")
                return None

    print(f"  Failed after {max_retries} retries due to rate limiting")
    return None


def get_image_files(image_dir, pattern="*.png"):
    """Get all image files, excluding base images."""
    all_images = glob.glob(os.path.join(image_dir, pattern))
    # Filter out base images and non-versioned files
    return [f for f in all_images
            if "_v" in os.path.basename(f)
            and "base" not in f.lower()]


def parse_filename(filepath):
    """Extract character, verb, version from filename like 'chef_eat_apple_v1.png'."""
    basename = os.path.basename(filepath)
    name = basename.replace(".png", "")

    # Handle format: character_verb_object_v#
    parts = name.rsplit("_v", 1)
    if len(parts) == 2:
        prefix = parts[0]
        version = parts[1]

        # Split prefix into character and verb_object
        prefix_parts = prefix.split("_", 1)
        if len(prefix_parts) >= 2:
            character = prefix_parts[0]
            verb_obj = prefix_parts[1]
            return {
                "character": character,
                "verb_object": verb_obj,
                "version": version,
                "combo": f"{character}_{verb_obj}"
            }

    return None


def load_existing_results(output_file):
    """Load existing evaluation results if available."""
    if os.path.exists(output_file):
        with open(output_file, 'r') as f:
            return json.load(f)
    return {"evaluations": {}, "best_picks": {}}


def save_results(results, output_file):
    """Save evaluation results to JSON."""
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2)


def select_best_versions(results):
    """Analyze results and select best version for each character-verb combo."""
    evaluations = results.get("evaluations", {})

    # Group by character_verb combo
    combos = {}
    for filepath, eval_data in evaluations.items():
        if eval_data is None:
            continue
        info = parse_filename(filepath)
        if info:
            combo = info["combo"]
            if combo not in combos:
                combos[combo] = []
            combos[combo].append({
                "filepath": filepath,
                "version": info["version"],
                "score": eval_data.get("total_score", 0),
                "recommendation": eval_data.get("recommendation", "unknown"),
                "issues": eval_data.get("issues", [])
            })

    # Select best for each combo
    best_picks = {}
    for combo, versions in combos.items():
        # Sort by score descending
        sorted_versions = sorted(versions, key=lambda x: x["score"], reverse=True)
        best = sorted_versions[0]
        best_picks[combo] = {
            "best_file": os.path.basename(best["filepath"]),
            "best_score": best["score"],
            "all_versions": sorted_versions
        }

    return best_picks


def print_summary(results):
    """Print a summary of evaluation results."""
    best_picks = results.get("best_picks", {})

    print("\n" + "="*60)
    print("EVALUATION SUMMARY")
    print("="*60)

    if not best_picks:
        print("No evaluations completed yet.")
        return

    # Sort by score
    sorted_combos = sorted(best_picks.items(),
                          key=lambda x: x[1]["best_score"],
                          reverse=True)

    print(f"\n{'Combo':<30} {'Best':<12} {'Score':<8}")
    print("-"*50)

    for combo, data in sorted_combos:
        print(f"{combo:<30} {data['best_file']:<12} {data['best_score']:<8}")

    # Statistics
    scores = [d["best_score"] for d in best_picks.values()]
    if scores:
        print(f"\nStatistics:")
        print(f"  Total combos: {len(scores)}")
        print(f"  Average best score: {sum(scores)/len(scores):.1f}/35")
        print(f"  Min: {min(scores)}, Max: {max(scores)}")

        # Count by recommendation
        keep = sum(1 for c, d in best_picks.items()
                  if d["all_versions"][0].get("recommendation") == "keep")
        maybe = sum(1 for c, d in best_picks.items()
                   if d["all_versions"][0].get("recommendation") == "maybe")
        reject = sum(1 for c, d in best_picks.items()
                    if d["all_versions"][0].get("recommendation") == "reject")
        print(f"\nRecommendations: {keep} keep, {maybe} maybe, {reject} reject")


def main():
    parser = argparse.ArgumentParser(description="Evaluate images for temporal neutrality")
    parser.add_argument("--image-dir", default=IMAGE_DIR, help="Directory containing images")
    parser.add_argument("--output", default=OUTPUT_FILE, help="Output JSON file")
    parser.add_argument("--limit", type=int, default=0, help="Limit number of images to evaluate (0=all)")
    parser.add_argument("--skip-existing", action="store_true", help="Skip already evaluated images")
    parser.add_argument("--summary-only", action="store_true", help="Just show summary of existing results")
    parser.add_argument("--filter", type=str, help="Only evaluate images matching this pattern (e.g., 'chef_eat')")
    parser.add_argument("--delay", type=float, default=3.0, help="Delay between API calls in seconds (default: 3)")
    args = parser.parse_args()

    # Load existing results
    results = load_existing_results(args.output)

    if args.summary_only:
        print_summary(results)
        return

    # Get Gemini client
    client = get_client()
    if not client:
        return

    # Get image files
    images = get_image_files(args.image_dir)

    if args.filter:
        images = [f for f in images if args.filter in os.path.basename(f)]

    if args.skip_existing:
        images = [f for f in images if f not in results["evaluations"]]

    if args.limit > 0:
        images = images[:args.limit]

    print(f"Found {len(images)} images to evaluate")

    if not images:
        print("No images to evaluate.")
        print_summary(results)
        return

    # Evaluate each image
    for i, filepath in enumerate(images):
        filename = os.path.basename(filepath)
        print(f"\n[{i+1}/{len(images)}] Evaluating {filename}...")

        eval_result = evaluate_image(client, filepath)

        if eval_result:
            results["evaluations"][filepath] = eval_result
            score = eval_result.get("total_score", "?")
            rec = eval_result.get("recommendation", "?")
            print(f"  Score: {score}/35, Recommendation: {rec}")
            if eval_result.get("issues"):
                print(f"  Issues: {', '.join(eval_result['issues'][:2])}")
        else:
            print(f"  Failed to evaluate")
            results["evaluations"][filepath] = None

        # Save after each evaluation
        results["best_picks"] = select_best_versions(results)
        save_results(results, args.output)

        # Rate limiting - wait between requests to avoid 429 errors
        time.sleep(args.delay)

    # Final summary
    print_summary(results)
    print(f"\nResults saved to {args.output}")


if __name__ == "__main__":
    main()
