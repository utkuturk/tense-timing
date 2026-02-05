#!/usr/bin/env python3
"""
CLIP-based Verb Clarity Test

Uses OpenAI's CLIP model to objectively measure how clearly each image
depicts its intended action/verb.

For each image, computes:
1. Similarity with correct verb description
2. Similarity with distractor verbs
3. Discriminability score (how much better correct verb scores vs distractors)
"""

import os
import json
import glob
import argparse
from pathlib import Path

import torch
import clip
from PIL import Image

# Configuration
IMAGE_DIR = "experiments/conceptual-task/chunk_includes"
OUTPUT_FILE = "clip_verb_scores.json"

# All verbs in the experiment (for distractors)
# All verbs in the experiment (for distractors)
# NOTE: Updated to use transitive durative verbs only
# Replaced: break→shake, throw→blow, cut→read, kick→carry, hammer→drag, light→spin
ALL_VERBS = [
    "eat", "drink", "ride", "build", "sweep", "dig", "shake", "blow",
    "read", "paint", "carry", "play", "wash", "stir", "climb", "push",
    "peel", "smell", "drag", "spin"
]

# Verb to object mapping (for generating descriptions)
VERB_OBJECTS = {
    # Irregular verbs
    "eat": "an apple",
    "drink": "coffee",
    "ride": "a bicycle",
    "build": "a tower",
    "sweep": "the floor",
    "dig": "a hole",
    "shake": "a bottle",       # replaced break
    "blow": "bubbles",        # replaced throw
    "read": "a book",         # replaced cut
    # Regular verbs
    "paint": "a canvas",
    "carry": "a box",         # replaced kick
    "play": "the guitar",
    "wash": "a dish",
    "stir": "a pot",
    "climb": "a ladder",
    "push": "a cart",
    "peel": "a banana",
    "smell": "a flower",
    # Practice verbs
    "drag": "a sack",         # replaced hammer
    "spin": "a top"           # replaced light
}


def get_device():
    """Select best available device."""
    if torch.cuda.is_available():
        return "cuda"
    elif hasattr(torch.backends, 'mps') and torch.backends.mps.is_available():
        return "mps"
    return "cpu"


def load_clip_model(device):
    """Load CLIP model."""
    print(f"Loading CLIP model on {device}...")
    model, preprocess = clip.load("ViT-B/32", device=device, jit=False)
    return model, preprocess


def parse_filename(filepath):
    """Extract character, verb, object, version from filename."""
    basename = os.path.basename(filepath)
    name = basename.replace(".png", "")

    # Handle format: character_verb_object_v#
    parts = name.rsplit("_v", 1)
    if len(parts) == 2:
        prefix = parts[0]
        version = parts[1]

        # Split: chef_eat_apple -> chef, eat_apple
        prefix_parts = prefix.split("_", 1)
        if len(prefix_parts) >= 2:
            character = prefix_parts[0]
            verb_obj = prefix_parts[1]

            # Split verb_obj: eat_apple -> eat, apple
            vo_parts = verb_obj.split("_", 1)
            verb = vo_parts[0]
            obj = vo_parts[1] if len(vo_parts) > 1 else ""

            return {
                "character": character,
                "verb": verb,
                "object": obj,
                "version": version,
                "combo": f"{character}_{verb}_{obj}"
            }
    return None


def generate_descriptions(character, verb):
    """Generate text descriptions for CLIP comparison."""
    char_name = character.capitalize()
    obj = VERB_OBJECTS.get(verb, "something")

    # Primary description (what the image SHOULD show)
    primary = f"A {char_name} {verb}ing {obj}"

    # Alternative phrasings for the correct verb
    correct_variants = [
        f"The {char_name} is {verb}ing {obj}",
        f"A person {verb}ing {obj}",
        f"{verb}ing {obj}",
        f"Someone {verb}ing"
    ]

    # Distractor verbs (all other verbs)
    distractors = []
    for other_verb in ALL_VERBS:
        if other_verb != verb:
            other_obj = VERB_OBJECTS.get(other_verb, "something")
            distractors.append(f"A {char_name} {other_verb}ing {other_obj}")

    return {
        "primary": primary,
        "correct_variants": correct_variants,
        "distractors": distractors
    }


def compute_clip_scores(model, preprocess, device, image_path, descriptions):
    """Compute CLIP similarity scores for an image against multiple text descriptions."""
    # Load and preprocess image
    img = preprocess(Image.open(image_path)).unsqueeze(0).to(device)

    # Encode all texts
    all_texts = [descriptions["primary"]] + descriptions["correct_variants"] + descriptions["distractors"]
    text_tokens = clip.tokenize(all_texts, truncate=True).to(device)

    with torch.no_grad():
        # Get image and text features
        image_features = model.encode_image(img)
        text_features = model.encode_text(text_tokens)

        # Normalize
        image_features = image_features / image_features.norm(dim=-1, keepdim=True)
        text_features = text_features / text_features.norm(dim=-1, keepdim=True)

        # Compute similarities
        similarities = (image_features @ text_features.T).squeeze(0)

    # Parse results
    n_correct = 1 + len(descriptions["correct_variants"])
    correct_scores = similarities[:n_correct].cpu().numpy().tolist()
    distractor_scores = similarities[n_correct:].cpu().numpy().tolist()

    return {
        "primary_score": correct_scores[0],
        "correct_variants_scores": correct_scores[1:],
        "distractor_scores": distractor_scores,
        "best_correct": max(correct_scores),
        "best_distractor": max(distractor_scores),
        "mean_correct": sum(correct_scores) / len(correct_scores),
        "mean_distractor": sum(distractor_scores) / len(distractor_scores) if distractor_scores else 0
    }


def compute_clarity_metrics(scores):
    """Compute overall verb clarity metrics from CLIP scores."""
    best_correct = scores["best_correct"]
    best_distractor = scores["best_distractor"]
    mean_correct = scores["mean_correct"]
    mean_distractor = scores["mean_distractor"]

    # Discriminability: how much better is correct vs best distractor
    discriminability = best_correct - best_distractor

    # Margin: how much better is correct vs mean distractor
    margin = mean_correct - mean_distractor

    # Rank: where does the correct verb rank among all options
    all_scores = [scores["primary_score"]] + scores["distractor_scores"]
    sorted_scores = sorted(all_scores, reverse=True)
    rank = sorted_scores.index(scores["primary_score"]) + 1

    # Clarity score (0-100 scale)
    # Based on discriminability and rank
    if discriminability > 0.15:
        base_score = 90
    elif discriminability > 0.10:
        base_score = 75
    elif discriminability > 0.05:
        base_score = 60
    elif discriminability > 0:
        base_score = 45
    else:
        base_score = 30

    # Penalize for bad rank
    rank_penalty = (rank - 1) * 10
    clarity_score = max(0, base_score - rank_penalty)

    return {
        "discriminability": round(discriminability, 4),
        "margin": round(margin, 4),
        "rank": rank,
        "clarity_score": clarity_score,
        "verdict": "clear" if clarity_score >= 70 else ("ambiguous" if clarity_score >= 50 else "unclear")
    }


def get_image_files(image_dir, pattern="*.png"):
    """Get all versioned image files."""
    all_images = glob.glob(os.path.join(image_dir, pattern))
    return [f for f in all_images
            if "_v" in os.path.basename(f)
            and "base" not in f.lower()
            and "good" not in f.lower()]


def load_existing_results(output_file):
    """Load existing results if available."""
    if os.path.exists(output_file):
        with open(output_file, 'r') as f:
            return json.load(f)
    return {"evaluations": {}, "rankings": {}}


def save_results(results, output_file):
    """Save results to JSON."""
    with open(output_file, 'w') as f:
        json.dump(results, f, indent=2)


def compute_rankings(results):
    """Rank versions for each character-verb combo."""
    evaluations = results.get("evaluations", {})

    # Group by combo
    combos = {}
    for filepath, data in evaluations.items():
        if data is None:
            continue
        info = parse_filename(filepath)
        if info:
            combo = f"{info['character']}_{info['verb']}_{info['object']}"
            if combo not in combos:
                combos[combo] = []
            combos[combo].append({
                "filepath": filepath,
                "version": info["version"],
                "clarity_score": data["metrics"]["clarity_score"],
                "discriminability": data["metrics"]["discriminability"],
                "rank": data["metrics"]["rank"],
                "verdict": data["metrics"]["verdict"]
            })

    # Rank versions within each combo
    rankings = {}
    for combo, versions in combos.items():
        sorted_versions = sorted(versions, key=lambda x: x["clarity_score"], reverse=True)
        rankings[combo] = {
            "best_file": os.path.basename(sorted_versions[0]["filepath"]),
            "best_clarity": sorted_versions[0]["clarity_score"],
            "all_versions": sorted_versions
        }

    return rankings


def print_summary(results):
    """Print summary of CLIP evaluations."""
    rankings = results.get("rankings", {})

    print("\n" + "=" * 70)
    print("CLIP VERB CLARITY SUMMARY")
    print("=" * 70)

    if not rankings:
        print("No evaluations yet.")
        return

    # Sort by clarity score
    sorted_combos = sorted(rankings.items(),
                          key=lambda x: x[1]["best_clarity"],
                          reverse=True)

    print(f"\n{'Combo':<35} {'Best':<20} {'Clarity':<10} {'Verdict'}")
    print("-" * 75)

    for combo, data in sorted_combos:
        best = data["all_versions"][0]
        print(f"{combo:<35} {data['best_file']:<20} {best['clarity_score']:<10} {best['verdict']}")

    # Statistics
    scores = [d["best_clarity"] for d in rankings.values()]
    if scores:
        print(f"\nStatistics:")
        print(f"  Total combos: {len(scores)}")
        print(f"  Average clarity: {sum(scores)/len(scores):.1f}/100")
        print(f"  Min: {min(scores)}, Max: {max(scores)}")

        clear = sum(1 for s in scores if s >= 70)
        ambiguous = sum(1 for s in scores if 50 <= s < 70)
        unclear = sum(1 for s in scores if s < 50)
        print(f"\n  Clear (70+): {clear}")
        print(f"  Ambiguous (50-69): {ambiguous}")
        print(f"  Unclear (<50): {unclear}")


def main():
    parser = argparse.ArgumentParser(description="CLIP-based verb clarity evaluation")
    parser.add_argument("--image-dir", default=IMAGE_DIR, help="Directory containing images")
    parser.add_argument("--output", default=OUTPUT_FILE, help="Output JSON file")
    parser.add_argument("--limit", type=int, default=0, help="Limit number of images (0=all)")
    parser.add_argument("--skip-existing", action="store_true", help="Skip already evaluated images")
    parser.add_argument("--summary-only", action="store_true", help="Just show summary")
    parser.add_argument("--filter", type=str, help="Filter images by pattern")
    args = parser.parse_args()

    # Load existing results
    results = load_existing_results(args.output)

    if args.summary_only:
        print_summary(results)
        return

    # Setup
    device = get_device()
    model, preprocess = load_clip_model(device)

    # Get images
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
        print(f"\n[{i+1}/{len(images)}] {filename}")

        info = parse_filename(filepath)
        if not info:
            print(f"  Could not parse filename")
            continue

        # Generate descriptions
        descriptions = generate_descriptions(info["character"], info["verb"])

        # Compute CLIP scores
        scores = compute_clip_scores(model, preprocess, device, filepath, descriptions)

        # Compute clarity metrics
        metrics = compute_clarity_metrics(scores)

        print(f"  Clarity: {metrics['clarity_score']}/100 ({metrics['verdict']})")
        print(f"  Discriminability: {metrics['discriminability']:.3f}, Rank: {metrics['rank']}")

        # Store results
        results["evaluations"][filepath] = {
            "info": info,
            "descriptions": {"primary": descriptions["primary"]},
            "scores": {
                "primary": scores["primary_score"],
                "best_correct": scores["best_correct"],
                "best_distractor": scores["best_distractor"]
            },
            "metrics": metrics
        }

        # Update rankings
        results["rankings"] = compute_rankings(results)
        save_results(results, args.output)

    # Final summary
    print_summary(results)
    print(f"\nResults saved to {args.output}")


if __name__ == "__main__":
    main()
