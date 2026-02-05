#!/usr/bin/env python3
"""
Select and export best images based on combined evaluation results.

Combines:
1. Gemini temporal neutrality scores (image_evaluations.json)
2. CLIP verb clarity scores (clip_verb_scores.json)

Use this to:
- Review combined rankings
- Export best images
- Generate reports
"""

import os
import json
import shutil
import argparse
from pathlib import Path

# Default files
GEMINI_FILE = "image_evaluations.json"
CLIP_FILE = "clip_verb_scores.json"
IMAGE_DIR = "experiments/conceptual-task/chunk_includes"
OUTPUT_DIR = "selected_images"

# Weights for combined scoring (adjust as needed)
DEFAULT_WEIGHTS = {
    "gemini": 0.5,  # Temporal neutrality (out of 35, normalized to 100)
    "clip": 0.5     # Verb clarity (out of 100)
}

# Verb classifications from the experiment
# NOTE: All verbs must be TRANSITIVE (take direct object) and DURATIVE (not punctual)
# Replaced punctual verbs: break→shake, throw→blow, cut→read, kick→carry
IRREGULAR_VERBS = ["shake", "build", "sweep", "ride", "drink", "blow", "read", "eat", "dig"]
REGULAR_VERBS = ["paint", "carry", "play", "wash", "stir", "climb", "push", "peel", "smell"]
EXPERIMENT_VERBS = set(IRREGULAR_VERBS + REGULAR_VERBS)

# Practice verbs (used in experiment but for practice trials only)
# Replaced punctual verbs: hammer→drag, light→spin
PRACTICE_VERBS = ["drag", "spin"]

# All verbs needed for the experiment
ALL_EXPERIMENT_VERBS = IRREGULAR_VERBS + REGULAR_VERBS + PRACTICE_VERBS  # 20 total

# Characters
CHARACTERS = ["chef", "pirate", "wizard"]

# Block structure (3I + 3R per block)
BLOCKS = {
    "block1": ["drink", "shake", "eat", "paint", "wash", "push"],      # 3I + 3R
    "block2": ["read", "sweep", "blow", "carry", "stir", "peel"],      # 3I + 3R
    "block3": ["build", "ride", "dig", "play", "climb", "smell"],      # 3I + 3R
    "practice": ["spin", "drag"]                                       # 1I + 1R
}


def get_verb_type(verb):
    """Return 'irregular', 'regular', 'practice', or 'extra' for a verb."""
    if verb in IRREGULAR_VERBS:
        return "irregular"
    elif verb in REGULAR_VERBS:
        return "regular"
    elif verb in PRACTICE_VERBS:
        return "practice"
    else:
        return "extra"


def get_verb_block(verb):
    """Return which block a verb belongs to."""
    for block_name, verbs in BLOCKS.items():
        if verb in verbs:
            return block_name
    return "unknown"


def extract_verb_from_combo(combo):
    """Extract just the verb from a combo like 'chef_eat_apple'."""
    parts = combo.split("_")
    if len(parts) >= 2:
        return parts[1]  # character_VERB_object
    return None


def load_json(filepath):
    """Load JSON file if it exists."""
    if os.path.exists(filepath):
        with open(filepath, 'r') as f:
            return json.load(f)
    return None


def normalize_path(filepath):
    """Normalize filepath for matching across datasets."""
    return os.path.basename(filepath)


def combine_evaluations(gemini_data, clip_data, weights):
    """Combine Gemini and CLIP evaluations into unified rankings."""
    combined = {}

    # Index Gemini evaluations by filename
    gemini_by_file = {}
    if gemini_data:
        for filepath, eval_data in gemini_data.get("evaluations", {}).items():
            if eval_data:
                filename = normalize_path(filepath)
                gemini_by_file[filename] = {
                    "filepath": filepath,
                    "score": eval_data.get("total_score", 0),
                    "recommendation": eval_data.get("recommendation", "unknown"),
                    "issues": eval_data.get("issues", []),
                    "notes": eval_data.get("notes", "")
                }

    # Index CLIP evaluations by filename
    clip_by_file = {}
    if clip_data:
        for filepath, eval_data in clip_data.get("evaluations", {}).items():
            if eval_data:
                filename = normalize_path(filepath)
                metrics = eval_data.get("metrics", {})
                clip_by_file[filename] = {
                    "filepath": filepath,
                    "clarity_score": metrics.get("clarity_score", 0),
                    "discriminability": metrics.get("discriminability", 0),
                    "rank": metrics.get("rank", 99),
                    "verdict": metrics.get("verdict", "unknown")
                }

    # Get all unique filenames
    all_files = set(gemini_by_file.keys()) | set(clip_by_file.keys())

    # Combine scores for each file
    for filename in all_files:
        gemini = gemini_by_file.get(filename, {})
        clip = clip_by_file.get(filename, {})

        # Get filepath from either source
        filepath = gemini.get("filepath") or clip.get("filepath", "")

        # Parse filename to get combo info
        info = parse_filename(filename)
        if not info:
            continue

        combo = info["combo"]

        # Compute normalized scores
        gemini_score = gemini.get("score", 0)
        gemini_normalized = (gemini_score / 35) * 100 if gemini_score else 0

        clip_score = clip.get("clarity_score", 0)

        # Combined score
        if gemini_score and clip_score:
            combined_score = (weights["gemini"] * gemini_normalized +
                            weights["clip"] * clip_score)
        elif gemini_score:
            combined_score = gemini_normalized
        elif clip_score:
            combined_score = clip_score
        else:
            combined_score = 0

        # Store in combo group
        if combo not in combined:
            combined[combo] = []

        # Extract verb and determine type
        verb = extract_verb_from_combo(combo)
        verb_type = get_verb_type(verb) if verb else "unknown"

        combined[combo].append({
            "filepath": filepath,
            "filename": filename,
            "version": info["version"],
            "verb": verb,
            "verb_type": verb_type,
            # Individual scores
            "gemini_score": gemini_score,
            "gemini_normalized": round(gemini_normalized, 1),
            "clip_clarity": clip_score,
            "clip_discriminability": clip.get("discriminability", 0),
            # Combined
            "combined_score": round(combined_score, 1),
            # Metadata
            "gemini_recommendation": gemini.get("recommendation", "N/A"),
            "clip_verdict": clip.get("verdict", "N/A"),
            "issues": gemini.get("issues", [])
        })

    # Sort versions within each combo by combined score
    rankings = {}
    for combo, versions in combined.items():
        sorted_versions = sorted(versions, key=lambda x: x["combined_score"], reverse=True)
        best = sorted_versions[0]
        rankings[combo] = {
            "best_file": best["filename"],
            "best_combined": best["combined_score"],
            "best_gemini": best["gemini_score"],
            "best_clip": best["clip_clarity"],
            "verb": best.get("verb", ""),
            "verb_type": best.get("verb_type", "unknown"),
            "all_versions": sorted_versions
        }

    return rankings


def print_experiment_checklist(rankings, min_score=50):
    """Verify all required images for the experiment are present and quality."""
    print("\n" + "=" * 80)
    print("EXPERIMENT COMPLETENESS CHECKLIST")
    print("=" * 80)

    # Verb object suffixes
    SUFFIXES = {
        # Practice verbs (new: spin, drag replace light, hammer)
        "spin": "top", "drag": "sack",
        # Irregular verbs (new: shake, blow, read replace break, throw, cut)
        "shake": "bottle", "build": "tower", "sweep": "floor", "ride": "bicycle",
        "drink": "coffee", "blow": "bubbles", "read": "book", "eat": "apple", "dig": "hole",
        # Regular verbs (new: carry replaces kick)
        "paint": "canvas", "carry": "box", "play": "guitar",
        "wash": "dish", "stir": "pot", "climb": "ladder", "push": "cart",
        "peel": "banana", "smell": "flower"
    }

    # Required: 20 verbs × 3 characters = 60 images
    required_combos = set()
    for character in CHARACTERS:
        for verb in ALL_EXPERIMENT_VERBS:
            obj = SUFFIXES.get(verb, "")
            combo = f"{character}_{verb}_{obj}"
            required_combos.add(combo)

    # Check what we have
    present_combos = set(rankings.keys())

    # Find missing
    missing = required_combos - present_combos

    print(f"\nRequired images: {len(required_combos)} (for counterbalancing)")
    print(f"Present images:  {len(present_combos)}")

    # Group by block
    print(f"\n{'─' * 80}")
    print("BY BLOCK (6 trials/participant, 18 images for counterbalancing):")

    for block_name, block_verbs in BLOCKS.items():
        block_label = block_name.upper()
        verb_type_counts = {"irregular": 0, "regular": 0, "practice": 0}

        # Count verb types
        for verb in block_verbs:
            verb_type_counts[get_verb_type(verb)] += 1

        n_verbs = len(block_verbs)
        n_images = n_verbs * 3

        if block_name == "practice":
            print(f"\n  {block_label} ({n_verbs} verbs × 3 characters = {n_images} images):")
        else:
            print(f"\n  {block_label} (6 trials/participant, {n_images} images for counterbalancing):")
            print(f"    Verbs: {verb_type_counts['irregular']}I + {verb_type_counts['regular']}R = {n_verbs}")

        # Display as verb rows with character columns
        print(f"\n    {'VERB':<12} {'Chef':<8} {'Pirate':<8} {'Wizard':<8}")
        print(f"    {'-'*12} {'-'*8} {'-'*8} {'-'*8}")

        for verb in block_verbs:
            verb_type = get_verb_type(verb)
            type_marker = "I" if verb_type == "irregular" else ("R" if verb_type == "regular" else "P")
            row = f"    {verb:<10}{type_marker} "

            for character in CHARACTERS:
                obj = SUFFIXES.get(verb, "")
                combo = f"{character}_{verb}_{obj}"

                if combo in rankings:
                    data = rankings[combo]
                    score = data["best_combined"]
                    status = "✓" if score >= min_score else "⚠"
                    row += f"{status}{score:>5.0f}  "
                else:
                    row += "✗ MISS  "

            print(row)

    # Summary
    print(f"\n{'=' * 60}")
    print("SUMMARY:")

    if missing:
        print(f"\n  ✗ MISSING ({len(missing)}):")
        for m in sorted(missing):
            print(f"      {m}")
    else:
        print(f"\n  ✓ All {len(required_combos)} required images present")

    # Quality check
    low_quality = [(c, d) for c, d in rankings.items()
                   if c in required_combos and d["best_combined"] < min_score]

    if low_quality:
        print(f"\n  ⚠ LOW QUALITY (score < {min_score}): {len(low_quality)}")
        for combo, data in sorted(low_quality, key=lambda x: x[1]["best_combined"]):
            print(f"      {combo}: {data['best_combined']:.1f}")
    else:
        print(f"\n  ✓ All images meet quality threshold ({min_score}+)")

    # Ready to export?
    ready = len(missing) == 0 and len(low_quality) == 0
    print(f"\n{'─' * 60}")
    if ready:
        print("  ✓ READY FOR EXPERIMENT")
    else:
        issues = []
        if missing:
            issues.append(f"{len(missing)} missing")
        if low_quality:
            issues.append(f"{len(low_quality)} low quality")
        print(f"  ✗ NOT READY: {', '.join(issues)}")


def print_balance_report(rankings, min_score=0):
    """Print report showing regular/irregular balance by character."""
    print("\n" + "=" * 80)
    print("VERB TYPE BALANCE REPORT")
    print("=" * 80)

    # Group by character
    by_character = {}
    for combo, data in rankings.items():
        parts = combo.split("_", 1)
        character = parts[0] if parts else "unknown"
        verb = data.get("verb", "")
        verb_type = data.get("verb_type", "unknown")

        if character not in by_character:
            by_character[character] = {"regular": [], "irregular": [], "extra": []}

        entry = {
            "combo": combo,
            "verb": verb,
            "score": data["best_combined"],
            "file": data["best_file"]
        }
        by_character[character][verb_type].append(entry)

    # Print by character
    for character in sorted(by_character.keys()):
        data = by_character[character]
        print(f"\n{'─' * 60}")
        print(f"  {character.upper()}")
        print(f"{'─' * 60}")

        for verb_type in ["irregular", "regular", "extra"]:
            verbs = data[verb_type]
            if not verbs:
                continue

            # Sort by score
            verbs_sorted = sorted(verbs, key=lambda x: x["score"], reverse=True)

            type_label = verb_type.upper()
            count = len(verbs)
            avg_score = sum(v["score"] for v in verbs) / count if count else 0

            print(f"\n  {type_label} ({count} verbs, avg: {avg_score:.1f}):")
            for v in verbs_sorted:
                marker = "✓" if v["score"] >= min_score else "✗"
                print(f"    {marker} {v['verb']:<12} {v['score']:>5.1f}  {v['file']}")

    # Overall summary
    print(f"\n{'=' * 60}")
    print("OVERALL BALANCE SUMMARY")
    print("=" * 60)

    total_irregular = sum(len(d["irregular"]) for d in by_character.values())
    total_regular = sum(len(d["regular"]) for d in by_character.values())
    total_extra = sum(len(d["extra"]) for d in by_character.values())

    # Scores by type
    all_irregular_scores = [v["score"] for d in by_character.values() for v in d["irregular"]]
    all_regular_scores = [v["score"] for d in by_character.values() for v in d["regular"]]

    print(f"\n  Irregular verbs: {total_irregular}")
    if all_irregular_scores:
        print(f"    Average score: {sum(all_irregular_scores)/len(all_irregular_scores):.1f}")
        print(f"    Range: {min(all_irregular_scores):.1f} - {max(all_irregular_scores):.1f}")

    print(f"\n  Regular verbs: {total_regular}")
    if all_regular_scores:
        print(f"    Average score: {sum(all_regular_scores)/len(all_regular_scores):.1f}")
        print(f"    Range: {min(all_regular_scores):.1f} - {max(all_regular_scores):.1f}")

    if total_extra:
        print(f"\n  Extra verbs (not in experiment): {total_extra}")

    # Check for missing verbs per character
    print(f"\n{'─' * 40}")
    print("  MISSING VERBS CHECK:")
    for character in sorted(by_character.keys()):
        data = by_character[character]
        present_irregular = set(v["verb"] for v in data["irregular"])
        present_regular = set(v["verb"] for v in data["regular"])

        missing_irregular = set(IRREGULAR_VERBS) - present_irregular
        missing_regular = set(REGULAR_VERBS) - present_regular

        if missing_irregular or missing_regular:
            print(f"\n  {character}:")
            if missing_irregular:
                print(f"    Missing irregular: {', '.join(sorted(missing_irregular))}")
            if missing_regular:
                print(f"    Missing regular: {', '.join(sorted(missing_regular))}")


def parse_filename(filename):
    """Extract character, verb, object, version from filename."""
    name = filename.replace(".png", "")

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
            return {
                "character": character,
                "verb_object": verb_obj,
                "version": version,
                "combo": f"{character}_{verb_obj}"
            }
    return None


def print_combined_report(rankings, min_score=0):
    """Print detailed combined report."""
    print("\n" + "=" * 90)
    print("COMBINED EVALUATION REPORT (Gemini + CLIP)")
    print("=" * 90)

    if not rankings:
        print("No evaluations found.")
        return

    # Sort by combined score
    sorted_combos = sorted(rankings.items(),
                          key=lambda x: x[1]["best_combined"],
                          reverse=True)

    for combo, data in sorted_combos:
        if data["best_combined"] < min_score:
            continue

        print(f"\n{'─' * 70}")
        print(f"  {combo.upper()}")
        print(f"{'─' * 70}")

        for v in data["all_versions"]:
            is_best = v["filename"] == data["best_file"]
            marker = "★" if is_best else " "

            gemini_str = f"{v['gemini_score']}/35" if v['gemini_score'] else "N/A"
            clip_str = f"{v['clip_clarity']}/100" if v['clip_clarity'] else "N/A"

            print(f"  {marker} v{v['version']}: Combined={v['combined_score']:>5.1f}  "
                  f"Gemini={gemini_str:<7} CLIP={clip_str:<7} "
                  f"[{v['gemini_recommendation']}/{v['clip_verdict']}]")

            if is_best and v.get("issues"):
                issues_str = ", ".join(v["issues"][:2])
                print(f"      Issues: {issues_str}")


def print_summary(rankings):
    """Print quick summary."""
    print("\n" + "=" * 80)
    print("COMBINED RANKINGS SUMMARY")
    print("=" * 80)

    if not rankings:
        print("No evaluations found.")
        return

    # Header
    print(f"\n{'Combo':<30} {'Best':<22} {'Combined':<10} {'Gemini':<10} {'CLIP':<10}")
    print("-" * 82)

    # Sort by combined score
    sorted_combos = sorted(rankings.items(),
                          key=lambda x: x[1]["best_combined"],
                          reverse=True)

    for combo, data in sorted_combos:
        gemini_str = f"{data['best_gemini']}/35" if data['best_gemini'] else "N/A"
        clip_str = f"{data['best_clip']}/100" if data['best_clip'] else "N/A"
        print(f"{combo:<30} {data['best_file']:<22} {data['best_combined']:<10.1f} "
              f"{gemini_str:<10} {clip_str:<10}")

    # Statistics
    scores = [d["best_combined"] for d in rankings.values()]
    if scores:
        print(f"\nStatistics:")
        print(f"  Total combos: {len(scores)}")
        print(f"  Average combined score: {sum(scores)/len(scores):.1f}/100")
        print(f"  Min: {min(scores):.1f}, Max: {max(scores):.1f}")

        # Count by quality tier
        excellent = sum(1 for s in scores if s >= 75)
        good = sum(1 for s in scores if 50 <= s < 75)
        poor = sum(1 for s in scores if s < 50)
        print(f"\n  Excellent (75+): {excellent}")
        print(f"  Good (50-74): {good}")
        print(f"  Poor (<50): {poor}")


def print_problems(rankings, threshold=50):
    """Show combos with low scores."""
    print(f"\n{'=' * 70}")
    print(f"PROBLEM IMAGES (Combined score < {threshold})")
    print("=" * 70)

    problems = [(combo, data) for combo, data in rankings.items()
                if data["best_combined"] < threshold]

    if not problems:
        print("No images below threshold!")
        return

    problems.sort(key=lambda x: x[1]["best_combined"])

    for combo, data in problems:
        best = data["all_versions"][0]
        print(f"\n{combo}: {data['best_combined']:.1f}/100")
        print(f"  Best version: {data['best_file']}")
        print(f"  Gemini: {best['gemini_score']}/35 ({best['gemini_recommendation']})")
        print(f"  CLIP: {best['clip_clarity']}/100 ({best['clip_verdict']})")
        if best.get("issues"):
            print(f"  Issues: {', '.join(best['issues'][:3])}")


def export_best_images(rankings, image_dir, output_dir, min_score=0, experiment_only=False):
    """Copy best images to output directory."""
    os.makedirs(output_dir, exist_ok=True)

    print(f"\nExporting best images to {output_dir}/")

    exported = 0
    skipped = 0
    skipped_extra = 0

    for combo, data in rankings.items():
        # Skip extra verbs if experiment_only
        if experiment_only and data.get("verb_type") == "extra":
            skipped_extra += 1
            continue

        if data["best_combined"] < min_score:
            skipped += 1
            continue

        best = data["all_versions"][0]
        src_path = best["filepath"]

        if src_path and os.path.exists(src_path):
            dst_name = f"{combo}.png"
            dst_path = os.path.join(output_dir, dst_name)
            shutil.copy2(src_path, dst_path)
            exported += 1
            print(f"  {best['filename']} -> {dst_name} (score: {data['best_combined']:.1f})")
        else:
            # Try to find in image_dir
            alt_path = os.path.join(image_dir, best["filename"])
            if os.path.exists(alt_path):
                dst_name = f"{combo}.png"
                dst_path = os.path.join(output_dir, dst_name)
                shutil.copy2(alt_path, dst_path)
                exported += 1
                print(f"  {best['filename']} -> {dst_name} (score: {data['best_combined']:.1f})")
            else:
                print(f"  Warning: {best['filename']} not found")

    msg = f"\nExported {exported} images, skipped {skipped} (below min score)"
    if skipped_extra:
        msg += f", {skipped_extra} (extra verbs)"
    print(msg)


def generate_csv_report(rankings, output_file="combined_selection_report.csv", experiment_only=False):
    """Generate CSV report with combined scores."""
    with open(output_file, 'w') as f:
        f.write("combo,character,verb,verb_type,best_version,combined_score,"
                "gemini_score,gemini_recommendation,clip_clarity,clip_verdict,issues\n")

        for combo, data in sorted(rankings.items()):
            verb = data.get("verb", "")
            verb_type = data.get("verb_type", "unknown")

            # Skip extra verbs if experiment_only
            if experiment_only and verb_type == "extra":
                continue

            parts = combo.split("_", 1)
            character = parts[0] if len(parts) > 0 else ""

            best = data["all_versions"][0]
            issues = "; ".join(best.get("issues", [])[:3])

            f.write(f'"{combo}","{character}","{verb}","{verb_type}",')
            f.write(f'"v{best["version"]}",{data["best_combined"]:.1f},')
            f.write(f'{best["gemini_score"] or ""},"{best["gemini_recommendation"]}",')
            f.write(f'{best["clip_clarity"] or ""},"{best["clip_verdict"]}",')
            f.write(f'"{issues}"\n')

    print(f"CSV report saved to {output_file}")


def interactive_review(rankings, image_dir):
    """Interactive review with combined scores."""
    print("\n" + "=" * 70)
    print("INTERACTIVE REVIEW (Combined Scores)")
    print("=" * 70)
    print("Commands: [Enter]=next, [1-5]=select version, [s]=skip, [q]=quit")

    changes = {}

    for combo, data in sorted(rankings.items(), key=lambda x: x[1]["best_combined"]):
        print(f"\n{'─' * 50}")
        print(f"{combo}")
        print(f"Current best: {data['best_file']} (combined: {data['best_combined']:.1f})")

        for i, v in enumerate(data["all_versions"], 1):
            marker = "→" if i == 1 else " "
            gemini_str = f"G:{v['gemini_score']}" if v['gemini_score'] else "G:N/A"
            clip_str = f"C:{v['clip_clarity']}" if v['clip_clarity'] else "C:N/A"
            print(f"  {marker} [{i}] v{v['version']}: {v['combined_score']:>5.1f} ({gemini_str}, {clip_str})")

        cmd = input("\nYour choice: ").strip().lower()

        if cmd == 'q':
            break
        elif cmd == 's':
            continue
        elif cmd.isdigit() and 1 <= int(cmd) <= len(data["all_versions"]):
            new_idx = int(cmd) - 1
            new_best = data["all_versions"][new_idx]
            changes[combo] = new_best["filepath"]
            print(f"  → Selected v{new_best['version']}")

    if changes:
        print(f"\n{len(changes)} manual overrides recorded")

    return changes


def main():
    parser = argparse.ArgumentParser(
        description="Select best images using combined Gemini + CLIP scores")

    # Input files
    parser.add_argument("--gemini-file", default=GEMINI_FILE,
                       help="Gemini evaluation results JSON")
    parser.add_argument("--clip-file", default=CLIP_FILE,
                       help="CLIP evaluation results JSON")
    parser.add_argument("--image-dir", default=IMAGE_DIR,
                       help="Source image directory")
    parser.add_argument("--output-dir", default=OUTPUT_DIR,
                       help="Output directory for selected images")

    # Weights
    parser.add_argument("--gemini-weight", type=float, default=0.5,
                       help="Weight for Gemini score (0-1)")
    parser.add_argument("--clip-weight", type=float, default=0.5,
                       help="Weight for CLIP score (0-1)")

    # Actions
    parser.add_argument("--report", action="store_true",
                       help="Print detailed report")
    parser.add_argument("--summary", action="store_true",
                       help="Print summary table")
    parser.add_argument("--balance", action="store_true",
                       help="Show regular/irregular verb balance")
    parser.add_argument("--checklist", action="store_true",
                       help="Verify all experiment images are present and quality")
    parser.add_argument("--problems", action="store_true",
                       help="Show problem images")
    parser.add_argument("--problem-threshold", type=int, default=50,
                       help="Threshold for problem images")
    parser.add_argument("--export", action="store_true",
                       help="Export best images")
    parser.add_argument("--min-score", type=float, default=0,
                       help="Minimum combined score for export")
    parser.add_argument("--csv", action="store_true",
                       help="Generate CSV report")
    parser.add_argument("--interactive", action="store_true",
                       help="Interactive review mode")
    parser.add_argument("--experiment-only", action="store_true",
                       help="Only include experiment verbs (exclude hammer, light)")

    args = parser.parse_args()

    # Load data
    gemini_data = load_json(args.gemini_file)
    clip_data = load_json(args.clip_file)

    if not gemini_data and not clip_data:
        print("Error: No evaluation data found.")
        print(f"  Tried: {args.gemini_file}, {args.clip_file}")
        print("\nRun one of these first:")
        print("  python evaluate_images.py    # Gemini temporal neutrality")
        print("  python clip_verb_clarity.py  # CLIP verb clarity")
        return

    print(f"Loaded: Gemini={'Yes' if gemini_data else 'No'}, CLIP={'Yes' if clip_data else 'No'}")

    # Combine evaluations
    weights = {
        "gemini": args.gemini_weight,
        "clip": args.clip_weight
    }
    rankings = combine_evaluations(gemini_data, clip_data, weights)

    print(f"Combined {len(rankings)} character-verb combos")
    print(f"Weights: Gemini={weights['gemini']:.0%}, CLIP={weights['clip']:.0%}")

    # Execute requested actions
    if args.report:
        print_combined_report(rankings, args.min_score)

    if args.summary:
        print_summary(rankings)

    if args.balance:
        print_balance_report(rankings, args.min_score)

    if args.checklist:
        print_experiment_checklist(rankings, args.min_score if args.min_score > 0 else 50)

    if args.problems:
        print_problems(rankings, args.problem_threshold)

    if args.csv:
        generate_csv_report(rankings, experiment_only=args.experiment_only)

    if args.interactive:
        interactive_review(rankings, args.image_dir)

    if args.export:
        export_best_images(rankings, args.image_dir, args.output_dir, args.min_score, args.experiment_only)

    # Default action if nothing specified
    if not any([args.report, args.summary, args.balance, args.checklist, args.problems,
                args.csv, args.interactive, args.export]):
        print("\nUsage:")
        print("  python select_best_images.py --summary     # Quick overview")
        print("  python select_best_images.py --checklist   # Verify experiment completeness")
        print("  python select_best_images.py --balance     # Regular/irregular balance")
        print("  python select_best_images.py --report      # Detailed report")
        print("  python select_best_images.py --problems    # Show weak images")
        print("  python select_best_images.py --csv         # Export to CSV")
        print("  python select_best_images.py --export      # Copy best images")
        print("  python select_best_images.py --interactive # Manual review")
        print("\nAdjust weights:")
        print("  --gemini-weight 0.7 --clip-weight 0.3")

        # Show quick stats
        print_summary(rankings)


if __name__ == "__main__":
    main()
