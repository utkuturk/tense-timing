import os
import csv
import time
from google import genai
from PIL import Image
import io

# Configuration
# Users should set GOOGLE_API_KEY in their environment variables
# or paste it here (not recommended for sharing)
API_KEY = os.environ.get("GOOGLE_API_KEY") 
MODEL_ID = "gemini-2.5-flash-image" # or "gemini-3-pro-image-preview"

# Paths
OUTPUT_DIR = "chunk_includes/img"
BASE_IMG_DIR = os.path.join(OUTPUT_DIR, "base")
# items.csv should stay in chunk_includes, not img
ITEMS_CSV_PATH = os.path.join("chunk_includes", "items.csv")

os.makedirs(OUTPUT_DIR, exist_ok=True)
os.makedirs(BASE_IMG_DIR, exist_ok=True)

# Prompts
STYLE_PROMPT = "A clean black and white cartoon line drawing with bold, even black outlines, in the style of a coloring page. No shading, no gray, just black lines on white background. Minimalist details."

CHARACTERS = {
    "Wizard": "A friendly wizard character wearing a starry robe and a pointed hat with a long beard.",
    "Pirate": "A generic pirate character with an eye patch, a bandana, and a striped shirt.",
    "Chef": "A generic chef character wearing a tall white chef's hat and a double-breasted jacket."
}

# Extended Verb Pool (45 Total)
# Extended Verb Pool (45 Total)
ACTIONS = {
    # Irregular
    "eat": { "desc": "eating a shiny apple, holding it to their mouth", "past": "ate", "type": "Irregular", "obj": "an apple" },
    "drink": { "desc": "drinking from a steaming mug", "past": "drank", "type": "Irregular", "obj": "coffee" },
    "ride": { "desc": "riding a simple bicycle", "past": "rode", "type": "Irregular", "obj": "a bicycle" },
    "build": { "desc": "stacking wooden blocks to build a tall tower", "past": "built", "type": "Irregular", "obj": "a tower" },
    "swim": { "desc": "swimming in a pool", "past": "swam", "type": "Irregular", "obj": "in the pool" },
    "draw": { "desc": "drawing on a piece of paper with a pencil (the character is holding the pencil)", "past": "drew", "type": "Irregular", "obj": "a picture" },
    "swing": { "desc": "swinging on a playground swing", "past": "swung", "type": "Irregular", "obj": "on a swing" },
    "sweep": { "desc": "sweeping the floor with a traditional broom", "past": "swept", "type": "Irregular", "obj": "the floor" },
    "dig": { "desc": "digging a hole in the ground with a shovel", "past": "dug", "type": "Irregular", "obj": "a hole" },
    "run": { "desc": "running on a simple path", "past": "ran", "type": "Irregular", "obj": "along the path" },
    "write": { "desc": "writing a letter with a pen", "past": "wrote", "type": "Irregular", "obj": "a letter" },
    "drive": { "desc": "driving a convertible car (sitting inside the car)", "past": "drove", "type": "Irregular", "obj": "a car" },
    "sing": { "desc": "singing into a microphone", "past": "sang", "type": "Irregular", "obj": "a song" },
    "fly": { "desc": "flying with a jetpack", "past": "flew", "type": "Irregular", "obj": "with a jetpack" },
    "blow": { "desc": "blowing out birthday candles on a cake", "past": "blew", "type": "Irregular", "obj": "candles" },
    "spin": { "desc": "spinning a spinning top", "past": "spun", "type": "Irregular", "obj": "a top" },
    "slide": { "desc": "sliding down a playground slide", "past": "slid", "type": "Irregular", "obj": "down the slide" },
    "grind": { "desc": "grinding pepper with a grinder", "past": "ground", "type": "Irregular", "obj": "pepper" },
    "weave": { "desc": "weaving cloth on a simple loom", "past": "wove", "type": "Irregular", "obj": "cloth" },
    "feed": { "desc": "feeding a small bird", "past": "fed", "type": "Irregular", "obj": "a bird" },
    "read": { "desc": "reading a book", "past": "read", "type": "Irregular", "obj": "a book" },
    "shake": { "desc": "shaking maracas", "past": "shook", "type": "Irregular", "obj": "maracas" },
    "sew": { "desc": "sewing a piece of fabric", "past": "sewed", "type": "Irregular", "obj": "fabric" },
    "ring": { "desc": "ringing a handheld bell", "past": "rang", "type": "Irregular", "obj": "a bell" },
    "wind": { "desc": "winding thread onto a spool", "past": "wound", "type": "Irregular", "obj": "thread" },

    # Regular
    "play": { "desc": "playing an acoustic guitar", "past": "played", "type": "Regular", "obj": "the guitar" },
    "walk": { "desc": "walking on a simple path", "past": "walked", "type": "Regular", "obj": "along the path" },
    "paint": { "desc": "painting on an art canvas on an easel with a brush", "past": "painted", "type": "Regular", "obj": "a canvas" },
    "wash": { "desc": "washing a plate with a soapy sponge", "past": "washed", "type": "Regular", "obj": "a plate" },
    "push": { "desc": "pushing a shopping cart forward", "past": "pushed", "type": "Regular", "obj": "a cart" },
    "cook": { "desc": "cooking at a stove, stirring a pot", "past": "cooked", "type": "Regular", "obj": "dinner" },
    "stir": { "desc": "stirring a mixture in a bowl", "past": "stirred", "type": "Regular", "obj": "the mixture" },
    "climb": { "desc": "climbing up a simple wooden ladder", "past": "climbed", "type": "Regular", "obj": "a ladder" },
    "peel": { "desc": "peeling an orange using their hands", "past": "peeled", "type": "Regular", "obj": "an orange" },
    "dance": { "desc": "dancing with arms raised", "past": "danced", "type": "Regular", "obj": "a dance" },
    "carry": { "desc": "carrying a box", "past": "carried", "type": "Regular", "obj": "a box" },
    "pull": { "desc": "pulling a red wagon", "past": "pulled", "type": "Regular", "obj": "a wagon" },
    "pour": { "desc": "pouring water from a pitcher", "past": "poured", "type": "Regular", "obj": "water" },
    "row": { "desc": "rowing a boat", "past": "rowed", "type": "Regular", "obj": "a boat" },
    "scrub": { "desc": "scrubbing the floor with a brush", "past": "scrubbed", "type": "Regular", "obj": "the floor" },
    "polish": { "desc": "polishing a shoe", "past": "polished", "type": "Regular", "obj": "a shoe" },
    "mop": { "desc": "mopping the floor", "past": "mopped", "type": "Regular", "obj": "the floor" },
    "knit": { "desc": "knitting a scarf", "past": "knitted", "type": "Regular", "obj": "a scarf" },
    "roll": { "desc": "rolling dough with a rolling pin", "past": "rolled", "type": "Regular", "obj": "dough" },
    "spray": { "desc": "spraying water from a spray bottle", "past": "sprayed", "type": "Regular", "obj": "water" },
    "wipe": { "desc": "wiping a table with a cloth", "past": "wiped", "type": "Regular", "obj": "the table" },
    "brush": { "desc": "brushing their own hair with a hairbrush (hat is sitting on a nearby table)", "past": "brushed", "type": "Regular", "obj": "hair" },
    "dust": { "desc": "dusting a shelf with a duster", "past": "dusted", "type": "Regular", "obj": "the shelf" },
    "fold": { "desc": "folding a shirt", "past": "folded", "type": "Regular", "obj": "a shirt" },
    "iron": { "desc": "ironing a shirt", "past": "ironed", "type": "Regular", "obj": "a shirt" },
    "water": { "desc": "watering a plant", "past": "watered", "type": "Regular", "obj": "a plant" },
    "sketch": { "desc": "drawing on a piece of paper with a pencil (focused intensely on the drawing)", "past": "sketched", "type": "Regular", "obj": "a sketch" },
    "type": { "desc": "typing on a keyboard", "past": "typed", "type": "Regular", "obj": "on the keyboard" },
    "chew": { "desc": "chewing on a piece of gum", "past": "chewed", "type": "Regular", "obj": "gum" },
    "sip": { "desc": "sipping a drink from a glass", "past": "sipped", "type": "Regular", "obj": "a drink" },
    "hum": { "desc": "humming a tune with eyes closed", "past": "hummed", "type": "Regular", "obj": "a tune" },
    "rock": { "desc": "rocking in a rocking chair", "past": "rocked", "type": "Regular", "obj": "the chair" },
    "drag": { "desc": "dragging a heavy sack", "past": "dragged", "type": "Regular", "obj": "a sack" }
}

def get_client():
    api_key = os.environ.get("GOOGLE_API_KEY")
    
    # Try reading from 'token' file if env var not set
    if not api_key:
        possible_paths = ["token", "../token", "../../token"]
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
        return None
    return genai.Client(api_key=api_key)

def generate_image(client, prompt, input_image=None):
    try:
        contents = [prompt]
        if input_image:
            contents.append(input_image)
        
        # Note: Adjust model and config matching the SDK version installed
        response = client.models.generate_content(
            model=MODEL_ID,
            contents=contents,
            config=genai.types.GenerateContentConfig(
                response_modalities=['Image']
            )
        )
        for part in response.parts:
            if part.inline_data:
                 return Image.open(io.BytesIO(part.inline_data.data))
    except Exception as e:
        print(f"Generation Error: {e}")
    return None

def main():
    client = get_client()
    if not client:
        return

    # 1. Generate/Load Base Images
    base_images = {}
    for char_name, char_desc in CHARACTERS.items():
        path = os.path.join(BASE_IMG_DIR, f"{char_name.lower()}_base.png")
        if os.path.exists(path):
            print(f"Loaded base for {char_name}")
            base_images[char_name] = Image.open(path)
        else:
            print(f"Generating base for {char_name}...")
            prompt = f"{STYLE_PROMPT} {char_desc} Full body shot. Standing in a neutral pose. Isolated on white background."
            img = generate_image(client, prompt)
            if img:
                img.save(path)
                base_images[char_name] = img
                print(f"Saved {path}")
            else:
                print(f"Failed to generate base for {char_name}")

    # 2. Generate Action Images & Build CSV
    csv_rows = []
    print("\nGenerating action images...")
    
    for verb, info in ACTIONS.items():
        for char_name, base_img in base_images.items():
            
            # We need 3 variations
            row_data = {
                "verb": verb,
                "past_form": info["past"],
                "character": char_name,
                "type": info["type"],
                "sentence_past": f"The {char_name} {info['past']} {info['obj']}",
                "sentence_future": f"The {char_name} will {verb} {info['obj']}"
            }
            
            for i in range(1, 4):
                filename = f"{char_name}_{verb}_v{i}.png"
                filepath = os.path.join(OUTPUT_DIR, filename)
                col_name = f"pic{i}"
                row_data[col_name] = filename
                
                # Check if exists
                if not os.path.exists(filepath):
                    print(f"Generating {filename}...")
                    # Image-to-Image prompt
                    prompt = f"{STYLE_PROMPT} {CHARACTERS[char_name]} {info['desc']}."
                    
                    # We use the base image as reference to keep consistency
                    action_img = generate_image(client, prompt, base_images[char_name])
                    
                    if action_img:
                        action_img.save(filepath)
                        print(f"Saved {filename}")
                    else:
                        print(f"Failed to generate {filename}")
                else:
                    print(f"Skipping {filename} (exists)")

            # Add to CSV list (one row per verb+character tuple, containing 3 pics)
            csv_rows.append(row_data)

    # 3. Write items.csv
    print(f"\nWriting {ITEMS_CSV_PATH}...")
    with open(ITEMS_CSV_PATH, 'w', newline='') as csvfile:
        fieldnames = ['verb', 'past_form', 'character', 'type', 'sentence_past', 'sentence_future', 'pic1', 'pic2', 'pic3']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

        writer.writeheader()
        for row in csv_rows:
            writer.writerow(row)
    
    print("Done!")

if __name__ == "__main__":
    main()
